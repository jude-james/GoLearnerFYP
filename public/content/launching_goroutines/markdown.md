# Launching Goroutines

Launching a goroutine is very simple, put the `go` keyword in front of a function call:

```go
go myFunction()
```

That's it. Go takes care of scheduling and execution. The calling code continues immediately without waiting for the goroutine to finish.

## Anonymous Goroutines

You can also launch an anonymous function as a goroutine directly:
```go
go func() {
    fmt.Println("running in a goroutine")
}()
```

## Modifying Our Program

The example on the right is the same program from earlier. Run the program and you can see below it takes roughly 1.5 seconds to complete. 

Let's make a few changes. Add the `go` keyword to the *first and second* `slowTask()`. 

Run the program, you can now see the time has reduced to 0.5 seconds, with two goroutines running `slowTask()` for A and B, and the main goroutine doing task C. Also note that the order of outputs is not guaranteed any more. 

Now launch all 3 `slowTask()` functions with goroutines, what happens?

Main runs all 3 tasks in goroutines, and terminates almost immediately. This is the first important lesson about goroutines: `main` doesn't wait for them. If `main` finishes first, the program exits before the goroutines gets a chance to print anything. 

## The Problem

So how do we wait for goroutines to finish? One option is `time.Sleep`, but that's fragile. How long should you wait? What if the goroutine takes longer than expected?

The proper solution is a `WaitGroup`, which we'll cover in the next topic.