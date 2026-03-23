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
	// Slice to first proper argument
	args := os.Args[1:]
	if args[0] == "--" {
		args = args[1:]
	}

	// Get file name from 1st argument
	fn := args[0]

	// Get source code from 2nd argument
	source := args[1]

	// Get runID from 3rd argument
	runId := args[2]

	// Parse the source code to create an AST file node
	fset := token.NewFileSet()
	node, err := parser.ParseFile(fset, fn, source, 0)
	if err != nil {
		log.Fatal(err)
	}

	// Traverse the AST, using Apply to rewrite nodes
	astutil.Apply(node, nil, func(c *astutil.Cursor) bool {
		n := c.Node()
		switch x := n.(type) {
		// TODO manually add import "fmt" if it isn't found...

		case *ast.FuncDecl:
			if x.Name.Name == "main" {
				// If we hit the main function insert a defer statement that calls the encode
				// events func from tracer.go, so that will run when the source program terminates,
				// And insert a function to record the start time
				x.Body.List = append([]ast.Stmt{createSetStartTimeStmt(), createDeferEncodeEventsStmt()}, x.Body.List...)
			}
		case *ast.GoStmt:
			// If we hit a Go statement, in both cases, insert 'parentId_X := getGoroutineId()' before the Go stmt in the parent body
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
		case *ast.SendStmt:
			// If we hit a send statement, c <- insert log command before that node
			// Check if it exists within a block statement, then we can insert before
			if _, parentType := c.Parent().(*ast.BlockStmt); parentType {
				c.InsertBefore(createLogChannelStmt("send-channel", x.Chan.(*ast.Ident).Name, "getGoroutineId()"))
			}
		case *ast.ExprStmt: // Detecting Receive
			// By itself '<- c', this is an expression statement
			if _, parentType := c.Parent().(*ast.BlockStmt); parentType {
				if unary, ok := x.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
				}
			}

			// Inside a function argument, foo(<- c), if the func call is by itself it exists in an expr stmt
			if call, ok := x.X.(*ast.CallExpr); ok {
				if _, parentType := c.Parent().(*ast.BlockStmt); parentType {
					// Range over the list of arguments
					for _, arg := range call.Args {
						if unary, ok := arg.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
							c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
						}
					}
				}
			}
		case *ast.AssignStmt: // within an assignment statement 'a := <-c'
			if _, parentType := c.Parent().(*ast.BlockStmt); parentType {
				for _, rhs := range x.Rhs {
					if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
						c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
					}
				}
			}
		case *ast.CommClause: // Detecting within select statements
			switch comm := x.Comm.(type) {
			case *ast.SendStmt:
				logStmt := createLogChannelStmt("send-channel", comm.Chan.(*ast.Ident).Name, "getGoroutineId()")
				x.Body = append([]ast.Stmt{logStmt}, x.Body...)
			case *ast.AssignStmt:
				if unary, ok := comm.Rhs[0].(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					logStmt := createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()")
					x.Body = append([]ast.Stmt{logStmt}, x.Body...)
				}
			case *ast.ExprStmt:
				if unary, ok := comm.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					logStmt := createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()")
					x.Body = append([]ast.Stmt{logStmt}, x.Body...)
				}
			}
		case *ast.IfStmt: // Detecting within if statements
			// TODO add proper comments
			if assign, ok := x.Init.(*ast.AssignStmt); ok {
				for _, rhs := range assign.Rhs {
					if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
						c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
					}
				}
			}
			if unary, ok := x.Cond.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
				c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
			}
		case *ast.ReturnStmt: // Detecting within a return statement 'return <- c'
			for _, result := range x.Results {
				if unary, ok := result.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
				}
			}
		case *ast.DeclStmt: // var x = <- c
			if genDecl, ok := x.Decl.(*ast.GenDecl); ok {
				for _, spec := range genDecl.Specs {
					if valueSpec, ok := spec.(*ast.ValueSpec); ok {
						for _, value := range valueSpec.Values {
							if unary, ok := value.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
								c.InsertBefore(createLogChannelStmt("receive-channel", unary.X.(*ast.Ident).Name, "getGoroutineId()"))
							}
						}
					}
				}
			}
		}

		// TODO other cases + fix error when accessing channel name if it's not direct

		return true
	})

	// Create a new Go file, which will contain the modified source code
	modified, err := os.Create(runId + "/" + fn)
	if err != nil {
		log.Fatal(err)
	}
	defer modified.Close()

	// Format rewritten AST node back to Go source code and store in instrumented file
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

// Create the AST node equivalent to Go source code 'setStartTime()'
func createSetStartTimeStmt() *ast.ExprStmt {
	return &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "setStartTime",
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

// Create the AST node equivalent to Go source code 'logGoroutine("msg", id, parentId)'
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
