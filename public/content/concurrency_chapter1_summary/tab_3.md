## WaitGroups

A `sync.WaitGroup` lets main wait for goroutines to finish. Call `Add` before launching, `Done` when the goroutine finishes, and `Wait` to block until all are complete.