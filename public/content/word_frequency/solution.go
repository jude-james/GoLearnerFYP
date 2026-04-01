package main

import (
	"fmt"
	"strings"
)

func main() {
	sentence := "the cat sat on the mat the cat"

	words := strings.Fields(sentence)

	counts := make(map[string]int)

	for _, word := range words {
		counts[word]++
	}

	for word, count := range counts {
		fmt.Printf("%s: %d\n", word, count)
	}
}
