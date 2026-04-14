package main

import "fmt"

func main() {
	ch := make(chan string)

	go func() {
		ch <- "hello"
	}()

	message := <-ch
	fmt.Println(message)

	// No WaitGroup needed, the receive blocks until the goroutine sends
}
