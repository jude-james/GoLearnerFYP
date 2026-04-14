# Buffered Channels

An unbuffered channel requires both sender and receiver to be ready at the same moment. Sometimes that's too strict, you want a sender to be able to get ahead without immediately blocking. That's what a buffered channel provides.

## Creating a Buffered Channel

Pass a capacity as the second argument to `make`:

```go
ch := make(chan int, 3) // buffered channel with capacity 3
```

This channel can hold up to 3 values before the sender blocks.

## How Buffering Changes Blocking

With a buffered channel:

- A send only blocks when the buffer is full
- A receive only blocks when the buffer is empty

```go
ch := make(chan int, 3)

ch <- 1 // doesn't block, buffer has space
ch <- 2 // doesn't block
ch <- 3 // doesn't block
ch <- 4 // blocks. Buffer is full, nobody receiving

fmt.Println(<-ch) // 1
fmt.Println(<-ch) // 2
fmt.Println(<-ch) // 3
```

Buffered channels behave like a queue. Values come out in the same order they went in (FIFO).

## Example

Currently the buffer size is 0 (unbuffered). Try changing the size from 0 up to 5. What do you notice?

With a buffer size greater than 0, `fastProducer` is able to send immediately, and the value is stored in the buffer. As soon as `slowConsumer` receives a value, the buffer has space again, and `fastProducer` can send another value.

At a buffer of 5, all 5 values are sent immediately, and `slowConsumer` receives them one by one when it's ready.