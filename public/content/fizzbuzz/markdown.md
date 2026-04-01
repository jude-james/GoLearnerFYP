# FizzBuzz

## Task

Write the classic FizzBuzz program using Go's control flow, then extend it slightly.

### Part 1 - Classic FizzBuzz

Loop from `1` to `30` (inclusive). For each number:
- If divisible by both 3 and 5, print `FizzBuzz`
- If divisible by 3 only, print `Fizz`
- If divisible by 5 only, print `Buzz`
- Otherwise, print the number

Use a `switch` with no condition (rather than `if/else if`)

### Part 2 - Count the Fizzes

After the loop, print how many times `"Fizz"` (including `"FizzBuzz"`) was printed.

Expected output (first 15 lines):
```
1
2
Fizz
4
Buzz
Fizz
7
8
Fizz
Buzz
11
Fizz
13
14
FizzBuzz
...
Fizz count: 10
```