package main

import "fmt"

func main() {
	fmt.Println("I am the main goroutine")
	myFunc()
}

func myFunc() {
	fmt.Println("I am just a function")
}
