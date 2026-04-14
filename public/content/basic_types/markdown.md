# Basic Types

Go is a statically typed language. every value has a fixed type that cannot change at runtime.

## Numeric Types

Go has a range of integer and floating-point types, here are some key examples:

### Integers

- `int8` - Range: -128 to 127
- `int64` - Range: very large
- `int` - Usually same as 'int64'
- `uint` - Unsigned integer, only positive
- `byte` - Range: 0 to 255

In practice, `int` is used for most integer work unless you have a specific reason to control the size.

### Floating-point

- `float32` - Precision: ~7 decimal digits
- `float64` - Precision: ~15 decimal digits

Prefer `float64` unless you have memory constraints.

## Strings

A `string` in Go is an immutable sequence of bytes (UTF-8 encoded). String literals are written with double quotes:

```go
s := "Bonjour"
```

You can get the number of bytes with `len(s)`, and access individual bytes via index `s[0]`. To work with Unicode characters (runes) correctly, use a `for range` loop:

```go
for i, r := range "Hello" {
    fmt.Printf("index %d: %c\n", i, r)
}
```

## Booleans

`bool` has exactly two values: `true` and `false`. Go has no concept of truthy or falsy values, an `int` of `0` is not `false`, and a non-empty string is not `true`. Conditions must be explicitly boolean.

```go
isReady := true
isEmpty := false
```

## Type Conversion

Go does not perform implicit type conversion. You must convert explicitly:

```go
var x int = 42
var y float64 = float64(x) // explicit conversion
var z int = int(3.9) // truncates to 3
```

Common bugs in languages like C or JavaScript are avoided in Go because of this.

```go
// This will NOT compile:
var a int = 10
var b float64 = a // compile error: cannot use int as float64
```

Try the code on the right. Notice what happens when you try to print the type of each variable using `%T`.
