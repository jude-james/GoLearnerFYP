package main

import "fmt"

func main() {
	var i int = 42
	var f float64 = 3.14159
	var s string = "Go"
	var b bool = true

	// Print values and their types
	fmt.Printf("i = %v (type: %T)\n", i, i)
	fmt.Printf("f = %v (type: %T)\n", f, f)
	fmt.Printf("s = %v (type: %T)\n", s, s)
	fmt.Printf("b = %v (type: %T)\n", b, b)

	// Explicit type conversion
	converted := float64(i)
	fmt.Printf("\nint(%d) as float64 = %v (type: %T)\n", i, converted, converted)

	// TODO: Try converting f (float64) back to int and observe the truncation
}
