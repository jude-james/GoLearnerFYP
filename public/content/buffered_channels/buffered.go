package main

import (
	"fmt"
	"time"
)

func fastProducer(ch chan int) {
	for i := 1; i <= 5; i++ {
		ch <- i
		fmt.Println("produced", i)
	}
}

func slowConsumer(ch chan int) {
	for i := 1; i <= 5; i++ {
		time.Sleep(200 * time.Millisecond)
		fmt.Println("consumed", <-ch)
	}
}

func main() {
	ch := make(chan int, 0)

	go fastProducer(ch)
	slowConsumer(ch)
}
