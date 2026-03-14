package main

import (
	"fmt"
	"time"
)

func timer(d time.Duration) <-chan int {
	c := make(chan int)
	parentId_0 := getGoroutineId()
	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), parentId_0)
		defer logGoroutine("end-goroutine", getGoroutineId(), parentId_0)

		time.Sleep(d)
		logChannel("send-channel", fmt.Sprintf("%p", c), getGoroutineId())

		c <- 1
	}()
	return c
}

func main() {
	setStartTime()
	defer encodeEventsToJson()

	for i := 0; i < 10; i++ {
		c := timer(1 * time.Second)
		logChannel("receive-channel", fmt.Sprintf("%p", c), getGoroutineId())

		<-c
	}
}
