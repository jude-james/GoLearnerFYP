package main

import "fmt"

func main() {
	primes := []int{2, 3, 5, 7, 11}

	fmt.Println("Slice:", primes)
	fmt.Println("Length:", len(primes))
	fmt.Println("First element:", primes[0])
	fmt.Println("Sub-slice [1:3]:", primes[1:3])

	// Iterating with range
	fmt.Println("\nAll primes:")
	for i, v := range primes {
		fmt.Printf("  primes[%d] = %d\n", i, v)
	}

	// TODO: append 13 to primes and print the updated slice
}
