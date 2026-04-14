# Shared Channels

So far, channels have connected different goroutines. A producer sends, a consumer receives. But multiple identical goroutines can share the same channel, both sending and receiving on it.

The relay race below shows this pattern. Each runner goroutine receives the baton, increments it, and passes it on.

```go
func runner(track chan int) {
    for {
        baton := <-track
        fmt.Printf("runner %d running\n", baton)
        baton++
        time.Sleep(100 * time.Millisecond)
        track <- baton
    }
}
```

This is different from a worker pool where workers only receive from a jobs channel. Here the same channel is used for both receiving and sending, so the goroutines form a passing chain rather than a one-way pipeline.