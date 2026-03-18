package main

import (
	"fmt"
	"time"
)

func main() {
	setStartTime()
	defer encodeEventsToJson()
	for i := 1; i <= 50; i++ {
		fmt.Println("This is line number", i)
		time.Sleep(time.Second)
	}
}
