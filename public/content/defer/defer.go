package main

import "fmt"

func openResource(name string) {
	fmt.Println("Opening:", name)
	defer fmt.Println("Closing:", name)

	fmt.Println("Working with:", name)
}

func main() {
	openResource("database connection")

	fmt.Println("---")

	// Multiple defers with LIFO order
	// TODO: Alter the for loop so that each print statement is deferred
	fmt.Println("counting")
	for i := 10; i > 0; i-- {
		fmt.Println(i)
	}

	fmt.Println("end of main body")
}
