const http = require("http");
const WebSocket = require("ws")
const express = require("express");

const cors = require("cors");
const helmet = require("helmet");

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 8080;

// Docker run options
const cpuLimit = "2.0";
const memoryLimit = "256m";
const runtimeExecLimit = 60000; // 1 minute
const mountDir = path.join(__dirname, "gobackend"); 

// Middleware settings
app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: [`http://localhost:${port}`, `http://127.0.0.1:${port}`]
}));

app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

/**
 * Spawns a child process that kills the docker container with the given name
 * @param {string} containerName - The name of the container.
 */
function killDockerProcess(containerName) {
    console.log("Spawning child process to kill docker container...");

    const killer = spawn("docker", ["kill", containerName]);
    killer.on("close", (code) => {
        if (code === 0) {
            console.log("Successfully killed container, exit code:");
        } 
        else {
            console.error("Failed to kill container, exit code:", code);
        }
    });
}

wss.on("connection", (ws) => {
    console.log("Successfully connected to WebSocket client.");
    
    // Store the container name for each connection instance
    let containerName;

    ws.on("message", (message) => {
        console.log("Received message from client:", message.toString());

        // Message from client can be of type run, or terminate
        const msg = JSON.parse(message.toString());
        switch (msg.type) {
            case "terminate":
                killDockerProcess(containerName);
                break;
            case "run": 
                // TODO run without calling ast_rewriter option, run-with-trace or trace-run something
                // create another sh script for the regular run, in a different folder
                console.log("Spawning child process to run docker image (go-runner)...");

                // Spawn a process that runs the docker image with a unique container name
                containerName = `runner-${Date.now()}`;
                
                const docker = spawn("docker", [
                    "run", "--rm",
                    "--name", containerName,
                    "--cpus", cpuLimit,
                    "--memory", memoryLimit,
                    "--network", "none",
                    "--security-opt", "no-new-privileges=true",
                    "-v", `${mountDir}:/app`,
                    "go-runner",
                    "sh", "/app/entrypoint.sh",
                    msg.fileName, msg.code
                ]);

                // Set a timeout to kill the docker process after the given milliseconds
                const timeout = setTimeout(() => {
                    console.log("Timeout reached.");
                    killDockerProcess(containerName);
                    const message = JSON.stringify({ data: "Execution time limit reached.", type: "stderr" })
                    ws.send(message);
                }, runtimeExecLimit) 

                // Handle process output streams and send data over socket

                docker.stdout.on("data", (data) => {
                    console.log(`stdout: ${data}`);                
                    const message = JSON.stringify({ data: data.toString(), type: "stdout" })
                    ws.send(message);
                });

                docker.stderr.on("data", (data) => {
                    console.error(`stderr: ${data}`);
                    const message = JSON.stringify({ data: data.toString(), type: "stderr" })
                    ws.send(message);
                });

                docker.on("error", (error) => {
                    console.error("Child process error:", error.message);
                    const message = JSON.stringify({ data: "Server ran into an error.", type: "error" })
                    ws.send(message);
                })

                docker.on("close", (code) => {
                    console.log(`Child process exited with code ${code}`);

                    clearTimeout(timeout);

                    // TODO send events json before closing ws
                    if (code === 0) {
                        // Delete the temporary user file to clean up folder
                        console.log("Deleting temporary user file.");
                        fs.unlink(path.join(mountDir + "/runs", msg.fileName), (error) => {
                            if (error) {
                                console.error('Failed to delete file:', error);
                            }
                        });

                        // if (events.json exists)
                        // ws.send( {type: events data: events.json (as data?) } )
                    }

                    ws.close();
                });
                break;
            default:
                console.warn("Unknown message type:", msg.type);
        }
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error.message);
    });

    ws.on("close", (code) => {
        console.log("Disconnected from WebSocket client with code:", code);

        if (code !== 1005) {
            console.error("Unexpected disconnection from client. Killing currently running docker container.");
            killDockerProcess(containerName);
        }
    });
})

// Start the server
server.listen(port, () => {    
    console.log(`Server is running, app listening at http://localhost:${port}`);
});