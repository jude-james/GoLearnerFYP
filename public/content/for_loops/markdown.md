# The for Loop

Go has just one looping construct: `for`. Despite this, it covers every looping pattern you'd ever need.

## Basic for Loop

```go
for i := 0; i < 5; i++ {
    fmt.Println(i)
}
```

The three parts (initialiser; condition; post statement) are all optional.

## While-style Loop

Omit the initialiser and post statement and you get a `while` loop:

```go
n := 1
for n < 100 {
    n *= 2
}
fmt.Println(n)
```

## Infinite Loop

Omit everything for a loop that runs forever (use `break` to exit):

```go
for {
    fmt.Println("looping...")
    break // remove this to loop forever
}
```

## For range

The `range` form iterates over slices, arrays, maps, strings, and channels. It returns an index and a value on each iteration:

```go
fruits := []string{"apple", "banana", "cherry"}

for i, fruit := range fruits {
    fmt.Printf("%d: %s\n", i, fruit)
}
```

Discard the index with `_` if you don't need it:

```go
for _, fruit := range fruits {
    fmt.Println(fruit)
}
```

Over a map:

```go
ages := map[string]int{"Alice": 30, "Bob": 25}
for name, age := range ages {
    fmt.Printf("%s is %d\n", name, age)
}
```

Over a string, `range` yields Unicode code points (runes), not bytes:

```go
for i, r := range "Hello" {
    fmt.Printf("%d: %c\n", i, r)
}
```

## Break and continue

- `break` - exits the innermost loop immediately
- `continue` - skips the rest of the current iteration and moves to the next

```go
for i := 0; i < 10; i++ {
    if i%2 == 0 {
        continue // skip even numbers
    }
    if i > 7 {
        break // stop at 7
    }
    fmt.Println(i) // prints 1, 3, 5, 7
}
```

Try the code on the right. Add a `continue` statement to skip any fruit whose name starts with the letter `"b"`.
