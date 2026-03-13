package main

import (
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	"log"
	"os"
	"strconv"

	"golang.org/x/tools/go/ast/astutil"
)

func main() {
	fn := "src.go" // Later pass this as command line argument when calling from js, so pass args to main
	dir := ""      // "tmp/run-uuid/" // Not sure how it will know?

	// Parse the source code to create an AST file node
	fset := token.NewFileSet()
	node, err := parser.ParseFile(fset, dir+fn, nil, 0)
	if err != nil {
		log.Fatal(err)
	}

	// Traverse the AST, using Apply to rewrite nodes
	astutil.Apply(node, nil, func(c *astutil.Cursor) bool {
		n := c.Node()
		switch x := n.(type) {

		// If we hit anon func
		// Then we can both put a create-goroutine and end-goroutine before and after
		// need to know parent ID and current ID

		/*
			go foo()
		*/
		// becomes...
		/*
			parentID := getGoroutineID()
			go func() {
				logEvent("create-goroutine", getGoroutineID(), parentID)
				defer logEvent("end-goroutine", getGoroutineID())
				foo()
			}()
		*/

		// storeParentGoroutineId() go func() { logGoroutine("create-goroutine", getGoroutineId(), getParentGoroutineId()) defer logGoroutine("end-goroutine", getGoroutineID(), getParentGoroutineId() foo())
		//}

		/*
			go func() {
				foo()
			}()
		*/
		// becomes...
		/*
			parentID := getGoroutineID()
			go func() {
				logEvent("create-goroutine", getGoroutineID(), parentID)
				defer logEvent("end-goroutine", getGoroutineID())
				foo()
			}
		*/

		case *ast.GoStmt:
			// In both cases, insert 'parentID := getGoroutineID()', before the Go stmt
			//c.InsertBefore(createAssignStmt("parentId", "getGoroutineId"))
			c.InsertBefore(createGetParentGoroutineIdStmt())
			if funcLit, ok := x.Call.Fun.(*ast.FuncLit); ok {
				// If anonymous function

				// inline these 2 functions since they are now small enough
				logStmt := createLogGoroutineStmt("create-goroutine", "getGoroutineId()", "getParentGoroutineId()")
				deferStmt := createDeferLogGoroutineStmt("end-goroutine", "getGoroutineId()", "getParentGoroutineId()")

				funcLit.Body.List = append([]ast.Stmt{logStmt, deferStmt}, funcLit.Body.List...)
			} else {
				// If named function
				c.Replace(createGoroutineCallWrapper(x.Call))
			}

		// Once we hit a send statement, insert log command before that node, another easy case
		case *ast.SendStmt:
			//c.InsertBefore(createLogStmtWithId("channel-send", x.Chan.(*ast.Ident).Name))

		// Detecting channel receive
		// TODO

		// 1st case, by itself '<- c', this is an expression statement
		case *ast.ExprStmt:
			if unary, ok := x.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
				//c.InsertBefore(createLogStmt("channel-receive"))
			}

		// 2nd case, within in assignment statement 'a := <-c'
		case *ast.AssignStmt:
			for _, rhs := range x.Rhs {
				if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					//c.InsertBefore(createLogStmt("channel-receive"))
				}
			}

		}
		return true
	})

	// Create a new empty go file, which will become the modified file
	i := len(fn) - 3
	newFn := fn[:i] + "_instrumented" + fn[i:]
	modified, err := os.Create(dir + newFn)
	if err != nil {
		log.Fatal(err)
	}
	defer modified.Close()

	// Format AST node back to Go source code and store in modified file
	err = format.Node(modified, fset, node)
	if err != nil {
		log.Fatal(err)
	}
}

/*func createAssignStmt(lhs string, rhs string) ast.Stmt {
	newNode := &ast.AssignStmt{
		Lhs: []ast.Expr{
			&ast.Ident{
				Name: lhs,
			},
		},
		Tok: token.DEFINE,
		Rhs: []ast.Expr{
			&ast.CallExpr{
				Fun: &ast.Ident{
					Name: rhs,
				},
				Lparen:   53,
				Ellipsis: 0,
			},
		},
	}

	return newNode
}*/

func createGetParentGoroutineIdStmt() *ast.ExprStmt {
	newNode := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "storeParentGoroutineId",
			},
			Lparen:   47,
			Ellipsis: 0,
		},
	}
	return newNode
}

// TODO has to be goroutine specific, rename
func createLogGoroutineCallExpr(msg string, id string, parentId string) *ast.CallExpr {
	return &ast.CallExpr{
		Fun: &ast.Ident{
			Name: "logGoroutine",
		},
		Lparen: 35,
		Args: []ast.Expr{
			&ast.Ident{
				Name: strconv.Quote(msg),
			},
			&ast.Ident{
				Name: id,
			},
			&ast.Ident{
				Name: parentId,
			},
		},
		Ellipsis: 0,
	}
}

// TODO add proper comments to all these
func createLogGoroutineStmt(msg string, id string, parentId string) ast.Stmt {
	newNode := &ast.ExprStmt{
		X: createLogGoroutineCallExpr(msg, id, parentId),
	}
	return newNode
}

func createDeferLogGoroutineStmt(msg string, id string, parentId string) ast.Stmt {
	newNode := &ast.DeferStmt{
		Defer: 27,
		Call:  createLogGoroutineCallExpr(msg, id, parentId),
	}
	return newNode
}

func createGoroutineCallWrapper(callExpr *ast.CallExpr) ast.Stmt {
	newNode := &ast.GoStmt{
		Go: 53,
		Call: &ast.CallExpr{
			Fun: &ast.FuncLit{
				Type: &ast.FuncType{
					Func:   56,
					Params: &ast.FieldList{},
				},
				Body: &ast.BlockStmt{
					List: []ast.Stmt{
						createLogGoroutineStmt("create-goroutine", "getGoroutineId()", "getParentGoroutineId()"),
						createDeferLogGoroutineStmt("end-goroutine", "getGoroutineId()", "getParentGoroutineId()"),
						&ast.ExprStmt{
							X: callExpr,
						},
					},
				},
			},
			Lparen:   116,
			Ellipsis: 0,
		},
	}
	return newNode
}

// use above function to simplify
/*
func createWrapperDefer(callExpr *ast.CallExpr) ast.Stmt {
	newNode :=
		&ast.GoStmt{
			Go: 27,
			Call: &ast.CallExpr{
				Fun: &ast.FuncLit{
					Type: &ast.FuncType{
						Func:   30,
						Params: &ast.FieldList{},
					},
					Body: &ast.BlockStmt{
						List: []ast.Stmt{
							&ast.DeferStmt{
								Defer: 39,
								Call: &ast.CallExpr{
									Fun: &ast.Ident{
										Name: "logEvent",
									},
									Lparen: 48,
									Args: []ast.Expr{
										&ast.Ident{
											Name: strconv.Quote("end-goroutine"),
										},
									},
									Ellipsis: 0,
								},
							},
							&ast.ExprStmt{
								X: callExpr,
							},
						},
					},
				},
				Lparen:   68,
				Ellipsis: 0,
			},
		}
	return newNode
}
*/
