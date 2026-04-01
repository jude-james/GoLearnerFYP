## For is Go's only loop

Go has no `while`, `for` covers every case.
```go
for i := 0; i < 5; i++ { }   // classic
for n < 100 { }              // while
for { }                      // infinite
for i, v := range slice { }  // range
```

Use `break` to exit early and `continue` to skip to the next iteration.