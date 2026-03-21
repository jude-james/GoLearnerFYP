const codeWindow = CodeMirror.fromTextArea(document.getElementById("code"), {
    lineNumbers: true,
    smartIndent: true,
    indentUnit: 4,
    indentWithTabs: true,
    styleActiveLine: true,
    readOnly: "nocursor",
    mode: "text/x-go",
    theme: "material-darker",
});

codeWindow.setSize("100%", "100%");

const message = 
`myMsg := "Welcome to GoLearner!"
    fmt.Println(myMsg)`
;

let animatedMessage = ``;
let template;

function updateTemplate() {
    template = 
`package main

import "fmt"

func main() {
    ${animatedMessage} 
}`;
}

function typewriter() {
    const typingSpeed = 80;
    const deletingSpeed = 45;
    const pauseAfterType = 2000;
    const pauseAfterDelete = 800;

    let index = 0;
    let deleting = false;

    function tick() {
        if (!deleting) {
            animatedMessage = message.slice(0, index + 1) + "|";
            updateTemplate();
            codeWindow.setValue(template);

            index++;

            if (index === message.length) {
                deleting = true;
                setTimeout(tick, pauseAfterType);
                return;
            }

            setTimeout(tick, typingSpeed);
        } 
        else {
            animatedMessage = message.slice(0, index - 1) + "|";
            updateTemplate();
            codeWindow.setValue(template);
        
            index--;

            if (index === 0) {
                deleting = false;
                setTimeout(tick, pauseAfterDelete);
                return;
            }

            setTimeout(tick, deletingSpeed);
        }
    }

    tick();
}

typewriter();