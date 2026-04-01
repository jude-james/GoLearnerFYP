## Two ways to declare a variable

Use `var` for package-level variables or when you want to be explicit. 

```go
var name string = "Alice"
```

Use `:=` inside functions for brevity. This is the most common form.
```go
age := 30
```

Undeclared variables always start at their zero value: `0`, `""`, or `false`.