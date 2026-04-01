# Variables and Declaration

In Go, every variable has a type that is known at compile time. There are two main ways to declare a variable.

## The var Keyword

The most explicit form uses `var`, for example:

```go
var name string
var age  int
var pi   float64
```

When declared this way but not assigned a value, variables are automatically set to their zero value. For int and float64 the value is `0`. For strings the value is the empty string `""`, for booleans the value is `false`, and for pointers, slices and maps the value is `nil`.

You can also declare and initialise in one step:

```go
var name string = "Alice"
var age int = 30
```

Or let Go infer the type from the value:

```go
var name = "Alice"
var age = 30
```

## Short Variable Declaration

Inside a function, you can use the short declaration operator `:=`. This is the most common form you'll see in Go code:

```go
name := "Alice"
age := 30
pi := 3.14159
```

`:=` both declares and assigns in one step, the type is always inferred. Note that `:=` can only be used inside functions; package-level variables must use `var`.

## Multiple Assignment

Go supports assigning multiple variables in a single line:

```go
x, y := 10, 20
a, b := "hello", true
```

A cool use case is swapping values without a temporary variable:

```go
x, y = y, x
```

## Constants

For values that should never change, use `const`:

```go
const MaxHealth = 100
const Pi = 3.14159
```

Constants must be assigned a value at declaration time and cannot be reassigned. By convention, multi-word constants use PascalCase rather than ALL_CAPS.

Try declaring a constant for the speed of light (`299792458` m/s) and printing it alongside a variable for distance.
