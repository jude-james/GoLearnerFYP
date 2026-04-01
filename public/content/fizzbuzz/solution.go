package main

import "fmt"

func main() {
	fizzCount := 0

	for i := 1; i <= 30; i++ {
		switch {
		case i%3 == 0 && i%5 == 0:
			fmt.Println("FizzBuzz")
			fizzCount++
		case i%3 == 0:
			fmt.Println("Fizz")
			fizzCount++
		case i%5 == 0:
			fmt.Println("Buzz")
		default:
			fmt.Println(i)
		}
	}

	fmt.Println("Fizz count:", fizzCount)
}
