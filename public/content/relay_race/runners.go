package main

import (
	"fmt"
	"time"
)

func runner(track chan int) {
	for {
		baton := <-track
		fmt.Printf("runner %d running\n", baton)
		baton++
		time.Sleep(100 * time.Millisecond)
		track <- baton
	}
}

func main() {
	track := make(chan int)

	for i := 0; i < 8; i++ {
		go runner(track)
	}

	track <- 1
	time.Sleep(1 * time.Second)
	fmt.Printf("race finished, baton reached runner %d\n", <-track)
}
