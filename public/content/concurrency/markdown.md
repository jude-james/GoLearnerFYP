# What is Concurrency?

**Concurrency** is the ability of a program to deal with multiple tasks at once. Rather than waiting for one task to fully complete before starting the next, a concurrent program can juggle several tasks, making progress on each of them over time.

A common analogy is a chef preparing a meal, they don't roast vegetables, then boil pasta, then make a sauce one at a time. They start the vegetables, and while those are roasting they get the pasta on, and while that's boiling they make the sauce. The tasks overlap.

## Sequential Programs  

Without concurrency, programs are **sequential**. Instructions execute one after another, in order. Each line waits for the previous one to finish before running.
```go
slowTask("task A") // runs first
slowTask("task B") // waits for A to finish
slowTask("task C") // waits for B to finish
```

This is simple and predictable, but it means tasks that could be done at the same time are forced to wait for each other.

The example on the right is a simple sequential program, run the program and observe it's behaviour. In the next few topics we will run these functions in goroutines.