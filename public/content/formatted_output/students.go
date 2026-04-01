package main

import "fmt"

func main() {
	name := "Alice"
	score := 98.6
	passed := true

	fmt.Printf("Student: %s\n", name)
	fmt.Printf("Score: %.1f\n", score)
	fmt.Printf("Passed: %t\n", passed)

	// TODO: Print the type of `score` using %T
}
