## If/else works like you'd expect

The difference in Go is there are no parentheses around conditions, and braces are always required. 

```go
if x > y {
    fmt.Println(x)
}
```

The initialisation statement is a handy Go addition. It scopes a variable to just the if block.

```go
if err := doWork(); err != nil {
    fmt.Println(err)
}
```