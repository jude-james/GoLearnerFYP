const outputConsole = document.querySelector(".console");
const fileName = document.querySelector(".filename");
const runButton = document.getElementById("run");
const errorMessage = document.querySelector(".error-message");

const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    mode: "text/x-go",
    theme: "xq-light",
});

const initialCode = editor.getValue();

// Listen for changes from text editor
editor.on("change", () => {
    sessionStorage.setItem("autosave", editor.getValue());
});

// If data was saved then update text editor
const saved = sessionStorage.getItem("autosave");
if (saved !== null) {
    editor.setValue(saved);
}

runButton.addEventListener("click", () => {
    runButton.disabled = true;
    updateConsole("Loading remote server...", false);
    sendRequest();
});

document.getElementById("reset").addEventListener("click", () => {
    editor.setValue(initialCode);
});

document.getElementById("dismiss").addEventListener("click", () => {
    errorMessage.classList.remove("error-visible");
});

document.getElementById("copy").addEventListener("click", () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
        console.log("Copied to clipboard");
    }).catch(error => {
        console.warn("Failed to copy:", error);
        displayError("Failed to copy:", error)
    });
});

/**
 * Sends POST request to /ask endpoint with fileName and code as json object
 */
async function sendRequest() {
    console.log("Sending POST request.");
    
    const url = "/run";
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fileName: fileName.innerText, code: editor.getValue() })
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        console.log(result);

        runButton.disabled = false;
        displayResult(result);
    } 
    catch (error) {
        console.error(error.message);
        displayError("Couldn't connect to remote server")
    }
}

/**
 * Displays the result fetched, checking the type of JSON returned
 * @param {any} result - The JSON object returned from backend
 */
function displayResult(result) {
    if ("issue" in result) {
        console.error(result.issue);
        displayError(result.issue)
    }
    else if ("error" in result) {
        updateConsole(result.error, true);
    }
    else {
        updateConsole(result.output, false);
    }
}

/**
 * Updates the console output and text colour.
 * @param {string} output - The output to be printed to the console.
 * @param {boolean} isError - If the output was an error message.
 */
function updateConsole(output, isError) {
    outputConsole.textContent = output;

    if (isError) {
        outputConsole.classList.add("console-error");
    }
    else {
        outputConsole.classList.remove("console-error");
    }
}

/**
 * Displays the generic error window and updates the message.
 * @param {string} message - The error message to be displayed
 */
function displayError(message) {
    document.querySelector('.error-message p').textContent = `Error: ${message}`;
    errorMessage.classList.add("error-visible");
    updateConsole("", false)
}