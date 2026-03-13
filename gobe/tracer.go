package main

import (
	"fmt"
	"runtime"
	"strings"
	"time"
)

var currentParentId int64

func logGoroutine(event string, id int64, parentId int64) {
	fmt.Println("Event:", event, "id:", id, "parentId:", parentId, "time:", time.Now())
}

func logChannel(event string, id string, parentId int64) {
	fmt.Println("Event:", event, "id:", id, "parentId:", parentId, "time:", time.Now())
}

// TODO comment this

func getGoroutineId() int64 {
	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	var id int64
	fmt.Sscanf(strings.TrimPrefix(string(buf[:n]), "goroutine "), "%d", &id)
	return id
}

func storeParentGoroutineId() {
	currentParentId = getGoroutineId()
}

func getParentGoroutineId() int64 {
	return currentParentId
}
