# Nested Goroutines

Goroutines can spawn other goroutines. There is no limit to how deep this can go,  each goroutine can launch as many child goroutines as it needs.

In the example, `main` spawns `meetPeople` as a goroutine. `meetPeople` then spawns a goroutine for each person it meets.

This pattern comes up naturally in programs like web crawlers, file system scanners, or anything where processing one item reveals more items that also need processing.