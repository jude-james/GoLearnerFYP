## Pointers point to where a value lives

A pointer stores a memory address, not a value directly.

```go
x := 42
p := &x  // & gives you the address
*p = 100 // * reads or writes through the pointer
```

- `&` - address-of
- `*` - dereference
- An unassigned pointer is `nil`, dereferencing it will panic