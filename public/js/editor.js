const editor = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    mode: "text/x-go",
    theme: "material-darker"
});

// TODO use this later 
export function getEditor() {
    editor.setOption("theme", "xq-light");
    return editor;
}