#!/bin/sh

# Stop executing upon a non zero error code
set -e

# Run ast_rewriter.go passing in the source code as an argument
go run /app/ast_rewriter.go "$1"

# Run instrumented source file and tracer.go
go run /app/runs/instrumented.go /app/runs/tracer.go