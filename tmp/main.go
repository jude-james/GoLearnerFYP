package main

import "fmt"
import "time"

func main() {
	for i := 1; i < 100; i++ {
		fmt.Println(i * i);
		time.Sleep(100 * time.Millisecond)
		fmt.Println(time.Now())
	}
}
