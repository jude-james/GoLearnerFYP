package main

import (
	"fmt"
	"time"
)

func producer(ch chan int) {
	for i := 1; i <= 5; i++ {
		fmt.Println("sending", i)
		ch <- i
		fmt.Println("sent", i)
	}
}

func consumer(ch chan int) {
	for i := 1; i <= 5; i++ {
		time.Sleep(300 * time.Millisecond)
		value := <-ch
		fmt.Println("received", value)
	}
}

func main() {
	ch := make(chan int)

	go producer(ch)
	consumer(ch)
}
