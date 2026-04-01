## Imports bring in extra functionality

Go's core language is minimal by design. Useful tools like printing live in the standard library and must be explicitly imported.
```go
import (
    "os"
    "time"
)
```

Every imported package must be used, or the program won't compile.