package main

import (
	"fmt"
	"time"
)

func foo() {
	println("foo")
}

func main() {
	defer parseEventsToJson()
	parentId_1 := getGoroutineId()

	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), parentId_1)
		defer logGoroutine("end-goroutine", getGoroutineId(), parentId_1)

		fmt.Println("hey")
		parentId_0 := getGoroutineId()

		go func() {
			logGoroutine("create-goroutine", getGoroutineId(), parentId_0)
			defer logGoroutine("end-goroutine", getGoroutineId(), parentId_0)

			fmt.Println("hey2")
		}()
	}()
	parentId_2 := getGoroutineId()
	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), parentId_2)
		defer logGoroutine("end-goroutine", getGoroutineId(), parentId_2)

		foo()
	}()

	time.Sleep(time.Second * 1)
}
