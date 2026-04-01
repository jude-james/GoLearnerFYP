package main

import "fmt"

func main() {
	score := 72

	if score >= 90 {
		fmt.Println("Grade: A")
	} else if score >= 80 {
		fmt.Println("Grade: B")
	} else if score >= 70 {
		fmt.Println("Grade: C")
	} else {
		fmt.Println("Grade: F")
	}

	// Initialisation statement example
	if result := score * 2; result > 100 {
		fmt.Println("Doubled score exceeds 100:", result)
	} else {
		fmt.Println("Doubled score:", result)
	}

	// TODO: add a check for scores below 0 or above 100 and print "Invalid score"
}
