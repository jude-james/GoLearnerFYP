package main

import (
	"fmt"
	"time"
)

func foo() {
	println("foo")
}

func main() {
	go func() {
		fmt.Println("hey")

		go func() {
			fmt.Println("hey2")
		}()
	}()

	go foo()

	time.Sleep(time.Second * 1)
}
