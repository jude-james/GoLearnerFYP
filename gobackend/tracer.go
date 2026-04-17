package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"runtime"
	"strconv"
	"sync"
	"time"
)

// An event represents a single concurrency event captured by the tracer
type Event struct {
	Time     float64 `json:"time"`
	Event    string  `json:"event"`
	Id       string  `json:"id"`
	ParentId string  `json:"parentId"`
	Name     string  `json:"name"`
	Value    string  `json:"value"`
}

var events []Event
var eventsMu sync.Mutex

var startTime time.Time

var sendCounters = make(map[string]uint64)
var recvCounters = make(map[string]uint64)
var countersMu sync.Mutex

// Called when the source program has started running, sets the start time
func onMainStart() {
	startTime = time.Now()
	fmt.Println("PROGRAM STARTED:")
}

// Called when the main function ends
func onMainEnd() {
	insertMainGoroutineEvents()
	encodeEventsToJson()
}

// Creates a new goroutine event and appends to the events slice
func logGoroutine(event string, id uint64, parentId uint64, name string) {
	currentTime := time.Since(startTime).Seconds()

	eventsMu.Lock()
	defer eventsMu.Unlock()
	events = append(events, Event{currentTime, event, fmt.Sprintf("%d", id), fmt.Sprintf("%d", parentId), name, ""})
}

// Creates a new channel-send event and appends to the events slice
// Creates an Id using the channel pointer address and a sendCounter to pair each send/receive uniquely
func logChannelSend[T any](c any, parentId uint64, value T) {
	countersMu.Lock()
	defer countersMu.Unlock()
	address := fmt.Sprintf("%p", c)
	id := fmt.Sprintf("%s_%d", address, sendCounters[address])
	sendCounters[address]++

	currentTime := time.Since(startTime).Seconds()

	eventsMu.Lock()
	defer eventsMu.Unlock()
	events = append(events, Event{currentTime, "channel-send", id, fmt.Sprintf("%d", parentId), "", fmt.Sprintf("%v", value)})
}

// Creates a new channel-receive event to the events slice
// Creates an Id using the channel pointer address and a recvCounter to pair each send/receive uniquely
func logChannelReceive(c any, parentId uint64) {
	countersMu.Lock()
	defer countersMu.Unlock()
	address := fmt.Sprintf("%p", c)
	id := fmt.Sprintf("%s_%d", address, recvCounters[address])
	recvCounters[address]++

	currentTime := time.Since(startTime).Seconds()

	eventsMu.Lock()
	defer eventsMu.Unlock()
	events = append(events, Event{currentTime, "channel-receive", id, fmt.Sprintf("%d", parentId), "", ""})
}

// Returns the current goroutine Id of the calling goroutine.
// Stack formats a stack trace of the calling goroutine,
// so this captures the Id from the stack trace and ignores the rest
func getGoroutineId() uint64 {
	b := make([]byte, 64)
	b = b[:runtime.Stack(b, false)]
	b = bytes.TrimPrefix(b, []byte("goroutine "))
	b = b[:bytes.IndexByte(b, ' ')]
	n, _ := strconv.ParseUint(string(b), 10, 64)
	return n
}

// Inserts the start and end goroutine events for the main func
func insertMainGoroutineEvents() {
	currentTime := time.Since(startTime).Seconds()
	startMain := Event{0, "create-goroutine", "1", "", "main", ""}
	endMain := Event{currentTime, "end-goroutine", "1", "", "main", ""}

	eventsMu.Lock()
	defer eventsMu.Unlock()
	events = append(events, startMain, endMain)
}

// Creates a new json object from the events struct and writes a new file called events.json
func encodeEventsToJson() {
	args := os.Args[1:]
	runId := args[0]

	// Create a new file called events.json
	file, err := os.Create(runId + "/events.json")
	if err != nil {
		panic(err)
	}
	defer file.Close()

	// Use json package to encode events to new file
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "	")
	encoder.Encode(events)
}
