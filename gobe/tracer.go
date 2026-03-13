package main

import (
	"fmt"
	"time"
)

func logEvent(name string) {
	fmt.Println("Event:", name, time.Now())
}
