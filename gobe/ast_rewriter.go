package gobe

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
	fn := "src.go"         // Later pass this as command line argument when calling from js, so pass args to main
	dir := "tmp/run-uuid/" // Not sure how it will know?

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
		// Once we hit a Go statement, insert the log command before that node, this is the easiest case
		case *ast.GoStmt:
			c.InsertBefore(createLogStmt("create-goroutine"))

			// Now log when goroutine ends
			if funcLit, ok := x.Call.Fun.(*ast.FuncLit); ok {
				deferStmt := createDeferStmt("goroutine-end")
				funcLit.Body.List = append([]ast.Stmt{deferStmt}, funcLit.Body.List...)
			} else {
				c.Replace(createWrapperDefer(x.Call))
			}

		// Once we hit a send statement, insert log command before that node, another easy case
		case *ast.SendStmt:
			c.InsertBefore(createLogStmtWithId("channel-send", x.Chan.(*ast.Ident).Name))

		// Detecting channel receive
		// TODO

		// 1st case, by itself '<- c', this is an expression statement
		case *ast.ExprStmt:
			if unary, ok := x.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
				c.InsertBefore(createLogStmt("channel-receive"))
			}

		// 2nd case, within in assignment statement 'a := <-c'
		case *ast.AssignStmt:
			for _, rhs := range x.Rhs {
				if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					c.InsertBefore(createLogStmt("channel-receive"))
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

func createLogStmt(message string) ast.Stmt {
	// Create a new AST node, equivalent to calling logEvent(name) from tracer
	newLogStmt := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logEvent",
			},
			Lparen: 35,
			Args: []ast.Expr{
				&ast.BasicLit{
					Kind:  token.STRING,
					Value: strconv.Quote(message),
				},
			},
			Ellipsis: 0,
		},
	}

	return newLogStmt
}

func createLogStmtWithId(message string, id string) ast.Stmt {
	newLogStmt := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logEvent",
			},
			Lparen: 35,
			Args: []ast.Expr{
				&ast.BasicLit{
					Kind:  token.STRING,
					Value: strconv.Quote(message),
				},
				&ast.BasicLit{
					Kind:  token.STRING,
					Value: id,
				},
			},
			Ellipsis: 0,
		},
	}

	return newLogStmt
}

func createDeferStmt(message string) ast.Stmt {
	newNode := &ast.DeferStmt{
		Defer: 27,
		Call: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logEvent",
			},
			Lparen: 41,
			Args: []ast.Expr{
				&ast.Ident{
					Name: strconv.Quote(message),
				},
			},
			Ellipsis: 0,
		},
	}
	return newNode
}

// use above function to simplify
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
