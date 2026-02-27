const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    readOnly: "nocursor",
    mode: "text/x-go",
    theme: "material-darker",
});