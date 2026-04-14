## Channels

A channel in Go provides a connection between two goroutines, allowing them to communicate. Create one with `make(chan T)`. Use `<-` to send and receive. Channels make communication between goroutines safe and explicit.