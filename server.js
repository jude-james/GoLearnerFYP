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
const timeoutLimit = 10; // Seconds
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
        if (code === 0) { // TODO add container name to msg
            console.log("Successfully killed container, exit code:", code);
        } 
        else {
            console.error("Failed to kill container, exit code:", code);
        }
    });
}

wss.on("connection", async (ws) => {
    console.log("Successfully connected to WebSocket client.");

    // Store the container name for each connection instance
    let containerName;

    ws.on("message", async (message) => {
        console.log("Received message from client:", message.toString());

        // Message from client can be of type run, or terminate
        const msg = JSON.parse(message.toString());
        switch (msg.type) {
            case "terminate":
                killDockerProcess(containerName);
                break;
            case "run": 
                // Create a unique run Id for each connection instance
                const runId = `run-${Date.now()}`;
                // TODO add a random number too, and keep to like 6 digits?

                containerName = runId;

                try {
                    console.log("Creating temporary folder:", runId);
                    // Create temporary folder for current run
                    await fs.promises.mkdir(`gobackend/${runId}`, { recursive: true });
                    // Copy tracer.go into temporary folder
                    await fs.promises.copyFile("gobackend/tracer.go", `gobackend/${runId}/tracer.go`);
                }
                catch (error) {
                    // TODO test error works and websocket closes and execution stops
                    console.error("Error preparing run folder:", error);

                    const message = JSON.stringify({ data: "Server ran into an error.", type: "error" });
                    ws.send(message);

                    return;
                }

                // TODO run without calling ast_rewriter option, run-with-trace or trace-run something
                // create another sh script for the regular run, in a different folder
                console.log("Spawning child process to run docker image (go-runner)...");

                // Spawn a process that runs the docker image with the unique container name
                const docker = spawn("docker", [
                    "run", "--rm",
                    "--name", containerName,
                    "--cpus", cpuLimit,
                    "--memory", memoryLimit,
                    "--network", "none",
                    "--security-opt", "no-new-privileges=true",
                    "-e", `TIMEOUT=${timeoutLimit}`,
                    "-v", `${mountDir}:/app`,
                    "go-runner",
                    "sh", "/app/entrypoint.sh",
                    msg.fileName, msg.code, runId
                ]);

                // Handle process output streams and send data over socket

                docker.stdout.on("data", (data) => {
                    console.log(`stdout: ${data}`);                
                    const message = JSON.stringify({ data: data.toString(), type: "stdout" });
                    ws.send(message);
                });

                docker.stderr.on("data", (data) => {
                    console.error(`stderr: ${data}`);
                    const message = JSON.stringify({ data: data.toString(), type: "stderr" });
                    ws.send(message);
                });

                docker.on("error", (error) => {
                    console.error("Child process error:", error.message);
                    const message = JSON.stringify({ data: "Server ran into an error.", type: "error" });
                    ws.send(message);
                })

                docker.on("close", async (code) => {
                    console.log(`Child process exited with code ${code}`);

                    if (code === 0) {
                        try {
                            const fileContent = await fs.promises.readFile(`gobackend/${runId}/events.json`, "utf8");

                            const message = JSON.stringify({ data: JSON.parse(fileContent), type: "events" });
                            console.log("Sending message to server:", message);
                        
                            ws.send(message);
                        }
                        catch (error) {
                            console.error("Error reading file:", error);
                        }
                    }

                    // Delete temporary run folder on closure
                    console.log("Deleting temporary folder:", runId);
                    fs.rm(`gobackend/${runId}`, { recursive: true, force: true }, (error) => {
                        if (error) console.error("Failed to remove run folder:", error);
                    });

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