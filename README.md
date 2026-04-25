# GoLearner

## Codebase overview

- All frontend code is within the public/ directory
- The tutorial content is within the content/ directory
- JavaScript backend is handled in server.js
- codeExecutor.js handles connection with server.js
- Go backend is within gobackend/ directory, which contains the Dockerfile and all Go code

## How To Run

Please contact my supervisor if you run into problems.

### Prerequisites

- Node.js v22 or higher (https://nodejs.org/en)
- Docker (https://www.docker.com/get-started/)

### Setup

```bash
# 1. Download and change directory
cd GoLearner

# 2. Build docker image
cd gobackend
docker build -t go-runner .

# 3. Install packages
npm install

# 4. Start server
npm run dev

# 5. Visit localhost:8080
```