# Fan-in

Fan-in merges multiple channels into a single channel. It is useful when you have several goroutines producing results and want to collect them into one stream for processing.

Each input channel gets its own goroutine that forwards values to the merged channel. A WaitGroup closes the merged channel once all inputs are done.