#!/bin/sh

# Stop executing upon a non zero error code
set -e

# Run ast_rewriter.go passing in the file name, source code, and runId as arguments
go run /app/ast_rewriter.go -- "$@"

# Then run instrumented source file and tracer together
timeout -s SIGKILL $TIMEOUT go run /app/$3/$1 /app/$3/tracer.go "$3"