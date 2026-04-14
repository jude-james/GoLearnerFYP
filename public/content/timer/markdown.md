# Timers with Select

Each call to `timer` launches a goroutine that waits for a given duration then sends on a channel. A `timeout` channel is created before the loop and acts as a deadline for the entire program.

On each iteration a new one second timer is created. `select` then waits on both, if the second timer fires first the loop continues, if the timeout fires first the program stops early.

This is a nice way to run something repeatedly until a deadline is reached, with `select` deciding which channel wins on each iteration.

Try changing the timer duration from 1000 milliseconds to something else.