package main

import (
	"fmt"
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	"log"
	"os"
	"strconv"

	"golang.org/x/tools/go/ast/astutil"
)

var goroutine_encounter int

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
		case *ast.FuncDecl:
			if x.Name.Name == "main" {
				// If we hit the main function insert a defer statement that calls the encode
				// events func from tracer.go, so that will run when the source program terminates
				x.Body.List = append([]ast.Stmt{createDeferEncodeEventsStmt()}, x.Body.List...)
			}
		case *ast.GoStmt:
			// If we hit a Go statement, in both cases, insert 'parentId_X := getGoroutineId()' before the Go stmt
			varName := fmt.Sprintf("parentId_%d", goroutine_encounter)
			c.InsertBefore(createAssignStmt(varName, "getGoroutineId()"))

			// If the goroutine is an anonymous function
			if funcLit, ok := x.Call.Fun.(*ast.FuncLit); ok {
				logStmt := createLogGoroutineStmt("create-goroutine", "getGoroutineId()", varName)
				deferStmt := createDeferLogGoroutineStmt("end-goroutine", "getGoroutineId()", varName)

				funcLit.Body.List = append([]ast.Stmt{logStmt, deferStmt}, funcLit.Body.List...)
			} else { // If the goroutine is a named function
				// Replace the node with an anonymous goroutine to capture it's start and end
				c.Replace(createGoroutineCallWrapper(x.Call))
			}

			goroutine_encounter++

		// TODO Detecting channel creation
		// TODO eventually capture the names of the go funcs

		// If we hit a send statement, insert log command before that node
		case *ast.SendStmt:
			c.InsertBefore(createLogChannelStmt("send-channel", x.Chan.(*ast.Ident).Name, "getGoroutineId()"))
		// Receive 1st case, by itself '<- c', this is an expression statement
		case *ast.ExprStmt:
			if unary, ok := x.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
				c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
			}
		// Receive 2nd case, within in assignment statement 'a := <-c'
		case *ast.AssignStmt:
			for _, rhs := range x.Rhs {
				if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
				}
			}
		}

		// TODO other harder cases

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

// Create the AST node equivalent to Go source code 'defer encodeEventsToJson()'
func createDeferEncodeEventsStmt() *ast.DeferStmt {
	return &ast.DeferStmt{
		Defer: 27,
		Call: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "encodeEventsToJson",
			},
			Lparen:   50,
			Ellipsis: 0,
		},
	}
}

// Create the AST node equivalent to Go source code 'logChannel("msg", fmt.Sprintf("%p", id), getGoroutineId())'
func createLogChannelStmt(msg string, id string, parentId string) *ast.ExprStmt {
	newNode := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logChannel",
			},
			Lparen: 37,
			Args: []ast.Expr{
				&ast.Ident{
					Name: strconv.Quote(msg),
				},
				&ast.CallExpr{
					Fun: &ast.SelectorExpr{
						X: &ast.Ident{
							Name: "fmt",
						},
						Sel: &ast.Ident{
							Name: "Sprintf",
						},
					},
					Lparen: 64,
					Args: []ast.Expr{
						&ast.BasicLit{
							ValuePos: 65,
							Kind:     token.STRING,
							Value:    "\"%p\"",
						},
						&ast.Ident{
							Name: id,
						},
					},
					Ellipsis: 0,
				},
				&ast.Ident{
					Name: parentId,
				},
			},
			Ellipsis: 0,
		},
	}

	return newNode
}

// Create the AST node equivalent to Go source code 'lhs := rhs'
func createAssignStmt(lhs string, rhs string) ast.Stmt {
	newNode := &ast.AssignStmt{
		Lhs: []ast.Expr{
			&ast.Ident{
				Name: lhs,
			},
		},
		Tok: token.DEFINE,
		Rhs: []ast.Expr{
			&ast.Ident{
				Name: rhs,
			},
		},
	}

	return newNode
}

// Create the AST node equivalent to Go source code 'lhs := rhs'
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

// Create the AST node equivalent to Go source code 'logGoroutine("msg", id, parentId)'
func createLogGoroutineStmt(msg string, id string, parentId string) ast.Stmt {
	newNode := &ast.ExprStmt{
		X: createLogGoroutineCallExpr(msg, id, parentId),
	}
	return newNode
}

// Create the AST node equivalent to Go source code 'defer logGoroutine("msg", id, parentId)'
func createDeferLogGoroutineStmt(msg string, id string, parentId string) ast.Stmt {
	newNode := &ast.DeferStmt{
		Defer: 27,
		Call:  createLogGoroutineCallExpr(msg, id, parentId),
	}
	return newNode
}

// Create the AST node similar to Go source code 'go func() { logGoroutine(...) defer logGoroutine(...) callExpr()}()'
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
						createLogGoroutineStmt("create-goroutine", "getGoroutineId()", fmt.Sprintf("parentId_%d", goroutine_encounter)),
						createDeferLogGoroutineStmt("end-goroutine", "getGoroutineId()", fmt.Sprintf("parentId_%d", goroutine_encounter)),
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
