package main

import (
	"fmt"
	"time"
)

func timer(d time.Duration) <-chan int {
	c := make(chan int)
	go func() {
		time.Sleep(d)
		c <- 1
	}()
	return c
}

func main() {
	for i := 0; i < 12; i++ {
		c := timer(300 * time.Millisecond)
		<-c
		fmt.Println(i)
	}
}
