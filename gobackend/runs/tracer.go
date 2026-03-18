package main

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strings"
	"time"
)

// An event represents a single concurrent event captured by the tracer,
// storing at a minimum it's unique Id and timestamp
type Event struct {
	Time     float64 `json:"time"`
	Event    string  `json:"event"`
	Id       string  `json:"id"`
	ParentId string  `json:"parentId"`
}

var events []Event

var startTime time.Time

// sets the start time to the current local time
func setStartTime() {
	startTime = time.Now()
}

// Appends a new goroutine event to the events slice, with the current time
func logGoroutine(event string, id int64, parentId int64) {
	currentTime := time.Since(startTime).Seconds()
	events = append(events, Event{currentTime, event, fmt.Sprintf("%d", id), fmt.Sprintf("%d", parentId)})
}

// Appends a new channel event to the events slice, with the current time
func logChannel(event string, id string, parentId int64) {
	currentTime := time.Since(startTime).Seconds()
	events = append(events, Event{currentTime, event, id, fmt.Sprintf("%d", parentId)})
}

// Returns the current goroutine Id of the calling goroutine.
// Stack formats a stack trace of the calling goroutine,
// so this captures the Id from the stack trace and ignores the rest
func getGoroutineId() int64 {
	var buf [64]byte
	n := runtime.Stack(buf[:], false)
	var id int64
	fmt.Sscanf(strings.TrimPrefix(string(buf[:n]), "goroutine "), "%d", &id)
	return id
}

// Inserts the start and end goroutine events for the main func
func insertMainGoroutineEvents() {
	// TODO this is currently not sorted, change later if an issue
	currentTime := time.Since(startTime).Seconds()
	startMain := Event{0, "create-goroutine", "1", ""}
	endMain := Event{currentTime, "end-goroutine", "1", ""}
	events = append(events, startMain, endMain)
}

// Creates a new json object from the events struct and writes a new file called events.json
func encodeEventsToJson() {
	// Insert the main func goroutine before writing our events.json
	insertMainGoroutineEvents()

	// Create a new file called events.json
	file, err := os.Create("runs/events.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// Use json package to encode events to new file
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "	")
	encoder.Encode(events)
}
