# Pointers

A pointer holds the memory address of a variable. Rather than storing a value directly, it stores where that value lives in memory.

## The Two Pointer Operators

- `&` - the address-of operator. Gives you a pointer to a variable.
- `*` - the dereference operator. Gives you the value a pointer points to.

```go
x := 42
p := &x         // p holds the memory address of x

fmt.Println(p)  // e.g. 0xc0000b4008  (the address)
fmt.Println(*p) // 42  (the value at that address)
```

The type of `p` here is `*int`, read as "pointer to int". Every type has a corresponding pointer type: `*string`, `*float64`, `*bool`, and so on.

## Modifying a Value Through a Pointer

Because a pointer refers to the original variable, writing through it changes the original:

```go
x := 42
p := &x

*p = 100
fmt.Println(x) // 100
```

## Nil Pointers

A pointer that hasn't been assigned a value is `nil`. Trying to dereference a nil pointer causes a panic, so always make sure a pointer is non-nil before using it:

```go
var p *int      // p is nil
fmt.Println(p)  // <nil>
fmt.Println(*p) // panic!
```

## No Pointer Arithmetic

Unlike C, Go does not allow pointer arithmetic, you cannot do `p++` to advance through memory.

Try changing the value of `y` through its pointer on the right, and verify the original variable updates.
