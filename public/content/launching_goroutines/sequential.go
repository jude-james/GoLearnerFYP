package main

import (
	"fmt"
	"time"
)

func slowTask(name string) {
	time.Sleep(500 * time.Millisecond)
	fmt.Println(name, "finished")
}

func main() {
	slowTask("task A")
	slowTask("task B")
	slowTask("task C")

	fmt.Println("main finished")
}
