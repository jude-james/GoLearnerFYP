#!/bin/sh

# Stop executing upon a non zero error code
set -e

# Run ast_rewriter.go passing in the file name and source code as an argument
go run /app/ast_rewriter.go -- "$@"

# Then run instrumented source file and tracer.go
timeout -s SIGKILL $TIMEOUT go run /app/runs/$1 /app/runs/tracer.go