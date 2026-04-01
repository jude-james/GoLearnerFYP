package main

import "fmt"

func main() {
	// Basic switch
	day := "Saturday"
	switch day {
	case "Saturday", "Sunday":
		fmt.Println(day, "is a weekend")
	case "Monday":
		fmt.Println("Start of the working week")
	default:
		fmt.Println(day, "is a weekday")
	}

	score := 85
	// TODO: Switch with no condition

	fmt.Println(score)
}
