A good analogy is a kitchen. One chef preparing multiple dishes by switching between them is concurrency. Multiple chefs each working on their own dish simultaneously is parallelism.

Goroutines give you concurrency. Whether they run in parallel depends on how many CPU cores are available. Go sets this automatically to match your machine.
