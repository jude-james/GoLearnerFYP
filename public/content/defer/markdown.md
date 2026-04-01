# Defer

`defer` schedules a function call to run just before the surrounding function returns, regardless of whether it returns normally or due to a panic. It's one of Go's most distinctive and useful features.

## Basic Usage

```go
func main() {
    defer fmt.Println("world")
    fmt.Println("hello")
}
// Output:
// hello
// world
```

The deferred call runs after `main` finishes its normal execution.

## Why Is This Useful?

The most common use of `defer` is cleanup. Things like closing files, releasing locks, closing database connections. By placing the cleanup call immediately after the resource is opened, you avoid forgetting it later:

```go
func readFile(filename string) error {
    f, err := os.Open(filename)
    if err != nil {
        return err
    }
    defer f.Close() // guaranteed to run when readFile returns

    // work with f ...
    return nil
}
```

Without `defer`  you'd have to remember to call `f.Close()` before every `return` statement, and if you forget one, you have a resource leak.

## Multiple Defers

If you defer multiple calls, they execute in last-in, first-out (LIFO) order, like a stack:

```go
func main() {
    defer fmt.Println("first deferred")
    defer fmt.Println("second deferred")
    defer fmt.Println("third deferred")
    fmt.Println("main body")
}
// Output:
// main body
// third deferred
// second deferred
// first deferred
```

## Deferred Arguments Are Evaluated Immediately

The arguments to a deferred function are evaluated when the defer statement is reached, not when it executes:

```go
x := 10
defer fmt.Println("deferred x:", x) // captures 10 now
x = 20
fmt.Println("current x:", x)
// Output:
// current x: 20
// deferred x: 10
```

This can surprise people, keep it in mind.

Try altering the for loop on the right to defer the output and observe the LIFO ordering.
