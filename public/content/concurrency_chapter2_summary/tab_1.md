## Buffering

An unbuffered channel blocks until both sides are ready. A buffered channel `make(chan T, n)` can hold up to `n` values before blocking, letting the sender get ahead of the receiver.