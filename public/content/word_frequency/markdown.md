# Word Frequency Counter

## Task

Write a program that counts how many times each word appears in a sentence, then prints the results.

Given the sentence:

```
"the cat sat on the mat the cat"
```

Your program should output (order may vary):

```
the: 3
cat: 2
sat: 1
on:  1
mat: 1
```

## Steps

1. Use `strings.Fields(sentence)` to split the sentence into a slice of words.
2. Create a `map[string]int` to store word counts.
3. Loop over the words and increment the count for each one.
4. Loop over the map and print each word with its count.