package main

import "fmt"

func main() {
	jobs := make(chan int, 45)
	results := make(chan int, 45)

	go worker(jobs, results)

	for i := 0; i < 45; i++ {
		jobs <- i
	}
	close(jobs)

	for j := 0; j < 45; j++ {
		fmt.Println(<-results)
	}
}

func worker(jobs <-chan int, results chan<- int) {
	for n := range jobs {
		result := fib(n)
		results <- result
	}
}

func fib(n int) int {
	if n <= 1 {
		return n
	}
	return fib(n-1) + fib(n-2)
}
