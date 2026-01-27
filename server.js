const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const { spawn } = require('child_process');

const app = express();

const tmpDir = path.join(__dirname, "tmp");

const port = 8080;

// Middleware settings
app.use(helmet({
    contentSecurityPolicy: false
}));

app.use(cors({
    origin: [`http://localhost:${port}`, `http://127.0.0.1:${port}`]
}));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/run", async (req, res) => { 
    console.log("Received POST request with body:", req.body);

    const { fileName, code } = req.body;
    
    // Write Go file to the tmp folder
    try {
        fs.writeFileSync(`${tmpDir}/${fileName}`, code);

        // Run docker image
        console.log("Running docker image (go-runner)...");
        
        let stdout = "";
        let stderr = "";

        // Spawn a process that runs the docker image
        const docker = spawn("docker", ["run", "--rm", "-v", `${tmpDir}:/app`, "go-runner", `go run ${fileName}`]);
        //const go = spawn("go", ["run", `tmp/${fileName}`]);

        // Handle process output streams
        docker.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
            stdout += data.toString();
        });

        docker.stderr.on("data", (data) => {
            console.error(`stderr: ${data}`);
            stderr += data.toString();
        });

        docker.on("close", (code) => {
            console.log(`Child process exited with code ${code}`);
            if (code === 0) {
                res.json({ output: stdout })
            }
            else {
                res.json({ error: stderr })
            }
        });
    }
    catch (err) {
        console.error(err);
        res.json({ issue: "File error." });
    }
})

// Start the server
app.listen(port, () => {    
    console.log(`Server is running, app listening at http://localhost:${port}`);
});