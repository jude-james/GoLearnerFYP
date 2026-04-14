package main

import (
	"fmt"
	"sync"
	"time"
)

func generate(ch chan<- int, max int) {
	for i := 1; i <= max; i++ {
		ch <- i
		time.Sleep(time.Millisecond * 500)
	}
	close(ch)
}

func printer(ch <-chan int, wg *sync.WaitGroup) {
	defer wg.Done()
	for v := range ch {
		fmt.Println(v)
	}
}

func main() {
	var wg sync.WaitGroup
	ch := make(chan int)

	go generate(ch, 5)

	wg.Add(1)
	go printer(ch, &wg)

	wg.Wait()
}
