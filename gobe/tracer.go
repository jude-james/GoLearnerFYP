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

// TODO figure out a better more accurate way to start time (start it at src.main?)
var startTime = time.Now()

// Appends a new goroutine event to the events slice, with the current time
func logGoroutine(event string, id int64, parentId int64) {
	currentTime := time.Since(startTime).Seconds()
	events = append(events, Event{currentTime, event, fmt.Sprintf("%d", id), fmt.Sprintf("%d", parentId)})
	fmt.Println("Event:", event, "id:", id, "parentId:", parentId, "time:", currentTime)
}

// Appends a new channel event to the events slice, with the current time
func logChannel(event string, id string, parentId int64) {
	currentTime := time.Since(startTime).Seconds()
	events = append(events, Event{currentTime, event, id, fmt.Sprintf("%d", parentId)})
	fmt.Println("Event:", event, "id:", id, "parentId:", parentId, "time:", currentTime)
}

// Returns the current goroutine Id of the calling goroutine.
// Stack formats a stack trace of the calling goroutine,
// so this captures the the Id from the stack trace and ignores the rest
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
	// Since this func is called when the source programs main func ends, we can now
	// insert the end goroutine event with the current time, and since mains start is always
	// at time 0 and doesn't have a parentId, we can manually insert that too
	insertMainGoroutineEvents()

	// Create a new file called events.json
	file, err := os.Create("events.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// Use json package to encode events to new file
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "	")
	encoder.Encode(events)

	// TODO Then return to js to confirm events.json has been written and exists, check it's guaranteed
}
