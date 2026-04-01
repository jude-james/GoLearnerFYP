# Switch

Go's `switch` is cleaner and more powerful than the equivalent in C, Java, or JavaScript. The most important difference is that cases do not fall through by default, so you never need to write `break`.

## Basic Switch

```go
day := "Monday"

switch day {
case "Saturday", "Sunday":
    fmt.Println("Weekend")
case "Monday":
    fmt.Println("Start of the week")
default:
    fmt.Println("Weekday")
}
```

Multiple values can share a case by separating them with commas.

## Switch with No Condition

Omit the condition and Go evaluates each case as a boolean expression, this is a cleaner alternative to long if/else if chains:

```go
score := 85

switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
case score >= 70:
    fmt.Println("C")
default:
    fmt.Println("F")
}
```

## Initialisation Statement

Like `if`, `switch` supports an initialiser:

```go
switch os := runtime.GOOS; os {
case "linux":
    fmt.Println("Linux")
case "darwin":
    fmt.Println("macOS")
default:
    fmt.Printf("Other: %s\n", os)
}
```

## Fallthrough

If you do want the next case to execute, use `fallthrough`. This is rarely needed but available:

```go
switch n := 2; n {
case 2:
    fmt.Println("two")
    fallthrough
case 3:
    fmt.Println("two or three") // also prints
}
```

## Type Switch

A type switch checks the dynamic type of an interface value, you'll see this more once you learn about interfaces:

```go
var i interface{} = "hello"

switch v := i.(type) {
case int:
    fmt.Println("int:", v)
case string:
    fmt.Println("string:", v)
default:
    fmt.Println("unknown type")
}
```

Try rewriting the grade checker from the If Else topic using a `switch` with no condition. Which reads more clearly?
