# If and else

Go's `if` statement will feel familiar if you've written in Java or C, but with a few important differences.

## Basic Syntax

Parentheses around the condition are not required. The braces `{}` are always required, even for single lined bodies:

```go
age := 20

if age >= 18 {
    fmt.Println("Adult")
} else {
    fmt.Println("Minor")
}
```

## Else if

Chain multiple conditions with `else if`:

```go
score := 72

if score >= 90 {
    fmt.Println("A")
} else if score >= 80 {
    fmt.Println("B")
} else if score >= 70 {
    fmt.Println("C")
} else {
    fmt.Println("F")
}
```

## Initialisation Statement

One of Go's nicest `if` features is the ability to run a short statement before the condition, scoped to the if else block:

```go
if n := 10; n%2 == 0 {
    fmt.Println(n, "is even")
} else {
    fmt.Println(n, "is odd")
}
// n is not accessible here
```

This pattern is extremely common when calling a function that returns a value and an error:

```go
if err := doSomething(); err != nil {
    fmt.Println("error:", err)
}
```

The variable `err` is scoped only to the `if` block, keeping the surrounding scope clean.

## No Ternary Operator

Go deliberately has no ternary operator. If you want a conditional value, write a full `if/else`:

```go
// Not valid Go:
// result := condition ? "yes" : "no"

// Do this instead:
var result string
if condition {
    result = "yes"
} else {
    result = "no"
}
```

Try modifying the grade checker on the right to also handle scores below 0 or above 100 as invalid inputs.
