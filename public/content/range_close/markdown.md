# Range and Close

When a goroutine is done sending values on a channel, it can close the channel to signal that no more values are coming. Receivers can detect this and stop waiting.

## Closing a Channel

```go
close(ch)
```

## Detecting a Closed Channel

When receiving, you can use a two-value form to check whether the channel is still open:

```go
value, ok := <-ch
if !ok {
    fmt.Println("channel closed")
}
```

`ok` is `false` when the channel is closed and empty.

## Range Over a Channel

Manually checking `ok` every time gets tedious. The cleaner approach is `for range`, which automatically stops when the channel is closed:

## Example

The example code shows the printer goroutine doesn't need to know anything about how many values are coming in. It doesn't need to keep track of max with another for loop line in previous examples, it just ranges until the chanel is closed.
