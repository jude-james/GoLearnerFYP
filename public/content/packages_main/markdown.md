# Packages and the main Function

Every Go program is made up of packages. A package is simply a collection of Go source files in the same directory, it's Go's way of organising code into reusable units.

## The main Package

When you want to write a program that actually runs (rather than a library for others to use), you must declare a special package called `main`:

```go
package main
```

This tells the Go compiler that this package is an executable entry point.

Inside the `main` package, you must define a function also called `main`. This is where your program starts executing:

```go
package main

func main() {
    // Entry point
}
```

## Importing Packages

On its own, Go's core language is deliberately minimal. Useful functionality like printing to the screen lives in the standard library, a collection of packages that ships with Go.

You bring packages into scope using `import`:

```go
import "fmt"
```

`fmt` (short for format) is the standard library package for formatted input and output. To import multiple packages, use a grouped import block, this is the idiomatic Go style:

```go
import (
    "fmt"
    "math"
)
```

> **Note:** Go enforces that every imported package must be used. If you import `math` but never call anything from it, your program will **not compile**. Try it out and observe the error message.

## Printing Output

The most common functions in `fmt` are:

- `fmt.Println(...)` Prints arguments separated by spaces, adds a newline

- `fmt.Print(...)` Prints arguments, no automatic newline

- `fmt.Printf(format, ...)` Prints using a format string (like C's `printf`)

## Putting It Together

Here is the simplest complete Go program:

```go
package main

import "fmt"

func main() {
    fmt.Println("Oh Hello, Go.")
}
```

Try running the code on the right. Then modify the message. What happens if you remove the `import "fmt"` line?
