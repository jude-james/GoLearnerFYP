const codeWindow = CodeMirror.fromTextArea(document.getElementById("code-solution"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    readOnly: "nocursor",
    mode: "text/x-go",
    theme: "yonce",
});

export function getCodeWindow() {
    return codeWindow;
}