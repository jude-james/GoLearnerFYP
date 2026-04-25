# Maps

A map is Go's built-in key-value store, similar to a dictionary in Python or an object in JavaScript. Maps let you look up a value by key in roughly constant time.

## Declaring and Initialising Maps

Use a map literal to create a map with initial values:

```go
capitals := map[string]string{
    "France":  "Paris",
    "Japan":   "Tokyo",
    "Nigeria": "Abuja",
}
```

The syntax is `map[KeyType]ValueType`. Keys can be any comparable type (strings, integers, booleans), but not slices or maps.

To create an empty map, use `make`:

```go
scores := make(map[string]int)
```

## Reading and Writing

```go
capitals["Germany"] = "Berlin"    // add or update
city := capitals["France"]        // read
```

## Checking if a Key Exists

Reading a missing key doesn't crash, it returns the zero value. To distinguish from keys that exist with zero values and keys that don't exist, use the two-value form:

```go
city, ok := capitals["Spain"]
if ok {
    fmt.Println("Capital:", city)
} else {
    fmt.Println("Not found")
}
```

`ok` is `true` if the key existed, `false` if not. This pattern appears everywhere in Go.

## Deleting a Key

```go
delete(capitals, "Japan")
```

## Iterating Over a Map

Use `for range`, just like with slices:

```go
for country, capital := range capitals {
    fmt.Printf("%s → %s\n", country, capital)
}
```

> **Note:** Map iteration order is not guaranteed in Go. Every iteration may produce a different order.

Try adding two more countries to the map, then iterate over it to print all entries.
