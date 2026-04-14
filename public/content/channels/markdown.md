# What is a Channel?

Goroutines run independently, but they often need to communicate, one goroutine produces a result that another needs to act on. The naive solution is to use a shared variable, but as we'll see in a later chapter, writing and reading to shared memory concurrently causes dangerous bugs.

Go's answer to this problem is the channel. A channel is a typed conduit through which goroutines can send and receive values. Rather than goroutines reaching into shared memory, they pass data explicitly through a channel, one goroutine sends, another receives.

## Creating a Channel

Channels are created with `make`:

```go
ch := make(chan string)
```

The type after `chan` determines what kind of values the channel can carry. A `chan int` can only send and receive integers.

## Sending and Receiving

The `<-` operator is used for both sending and receiving:

```go
ch <- 42      // send 42 into the channel
value := <-ch // receive a value from the channel
```

The arrow points in the direction data flows, into the channel when sending, out of it when receiving.

## Observing the Program

Below this window, you can scroll down to see a new window: the concurrency visualiser. This 3D scene allows us to replay the program and observe a timeline of each goroutine and each channel send/receive event.

Play the animation and you will see a replay of the value 'hello' being sent from the anonymous goroutine to the main goroutine. This executes almost instantly, so the goroutines appear as dots.

- **Red lines** represent goroutines.

- **Yellow lines** represent values being sent between goroutines across channels, as a single event.

- Time moves **downwards**, the beginning of the program is where main is labelled.