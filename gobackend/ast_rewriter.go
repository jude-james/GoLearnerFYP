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

var goroutineCount int

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

	// Get runId from 3rd argument
	runId := args[2]

	// Parse the source code to create an AST file node
	fset := token.NewFileSet()
	node, err := parser.ParseFile(fset, fn, source, 0)
	if err != nil {
		log.Fatal(err)
	}

	node = rewrite(node)

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

// Traverses the AST file root node and rewrites the node with Apply
func rewrite(file *ast.File) *ast.File {
	astutil.Apply(file, nil, func(c *astutil.Cursor) bool {
		n := c.Node()
		switch x := n.(type) {
		case *ast.FuncDecl:
			if x.Name.Name == "main" {
				x.Body.List = append([]ast.Stmt{createOnMainStartStmt(), createDeferOnMainEndStmt()}, x.Body.List...)
			}
		case *ast.GoStmt:
			// Insert 'parentId_X := getGoroutineId()' before the Go stmt in the parent body
			varName := fmt.Sprintf("parentId_%d", goroutineCount)
			c.InsertBefore(createAssignStmt(varName, "getGoroutineId()"))

			// Anonymous function
			if funcLit, ok := x.Call.Fun.(*ast.FuncLit); ok {
				logStmt := createLogGoStmt("create-goroutine", "getGoroutineId()", varName, "")
				deferStmt := createDeferLogGoStmt("end-goroutine", "getGoroutineId()", varName, "")

				funcLit.Body.List = append([]ast.Stmt{logStmt, deferStmt}, funcLit.Body.List...)
			} else { // Named function
				c.Replace(createGoCallWrapper(x.Call))
			}

			goroutineCount++
		case *ast.SendStmt:
			// If the parent node is a CommClause then this send statement is within a select
			// and InsertBefore won't work, skip and handle in select case
			if _, ok := c.Parent().(*ast.CommClause); ok {
				return true
			}

			// Only get value if it's a basic lit or ident, ignore other cases
			var value string
			switch v := x.Value.(type) {
			case *ast.BasicLit:
				value = v.Value
			case *ast.Ident:
				value = v.Name
			default:
				value = strconv.Quote("")
			}

			// If the chan is a simple identifier then log the event with the chan itself, otherwise ignore
			if ident, ok := x.Chan.(*ast.Ident); ok {
				c.InsertBefore(createLogSendChanStmt(ident.Name, "getGoroutineId()", value))
			}
		case *ast.ExprStmt:
			// Receive by itself '<- c', this is an expression statement

			// Check this node exists within a block before inserting before, and same for others
			if _, ok := c.Parent().(*ast.BlockStmt); ok {
				if unary, ok := x.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					if ident, ok := unary.X.(*ast.Ident); ok {
						c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
					}
				}
			}

			// Inside a function argument, foo(<- c), if the func call is by itself it exists in an expr stmt
			if call, ok := x.X.(*ast.CallExpr); ok {
				if _, ok := c.Parent().(*ast.BlockStmt); ok {
					for _, arg := range call.Args {
						if unary, ok := arg.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
							if ident, ok := unary.X.(*ast.Ident); ok {
								c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
							}
						}
					}
				}
			}
		case *ast.AssignStmt:
			// within an assignment statement 'a := <-c'
			if _, ok := c.Parent().(*ast.BlockStmt); ok {
				for _, rhs := range x.Rhs {
					if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
						if ident, ok := unary.X.(*ast.Ident); ok {
							c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
						}
					}
				}
			}
		case *ast.CommClause:
			// Detecting send and receive within select statements
			switch comm := x.Comm.(type) {
			case *ast.SendStmt:
				// Only get value if it's a basic lit or ident, ignore other cases
				var value string
				switch v := comm.Value.(type) {
				case *ast.BasicLit:
					value = v.Value
				case *ast.Ident:
					value = v.Name
				default:
					value = strconv.Quote("")
				}

				logStmt := createLogSendChanStmt(comm.Chan.(*ast.Ident).Name, "getGoroutineId()", value)
				x.Body = append([]ast.Stmt{logStmt}, x.Body...)
			case *ast.AssignStmt:
				if unary, ok := comm.Rhs[0].(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					if ident, ok := unary.X.(*ast.Ident); ok {
						logStmt := createLogRecChanStmt(ident.Name, "getGoroutineId()")
						x.Body = append([]ast.Stmt{logStmt}, x.Body...)
					}
				}
			case *ast.ExprStmt:
				if unary, ok := comm.X.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					if ident, ok := unary.X.(*ast.Ident); ok {
						logStmt := createLogRecChanStmt(ident.Name, "getGoroutineId()")
						x.Body = append([]ast.Stmt{logStmt}, x.Body...)
					}
				}
			}
		case *ast.IfStmt:
			// Receive within if statements
			if assign, ok := x.Init.(*ast.AssignStmt); ok {
				for _, rhs := range assign.Rhs {
					if unary, ok := rhs.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
						if ident, ok := unary.X.(*ast.Ident); ok {
							c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
						}
					}
				}
			}

			if unary, ok := x.Cond.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
				if ident, ok := unary.X.(*ast.Ident); ok {
					c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
				}
			}
		case *ast.ReturnStmt:
			// Receive within a return statement 'return <- c'
			for _, result := range x.Results {
				if unary, ok := result.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
					if ident, ok := unary.X.(*ast.Ident); ok {
						c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
					}
				}
			}
		case *ast.DeclStmt:
			// Receive within a declaration 'var x = <- c'
			if genDecl, ok := x.Decl.(*ast.GenDecl); ok {
				for _, spec := range genDecl.Specs {
					if valueSpec, ok := spec.(*ast.ValueSpec); ok {
						for _, value := range valueSpec.Values {
							if unary, ok := value.(*ast.UnaryExpr); ok && unary.Op == token.ARROW {
								if ident, ok := unary.X.(*ast.Ident); ok {
									c.InsertBefore(createLogRecChanStmt(ident.Name, "getGoroutineId()"))
								}
							}
						}
					}
				}
			}
		case *ast.RangeStmt:
			if ident, ok := x.X.(*ast.Ident); ok {
				logStmt := createLogRecChanStmt(ident.Name, "getGoroutineId()")
				x.Body.List = append([]ast.Stmt{logStmt}, x.Body.List...)
			}
		}
		return true
	})

	return file
}

