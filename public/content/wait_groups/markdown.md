# WaitGroups

A `sync.WaitGroup` lets the main goroutine wait for a collection of goroutines to finish before continuing. It's the standard way to synchronise goroutine completion.

## How It Works

A `WaitGroup` is essentially a counter with three operations:

- `Add(n)` - increments the counter by `n`, signalling that `n` goroutines are about to start
- `Done()` - decrements the counter by 1, called by a goroutine when it finishes
- `Wait()` - blocks until the counter reaches zero

# Example

`main` no longer needs to guess how long all the goroutines will take.

> **Note:** The `WaitGroup` is passed as a pointer (`*sync.WaitGroup`) so the goroutine and the caller share the same counter