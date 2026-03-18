package main

import (
	"fmt"
	"time"
)

func main() {
	setStartTime()
	defer encodeEventsToJson()
	fmt.Println("jsofgisjdog")
	var Ball int
	table := make(chan int)
	parentId_0 := getGoroutineId()
	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), parentId_0)
		defer logGoroutine("end-goroutine", getGoroutineId(), parentId_0)

		player(table)
	}()
	parentId_1 := getGoroutineId()
	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), parentId_1)
		defer logGoroutine("end-goroutine", getGoroutineId(), parentId_1)

		player(table)
	}()
	logChannel("send-channel", fmt.Sprintf("%p", table), getGoroutineId())

	table <- Ball
	time.Sleep(1 * time.Second)
	logChannel("receive-channel", fmt.Sprintf("%p", table), getGoroutineId())

	<-table
}

func player(table chan int) {
	for {
		logChannel("receive-channel", fmt.Sprintf("%p", table), getGoroutineId())

		ball := <-table
		ball++
		time.Sleep(100 * time.Millisecond)
		logChannel("send-channel", fmt.Sprintf("%p", table), getGoroutineId())

		table <- ball
	}
}
