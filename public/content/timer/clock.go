package main

import (
	"fmt"
	"time"
)

func timer(d time.Duration, label string) <-chan string {
	c := make(chan string)
	go func() {
		time.Sleep(d)
		c <- label
	}()
	return c
}

func main() {
	timeout := timer(6*time.Second, "timeout")

	for i := 1; ; i++ {
		t := timer(1000*time.Millisecond, fmt.Sprintf("%d sec", i))
		select {
		case v := <-t:
			fmt.Println(v)
		case v := <-timeout:
			fmt.Println(v)
			return
		}
	}
}
