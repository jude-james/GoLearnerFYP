# Select

So far, goroutines have worked with one channel at a time. But real programs often need to wait on multiple channels simultaneously, acting on whichever one is ready first. That's what `select` is for.

## Basic Syntax

`select` looks like a `switch`, but each case is a channel operation:

```go
select {
case v := <-ch1:
    fmt.Println("received from ch1:", v)
case v := <-ch2:
    fmt.Println("received from ch2:", v)
}
```

`select` blocks until one of its cases can proceed, then executes that case. If multiple cases are ready at the same time, Go picks one at random.

## Default Case

Adding a `default` case makes `select` non-blocking, if no channel is ready, it falls through to `default` immediately:

```go
select {
case v := <-ch:
    fmt.Println("received:", v)
default:
    fmt.Println("nothing ready, moving on")
}
```