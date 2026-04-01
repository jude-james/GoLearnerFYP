# GoLearner

## Overview

An interactive concurrency tutorial in Go.

## How To Run

These are the run instructions for markers who have downloaded the whole code-base. Please contact me or supervisor if you run into problems.

### Prerequisites

- Node.js v22 or higher
- Docker

### Setup

```bash
# 1. Download and change directory
cd GoLearner

# 2. Build docker image
docker build -t go-runner .

# 3. Start server
npm run dev

# 4. Visit localhost:8080
```