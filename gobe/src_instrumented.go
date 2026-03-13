package main

import (
	"fmt"
	"time"
)

func foo() {
	println("foo")

	ch := make(chan int)
	logChannel("receive-channel", fmt.Sprintf("%p", ch), getGoroutineId())

	a := <-ch
	fmt.Println(a)
}

func main() {
	storeParentGoroutineId()

	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), getParentGoroutineId())
		defer logGoroutine("end-goroutine", getGoroutineId(), getParentGoroutineId())

		fmt.Println("hey")
		storeParentGoroutineId()

		go func() {
			logGoroutine("create-goroutine", getGoroutineId(), getParentGoroutineId())
			defer logGoroutine("end-goroutine", getGoroutineId(), getParentGoroutineId())

			fmt.Println("hey2")
		}()
	}()
	storeParentGoroutineId()
	go func() {
		logGoroutine("create-goroutine", getGoroutineId(), getParentGoroutineId())
		defer logGoroutine("end-goroutine", getGoroutineId(), getParentGoroutineId())

		foo()
	}()

	time.Sleep(time.Second * 1)
}
