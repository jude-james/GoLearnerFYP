package main

import "fmt"

const SpeedOfLight = 299792458

func main() {
	// var-style declaration
	var city string = "London"
	var population int = 8_900_000

	// short declaration
	country := "UK"
	area := 1572.0

	fmt.Printf("City: %s, %s\n", city, country)
	fmt.Printf("Population: %d\n", population)
	fmt.Printf("Area: %.1f km^2\n", area)

	// TODO: declare a variable for distance (e.g. 1000 metres)
	// and print how many seconds light takes to travel that distance
	// (distance / SpeedOfLight)
}
