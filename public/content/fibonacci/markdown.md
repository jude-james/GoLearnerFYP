# Fibonacci Calculator

This program calculates the first 45 fibonacci numbers. `main` sends numbers 1 to 45 into a jobs channel, then `worker` takes from that channel, calculates the fib, and send the result through a results channel.

This is a worker pool pattern, a set of workers pulling jobs from a shared channel and sending results back on a results channel.

Fibonacci numbers grow rapidly, the first 30 or so are calculated very fast, but you can see the later ones struggle. The buffered `jobs` channel has to store a handful of the later numbers before `worker` is ready to receive.

Currently there is one worker: `go worker(jobs, results)`. Run the program and observe the behaviour. As soon as the worker completes its calculation, it sends it over the results channel and immediately receives the next job from the jobs channel.

## Adding Goroutines

This calculation on a single goroutine is taking ~6 seconds.

Let's spawn 8 workers with a for loop:

```go
for i := 0; i < 8; i++ {
    go worker(jobs, results)
}
```

The time should have reduced. With 8 workers, the buffer is also not nearly as full any more, there are enough goroutines to take on each calculation.

## Diminishing Returns

Notice how after a certain number of goroutines, the performance increase is negligible. Adding more goroutines only speeds things up until you match the number of available CPU cores. Beyond that the cores are already fully utilised and extra goroutines add scheduling overhead without any additional parallelism.