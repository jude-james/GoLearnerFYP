## Slices and maps are core

Slices are ordered, dynamic lists. Maps are key-value stores.
```go
nums := []int{1, 2, 3}
nums = append(nums, 4)

ages := map[string]int{"Alice": 30}
age, ok := ages["Alice"] // ok is false if key missing
```

Iterate over both with `for range`.