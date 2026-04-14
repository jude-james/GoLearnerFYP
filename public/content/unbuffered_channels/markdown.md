# Unbuffered Channels

When you create a channel with just `make(chan T)`, you get an unbuffered channel. This is the default.

## Blocking on Both Sides

An unbuffered channel has no storage, it can't hold a value in transit. This means:

- A send blocks until another goroutine is ready to receive
- A receive blocks until another goroutine is ready to send

The two sides must meet at the same moment, like a handshake. Neither can proceed until both are present.

## Deadlock

If both sides never meet, the program will deadlock and crash. For example, if you try to send on an unbuffered channel with nobody receiving:

```go
ch := make(chan int)
ch <- 42 // deadlock, nothing is receiving
```

Go detects this situation and panics with:

"fatal error: all goroutines are asleep - deadlock!"

## Example

Notice how the producer is forced to wait for the consumer each time, the channel acts as a pacing mechanism.

## Synchronisation

Because sending and receiving must happen at the same moment, unbuffered channels allow synchronisation between goroutines. This makes unbuffered channels useful not just for passing data but for coordinating timing between goroutines.

