const http = require("http");
const WebSocket = require("ws")
const express = require("express");

const cors = require("cors");
const helmet = require("helmet");

const path = require("path");
//const fs = require("fs");
const { spawn } = require("child_process");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const port = 8080;

const goDirectory = path.join(__dirname, "gobackend"); 

let containerName;

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
 * Spawns a child process to kill any docker container with the current container name
 */
function killDockerProcess() {
    console.log("Spawning child process to kill docker container.");

    const killer = spawn("docker", ["kill", containerName]);
    killer.on("error", (error) => console.error('Failed to kill container:', error));
}

wss.on("connection", (ws) => {
    console.log("Successfully connected to WebSocket client.");

    ws.on("message", (message) => {
        console.log("Received message from client:", message.toString());

        // Message from client can be of type run, or terminate
        const msg = JSON.parse(message.toString());
        switch (msg.type) {
            case "terminate":
                killDockerProcess();
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
                    "-v", `${goDirectory}:/app`,
                    "go-runner",
                    "sh", "/app/entrypoint.sh",
                    msg.code
                ]);

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

                docker.on("close", (code) => {
                    // TODO send events json before closing ws
                    // I think it would be better to send as data instead of file
                    // if no new file is made it might send previous file with incorrect data
                    console.log(`Child process exited with code ${code}`);
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
            console.error("Unexpected disconnection from client. Killing currently running docker container.")
            killDockerProcess();
        }
    });
})

// Start the server
server.listen(port, () => {    
    console.log(`Server is running, app listening at http://localhost:${port}`);
});