## Switch is cleaner than a chain of if/else

Cases don't fall through by default so no `break` keyword needed. Leaving out the condition turns it into a clean alternative to if/else if.
```go
switch {
case score >= 90:
    fmt.Println("A")
case score >= 80:
    fmt.Println("B")
}
```

Multiple values can share a case: `case "Sat", "Sun"`.