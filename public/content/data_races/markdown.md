# Data Races

A data race occurs when two goroutines access the same variable simultaneously and at least one is writing. The result is unpredictable, wrong answers, crashes, or different output on every run.

# Example

`increment` simply increments the counter variable until 1 million. Launching two `increment` functions in goroutines should increment the counter to 2 million, but a data race occurs. Run the program and see the output.

Now try call `increment` without using goroutines, the counter should reach 2 million.

`counter++` looks atomic but is actually three operations: read, add, write. Two goroutines can read the same value simultaneously and both write back the same result, losing an increment.