// Create the AST node equivalent to Go source code 'onMainStart()'
func createOnMainStartStmt() *ast.ExprStmt {
	return &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "onMainStart",
			},
			Lparen:   50,
			Ellipsis: 0,
		},
	}
}

// Create the AST node equivalent to Go source code 'defer onMainEnd()'
func createDeferOnMainEndStmt() *ast.DeferStmt {
	return &ast.DeferStmt{
		Defer: 27,
		Call: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "onMainEnd",
			},
			Lparen:   50,
			Ellipsis: 0,
		},
	}
}

// Creates a new AST expression statement node to log a send-channel event, passing in the value identifier
func createLogSendChanStmt(channel string, parentId string, value string) *ast.ExprStmt {
	newNode := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logSendChannel",
			},
			Lparen: 37,
			Args: []ast.Expr{
				&ast.Ident{
					Name: channel,
				},
				&ast.Ident{
					Name: parentId,
				},
				&ast.Ident{
					Name: value,
				},
			},
			Ellipsis: 0,
		},
	}

	return newNode
}

// Creates a new AST expression statement node to log a receive-channel event
func createLogRecChanStmt(channel string, parentId string) *ast.ExprStmt {
	newNode := &ast.ExprStmt{
		X: &ast.CallExpr{
			Fun: &ast.Ident{
				Name: "logReceiveChannel",
			},
			Lparen: 37,
			Args: []ast.Expr{
				&ast.Ident{
					Name: channel,
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

// Creates a new call expression AST node, equivalent to go source code 'logGoroutine("event", id, parentId, "name")'
func createLogGoCallExpr(event string, id string, parentId string, name string) *ast.CallExpr {
	return &ast.CallExpr{
		Fun: &ast.Ident{
			Name: "logGoroutine",
		},
		Lparen: 35,
		Args: []ast.Expr{
			&ast.Ident{
				Name: strconv.Quote(event),
			},
			&ast.Ident{
				Name: id,
			},
			&ast.Ident{
				Name: parentId,
			},
			&ast.Ident{
				Name: strconv.Quote(name),
			},
		},
		Ellipsis: 0,
	}
}

// Creates a new AST statement node to log a goroutine event
func createLogGoStmt(event string, id string, parentId string, name string) ast.Stmt {
	newNode := &ast.ExprStmt{
		X: createLogGoCallExpr(event, id, parentId, name),
	}
	return newNode
}

// Create a new AST defer statement node to log a goroutine event
func createDeferLogGoStmt(event string, id string, parentId string, name string) ast.Stmt {
	newNode := &ast.DeferStmt{
		Defer: 27,
		Call:  createLogGoCallExpr(event, id, parentId, name),
	}
	return newNode
}

// Takes in the call expression from the goroutine call and wraps it into an anonymous goroutine call
// Adds log statements to body as well as original call expression, and passes in the function name
func createGoCallWrapper(callExpr *ast.CallExpr) ast.Stmt {
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
						createLogGoStmt("create-goroutine", "getGoroutineId()", fmt.Sprintf("parentId_%d", goroutineCount), callExpr.Fun.(*ast.Ident).Name),
						createDeferLogGoStmt("end-goroutine", "getGoroutineId()", fmt.Sprintf("parentId_%d", goroutineCount), callExpr.Fun.(*ast.Ident).Name),
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
