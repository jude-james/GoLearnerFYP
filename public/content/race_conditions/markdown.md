# Race Conditions

A race condition is different from a data race. The memory accesses may be safe, but correctness depends on the timing of operations between goroutines.

Two goroutines both withdraw from the same account:

```go
func (a *Account) withdraw(amount int) {
    if a.balance >= amount {
        a.balance -= amount
    }
}
```

Both check `balance >= amount` simultaneously, both see enough funds, and both withdraw. The balance will go negative. Each individual operation is fine, but the sequence is not.

## Example

In the right example, money is withdrawn multiple times concurrently. The insufficient funds message is not displayed even though it should be. Remove the `go` keyword and watch the change in behaviour.