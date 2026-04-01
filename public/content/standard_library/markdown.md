# The Standard Library

Go ships with an expansive standard library, a large collection of packages covering everything from mathematics and string manipulation to networking and file I/O.

## Common Packages

Here are a few standard library packages you'll encounter frequently:

- `fmt` Formatted printing and scanning

- `math` Mathematical functions (`Sqrt`, `Abs`, `Pow`, etc.) 

- `strings` String manipulation (`Contains`, `Split`, `ToUpper`, etc.)

- `strconv` Converting between strings and other types

- `os` Interacting with the operating system (files, args, env vars)

- `time` Working with dates and times

## Using Multiple Packages

Let's use `fmt` and `math` together:

```go
package main

import (
    "fmt"
    "math"
)

func main() {
    fmt.Println("Square root of 16:", math.Sqrt(16))
    fmt.Println("Pi is approximately:", math.Pi)
}
```

## Finding Documentation

Go has excellent built-in documentation. Every package in the standard library is documented at [pkg.go.dev](https://pkg.go.dev/std). 

Try modifying the code on the right to also print the ceiling of 2.7 using `math.Ceil`.
