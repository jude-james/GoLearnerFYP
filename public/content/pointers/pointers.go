package main

import "fmt"

func main() {
	x := 42
	p := &x

	fmt.Println("Value of x:", x)
	fmt.Println("Address of x (p):", p)
	fmt.Println("Value via *p:", *p)

	// Modify x through the pointer
	*p = 100
	fmt.Println("x after *p = 100:", x)

	// Nil pointer
	var q *int
	fmt.Println("\nNil pointer q:", q)

	// TODO: declare a variable y := 7
	// get a pointer to it, then change y to 99 through the pointer
	// print y to confirm it changed
}
