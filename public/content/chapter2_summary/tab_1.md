## Go's type system is strict

Types are fixed at compile time and conversions must be explicit.

```go
x := 42
y := float64(x) // must convert explicitly
```

Use `int` and `float64` for numbers. Use `string` for text, `bool` for true/false, and `rune` when working with individual Unicode characters.