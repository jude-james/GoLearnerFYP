# Arrays and Slices

Go has two closely related sequence types: arrays and slices. In practice you'll use slices almost exclusively, but understanding arrays first makes slices easier to grasp.

## Arrays

An array has a fixed length that is part of its type. Once declared, you cannot change its size:

```go
var scores [3]int
names := [3]string{"Alice", "Bob", "Carol"}
```

The length is part of the type, `[3]int` and `[4]int` are completely different types and cannot be compared or assigned to each other. This rigidity is why arrays are rarely used directly.

## Slices

A slice is a dynamically-sized view into an array.

```go
primes := []int{2, 3, 5, 7, 11}
```

Key operations:

```go
len(primes)     // Current number of elements
cap(primes)     // capacity of underlying array
primes[0]       // zero-indexed access
primes[1:3]     // slice of indices 1 and 2
```

### Appending Elements

Use the built-in `append` function to grow a slice:

```go
primes = append(primes, 13)
```

`append` returns a new slice (possibly backed by a new array if the capacity was exceeded), so you must assign the result back.

### Creating Slices with make

When you know the size up front, `make` is more efficient than growing with `append`:

```go
scores := make([]int, 5)     // length 5, capacity 5
buffer := make([]int, 0, 10) // length 0, capacity 10
```

### Iterating with for range

The cleanest way to iterate over a slice is with `for range`:

```go
for i, v := range primes {
    fmt.Printf("primes[%d] = %d\n", i, v)
}
```

If you only need the value and not the index, use `_` to discard it:

```go
for _, v := range primes {
    fmt.Println(v)
}
```

Try modifying the code on the right to append the number `13` to the `primes` slice and then print the full slice.
