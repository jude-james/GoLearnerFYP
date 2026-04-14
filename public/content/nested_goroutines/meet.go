package main

import (
	"fmt"
	"time"
)

func SayHello(name string) {
	fmt.Printf("Hello %s!\n", name)
}

func MeetPeople(names []string) {
	for _, name := range names {
		go SayHello(name)
	}
}

func main() {
	names := []string{"Adam", "Ben", "Caroline", "Derek", "Evan", "Farah",
		"Goldie", "Harriet", "Ingrid", "Jake", "Lola", "Meena", "Ninoshka",
		"Oakley", "Pierre", "Quinn", "Ryder", "Steve", "Tom", "Uma",
		"Vanessa", "Wade", "Xenon", "Yolanda", "Zoey"}

	go MeetPeople(names)
	time.Sleep(25 * time.Millisecond)
}
