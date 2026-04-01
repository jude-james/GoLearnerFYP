# Formatted Output with fmt

The `fmt` package is one you'll use in almost every Go program. Beyond simple printing, it gives you control over how values are displayed using format verbs.

## Format Verbs

A format verb is a placeholder in a format string, always starting with `%`. When you call `fmt.Printf`, each verb is replaced by the corresponding argument:

```go
fmt.Printf("Name: %s, Age: %d\n", "Alice", 30)
// Output: Name: Alice, Age: 30
```

Here are the most useful verbs:

- `%d` - Integer (decimal)
- `%f` - Floating-point
- `%.2f` - Float with 2 decimal places
- `%s` - String
- `%t` - Boolean
- `%v` - Default format for any value
- `%T` - Type of the value
- `%p` - Pointer address

When you're not sure which verb to use, `%v` is your friend. It prints any value in a sensible default format:

```go
fmt.Printf("%v\n", 42)       // 42
fmt.Printf("%v\n", 3.14)     // 3.14
fmt.Printf("%v\n", true)     // true
fmt.Printf("%v\n", "hello")  // hello
```

## Building Strings with fmt.Sprintf

`fmt.Sprintf` works exactly like `fmt.Printf` but returns a string instead of printing it. This is useful when you want to build a formatted string to store or pass around:

```go
greeting := fmt.Sprintf("Hello, %s! You are %d years old.", "Bob", 25)
fmt.Println(greeting)
// Output: Hello, Bob! You are 25 years old.
```

## Newlines and Tabs

Within format strings you can use standard escape sequences:

- `\n` — newline
- `\t` — tab
- `\\` — literal backslash
- `\"` — literal double quote

The code on the right demonstrates several format verbs. Try adding a line that prints the type of the variable `score` using `%T`.
