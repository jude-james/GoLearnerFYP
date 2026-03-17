package main

import ("fmt"; "time")

func main() {
	for i := 1; i <= 10; i++ {
		time.Sleep(time.Second)
		fmt.Println("This is line number", i)
	}
}
