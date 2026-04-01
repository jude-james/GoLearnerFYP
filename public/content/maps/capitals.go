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

	// Safe lookup with ok idiom
	city, ok := capitals["Spain"]
	if ok {
		fmt.Println("Capital of Spain:", city)
	} else {
		fmt.Println("Spain not in map")
	}

	// TODO: add Germany -> Berlin and Brazil -> Brasília
	// then iterate over the map and print all entries
}
