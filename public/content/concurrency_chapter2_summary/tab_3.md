## Select

`select` blocks until one of several channel operations is ready, then executes that case. If multiple are ready it picks one at random. It is the standard way to wait on more than one channel at once.