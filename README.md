# GoLearner

## How To Run

Please contact me or my supervisor if you run into problems.

### Prerequisites

- Node.js v22 or higher
- Docker

### Setup

```bash
# 1. Download and change directory
cd GoLearner

# 2. Build docker image
cd gobackend
docker build -t go-runner .

# 3. Start server
npm run dev

# 4. Visit localhost:8080
```