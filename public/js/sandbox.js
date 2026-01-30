const outputConsole = document.querySelector(".console");
const fileName = document.querySelector(".filename");
const runButton = document.getElementById("run");

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

document.getElementById("copy").addEventListener("click", () => {
    navigator.clipboard.writeText(editor.getValue()).then(() => {
        console.log("Copied to clipboard");
        // TODO add message saying if copied successfully, in the same area as error message, but green
    }).catch(err => {
        console.error("Failed to copy:", err);
        // TODO display this error message in the same area as the backend server error messages
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
    catch (error) {
        console.error(error.message);
    }
}

function displayOutput(result) {
    if ("issue" in result) {
        // TODO add separate UI element for generic backend errors
        console.error(result.issue); 
    }
    else if ("error" in result) {
        updateConsole(result.error, true);
    }
    else {
        updateConsole(result.output, false);
    }
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