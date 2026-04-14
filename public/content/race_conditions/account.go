package main

import (
	"fmt"
	"sync"
	"time"
)

type Account struct {
	balance int
}

func main() {
	account := &Account{balance: 100}
	var wg sync.WaitGroup

	for i := 0; i < 3; i++ {
		wg.Add(1)
		go account.withdraw(40, &wg)
	}

	wg.Wait()
	fmt.Println("final balance:", account.balance)
}

func (a *Account) withdraw(amount int, wg *sync.WaitGroup) {
	defer wg.Done()
	if a.balance >= amount {
		time.Sleep(1 * time.Millisecond)
		a.balance -= amount
		fmt.Printf("withdrew %d, balance now %d\n", amount, a.balance)
	} else {
		fmt.Printf("insufficient funds for %d, balance is %d\n", amount, a.balance)
	}
}
