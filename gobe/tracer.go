package main

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"
)

type Event struct {
	Time     float64 `json:"time"`
	Event    string  `json:"event"`
	Id       string  `json:"id"`
	ParentId string  `json:"parentId"`
}

var events []Event

// TODO figure out a better more accurate way to start time
var startTime = time.Now()

//var currentParentId int64

func logGoroutine(event string, id int64, parentId int64) {
	events = append(events, Event{time.Since(startTime).Seconds(), event, fmt.Sprintf("%d", id), fmt.Sprintf("%d", parentId)})
	fmt.Println("Event:", event, "id:", id, "parentId:", parentId, "time:", time.Now())
}

func logChannel(event string, id string, parentId int64) {
	events = append(events, Event{time.Since(startTime).Seconds(), event, id, fmt.Sprintf("%d", parentId)})
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

/*
func storeParentGoroutineId() {
	currentParentId = getGoroutineId()
}

func getParentGoroutineId() int64 {
	return currentParentId
}*/

func parseEventsToJson() {
	fmt.Println("Program ended...")
	// Could just append the end main goroutine here...

	file, err := os.Create("events.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "	")
	encoder.Encode(events)
}
