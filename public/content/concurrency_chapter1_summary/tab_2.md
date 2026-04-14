## The Main Goroutine

Every Go program already runs in a goroutine. When `main` returns the program exits immediately, killing all other goroutines regardless of whether they have finished.