package main

import (
	"fmt"
)

func main() {
	// Classic for loop
	fmt.Println("Counting to 4:")
	for i := 0; i < 5; i++ {
		fmt.Println(i)
	}

	// Range over a slice
	fruits := []string{"apple", "banana", "blueberry", "cherry", "blackberry"}
	fmt.Println("\nFruits:")
	for _, fruit := range fruits {
		// TODO: use continue to skip fruits starting with "b"
		fmt.Println(fruit)
	}
}
