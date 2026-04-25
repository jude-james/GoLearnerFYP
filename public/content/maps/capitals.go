package main

import "fmt"

func main() {
	capitals := map[string]string{
		"France":  "Paris",
		"Japan":   "Tokyo",
		"Nigeria": "Abuja",
	}

	// Reading a value
	fmt.Println("Capital of France:", capitals["France"])

	city, ok := capitals["Spain"]
	if ok {
		fmt.Println("Capital of Spain:", city)
	} else {
		fmt.Println("Spain not in map")
	}

	// TODO: add two more countries
	// then iterate over the map and print all entries
}
