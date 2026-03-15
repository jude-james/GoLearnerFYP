import { displayError } from "./errorPopup.js";

import { getCurrentTopicCode } from "./contentManager.js";

const outputConsole = document.querySelector(".console");
const fileName = document.querySelector(".file-name");
const runButton = document.getElementById("run-button");

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

    clearConsole();
    updateConsole("Connecting to server...", false);

    createWebSocket();
});

document.getElementById("reset-button").addEventListener("click", async () => {
    const code = await getCurrentTopicCode();
    if (code) {
        editor.setValue(code);
        console.log("Reset");
    }
    else {
        console.warn("Failed to reset");
        displayError("Failed to reset");
    }
});

document.getElementById("copy-button").addEventListener("click", () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
        console.log("Copied to clipboard");
    }).catch(error => {
        console.warn("Failed to copy:", error);
        displayError("Failed to copy:", error)
    });
});

/**
 * Opens a web socket connection between the client and the server 
 * Sends the fileName and code as a json object, then waits for data to output to the console
 */
function createWebSocket() {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => {
        console.log("Successfully connected to WebSocket server.");
        clearConsole();

        console.log(`Sending ${fileName.textContent} to server.`);
        const message = JSON.stringify({ fileName: fileName.textContent, code: editor.getValue() });
        ws.send(message);
    }

    ws.onmessage = (event) => {
        console.log("Received message from server:", event.data.toString());

        // err type is separate from stdout and stderr, represents an error from the backend, not from the user submitted program
        const { data, type } = JSON.parse(event.data.toString());
        if (type === "stderr") {
            updateConsole(data, true);
        }
        else if (type === "err") {
            console.error(data);
            displayError(data);
        }
        else {
            updateConsole(data, false);
        }

        // TODO check for events data
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error.message);
        displayError("Couldn't connect to WebSocket server.")
        clearConsole();
    }

    ws.onclose = () => {
        console.log("Disconnected from WebSocket server.");
        runButton.disabled = false;
    };
}

/**
 * Updates the console output and text colour.
 * @param {string} output - The output to be printed to the console.
 * @param {boolean} isError - If the output was an error message.
 */
function updateConsole(output, isError) {
    outputConsole.textContent += output;

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