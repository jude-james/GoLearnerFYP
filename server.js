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

wss.on("connection", (ws) => {
    console.log("Successfully connected to WebSocket client.");

    ws.on("message", (message) => {
        console.log("Received message from client:", message.toString());

        // TODO check if message is a terminate first, then handle below 

        const { fileName, code } = JSON.parse(message.toString());

        const tmpDir = path.join(__dirname, "tmp"); 

        // Write user submitted Go file to the tmp folder
        try {
            fs.writeFileSync(`${tmpDir}/${fileName}`, code);

            // Spawn a process that runs the docker image
            const docker = spawn("docker", ["run", "--rm", "-v", `${tmpDir}:/app`, "go-runner", `go run ${fileName}`]);
            console.log("Running docker image (go-runner)...");

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
                console.log(`Child process exited with code ${code}`);
                ws.close();
            });
        }
        catch (err) {
            console.error(err);

            ws.send(JSON.stringify({ data: "Couldn't write file.", type: "err" }))
            ws.close();
        }
    });

    ws.on("error", (error) => {
        console.error("WebSocket error:", error);
    });

    ws.on("close", () => {
        console.log("Disconnected from WebSocket client.");
    });
})

// Start the server
server.listen(port, () => {    
    console.log(`Server is running, app listening at http://localhost:${port}`);
});