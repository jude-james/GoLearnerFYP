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
    /*readOnly: true,*/ /* TODO use later for readonly sections */
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
    }).catch(err => {
        console.error("Failed to copy:", err);
        displayError("Failed to copy:", err)
    });
});

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
        displayOutput(result);
    } 
    catch (err) {
        console.error(err.message);
        displayError("Couldn't connect to remote server")
    }
}

function displayOutput(result) {
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

function displayError(message) {
    document.querySelector('.error-message p').textContent = `Error: ${message}`;
    errorMessage.classList.add("error-visible");
}

function updateConsole(output, err) {
    outputConsole.textContent = output;

    if (err) {
        outputConsole.classList.add("console-error");
    }
    else {
        outputConsole.classList.remove("console-error");
    }
}