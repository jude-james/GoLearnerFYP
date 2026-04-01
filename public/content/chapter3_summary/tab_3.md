## Defer statements delay function execution

`defer` schedules a call to run just before the surrounding function exits, great for closing files or releasing resources.
```go
f, _ := os.Open("file.txt")
defer f.Close()
```

Multiple defers execute in LIFO order. Arguments are evaluated immediately when the defer is declared.