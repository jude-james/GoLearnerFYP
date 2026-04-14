# What is a Goroutine?

A **goroutine** is a function that runs concurrently alongside other goroutines in the same program. You can think of it as an independently executing task. Your program can have thousands of them running at the same time.

Goroutines are Go's core concurrency primitive. They are similar in concept to threads in other languages, but much cheaper. An OS thread might use 1–2MB of stack memory; a goroutine starts with around 2KB and grows only as needed. This is what makes spawning thousands of them practical.

## The Main Goroutine

Every Go program already uses a goroutine; the `main` function itself runs in one. When `main` returns, the program exits and all other goroutines are killed immediately, regardless of whether they have finished.

## Observing Goroutines

Below this window, you can scroll down to see a new window. This window displays all the running goroutines from the program, click *run* and the main goroutine should appear, but not the other function. It also contains a separate output window.