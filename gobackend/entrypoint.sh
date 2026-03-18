#!/bin/sh

# Run ast_rewriter.go passing in the source code as an argument
go run /app/ast_rewriter.go -- "$@"

# Run instrumented source file and tracer.go
go run /app/runs/instrumented.go /app/runs/tracer.go