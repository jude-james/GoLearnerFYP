package main

import "fmt"

const SpeedOfLight = 299792458 // metres per second

func main() {
	// var-style declaration
	var city string = "London"
	var population int = 8_900_000

	// short declaration
	country := "UK"
	area := 1572.0 // km²

	fmt.Printf("City:       %s, %s\n", city, country)
	fmt.Printf("Population: %d\n", population)
	fmt.Printf("Area:       %.1f km²\n", area)

	// TODO: declare a variable for distance (e.g. 1000 metres)
	// and print how many seconds light takes to travel that distance
	// (distance / SpeedOfLight)
}
