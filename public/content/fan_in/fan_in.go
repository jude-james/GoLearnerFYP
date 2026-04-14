package main

import (
	"fmt"
	"time"
)

func producer(id int, out chan<- string) {
	for i := range 10 {
		out <- fmt.Sprintf("producer %d message %d", id, i)
		time.Sleep(200 * time.Millisecond)
	}
}

func main() {
	merged := make(chan string)
	for i := range 5 {
		go producer(i, merged)
	}

	time.Sleep(50 * time.Millisecond)
	for range 50 {
		fmt.Println(<-merged)
	}
}
