import { displayError } from "./errorPopup.js";

import { getCurrentTopicCode } from "./contentManager.js";

const outputConsole = document.querySelector(".console");
const fileName = document.querySelector(".file-name");
const runButton = document.getElementById("run-button");
const terminateButton = document.getElementById("terminate-button");
const resetButton = document.getElementById("reset-button");
const copyButton = document.getElementById("copy-button");

let ws;

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    mode: "text/x-go",
    theme: "material-darker"
});

editor.setSize("100%", "100%");

export function getEditor() {
    return editor;
}

// Listen for changes from text editor
editor.on("change", () => {    
    sessionStorage.setItem(window.location.pathname + window.location.search, editor.getValue());
});

// If data was saved then restore the text editor
const saved = sessionStorage.getItem(window.location.pathname + window.location.search);
if (saved !== null) {
    editor.setValue(saved);
}

runButton.addEventListener("click", () => {
    runButton.disabled = true;
    terminateButton.disabled = false;

    clearConsole();
    updateConsole("Connecting to server...", false);

    startWebSocket();
});

terminateButton.addEventListener("click", () => {
    if (ws.readyState === WebSocket.OPEN) 
    {
        const message = JSON.stringify({ type: "terminate" });
        console.log("Sending message to server:", message);
        ws.send(message);
    }
});

resetButton.addEventListener("click", async () => {
    const code = await getCurrentTopicCode();
    if (code) {
        editor.setValue(code);
        console.log("Reset.");
    }
    else {
        console.warn("Failed to reset.");
        displayError("Failed to reset.");
    }
});

copyButton.addEventListener("click", () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
        console.log("Copied to clipboard.");
    }).catch(error => {
        console.warn("Failed to copy:", error);
        displayError("Failed to copy:", error)
    });
});

/**
 * Opens a web socket connection between the client and the server 
 * Sends the fileName and code as a json object, then waits for data to output to the console
 */
function startWebSocket() {
    ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
        console.log("Successfully connected to WebSocket server.");

        const message = JSON.stringify({ fileName: fileName.textContent, code: editor.getValue(), type: "run" });
        console.log("Sending message to server:", message);
        ws.send(message);
    }

    ws.onmessage = async (event) => {
        console.log("Received message from server:", event.data.toString());

        // Message from server can be of type error, events, stdout or stderr. The latter 2 refer to the docker process
        const message = JSON.parse(event.data.toString());
        switch (message.type) {
            case "start":                
                clearConsole();
                break;
            case "stdout":
                updateConsole(message.data, false);
                break;
            case "stderr":
                updateConsole(message.data, true);
                break;
            case "error":
                console.error(message.data);
                displayError(message.data);
                break;
            case "events":
                try { // TODO move this to top?
                    const { init } = await import('./visualiser.js');
                    init(message.data);
                }
                catch (error) {
                    console.warn("Could not init visualiser:", error);
                }
                break;
            default:
                console.warn("Unknown message type:", message.type);
        }
    };

    ws.onerror = () => {
        console.error("WebSocket encountered an error.");
        clearConsole();
    }

    ws.onclose = (event) => {
        console.log("Disconnected from WebSocket server with code:", event.code);

        runButton.disabled = false;
        terminateButton.disabled = true;

        if (!event.wasClean) {
            displayError("Unexpected disconnection from server.")
        }
    };
}

/**
 * Updates the console output and text colour.
 * @param {string} output - The output to be printed to the console.
 * @param {boolean} isError - If the output was an error message.
 */
function updateConsole(output, isError) {
    outputConsole.textContent += output;

    const isAtBottom = outputConsole.scrollHeight - outputConsole.scrollTop - outputConsole.clientHeight < 40;
    if (isAtBottom) {
        outputConsole.scrollTop = outputConsole.scrollHeight;
    }

    if (isError) {
        outputConsole.classList.add("console-error");
    }
    else {
        outputConsole.classList.remove("console-error");
    }
}

function clearConsole() {
    outputConsole.textContent = "";
}