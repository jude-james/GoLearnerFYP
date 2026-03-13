package main

import (
	"fmt"
	"time"
)

func foo() {
	println("foo")
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
