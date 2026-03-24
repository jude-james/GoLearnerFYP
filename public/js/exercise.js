const codeWindow = CodeMirror.fromTextArea(document.getElementById("code-solution"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    readOnly: "true",
    mode: "text/x-go",
    theme: "yonce",
});

codeWindow.setSize("100%", "100%");

export function getCodeWindow() {
    return codeWindow;
}

const codeMirrorWrapper = codeWindow.getWrapperElement();
const blur = document.querySelector('.blur-overlay');
codeMirrorWrapper.appendChild(blur);

// Remove blur to reveal code solution
blur.addEventListener("click", function() {
    this.classList.add("hidden");
});