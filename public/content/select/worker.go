package main

import (
	"fmt"
	"time"
)

func slowWorker(ch chan<- string, delay time.Duration, result string) {
	time.Sleep(delay)
	ch <- result
}

func main() {
	ch1 := make(chan string)
	ch2 := make(chan string)

	go slowWorker(ch1, 300*time.Millisecond, "result from worker 1")
	go slowWorker(ch2, 150*time.Millisecond, "result from worker 2")

	// Select picks whichever channel is ready first
	select {
	case v := <-ch1:
		fmt.Println(v)
	case v := <-ch2:
		fmt.Println(v)
	}
}
