import {
    getCurrentTopic,
    getNextTopic,
    getPreviousTopic,
    getCurrentChapter,
    getNextChapter,
    getCurrentChapterStart,
    getNextChapterStart,
    getCurrentChapterLength,
    getCurrentTopicIndex,
    getCurrentTopicFile,
    getCurrentTopicCode,
    getCurrentCourse
} from "./contentManager.js";

import { displayError } from "./errorPopup.js";

const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
const current = document.getElementById("current");

const topic = getCurrentTopic();
const nextTopic = getNextTopic();
const prevTopic = getPreviousTopic();

init();

/**
 * Loads the relevant topic data from the content manager onto the page
 */
async function init() {
    // Check page layout matches with current topic layout, to prevent user from visiting a topic with a different html layout
    const page = window.location.pathname.split("/").pop();
    
    // If pages topic slug doesn't exist, or topic layout doesn't match, return to index
    if (!topic || (page != topic.layout)) {
        window.location.href = "/index.html";
        return;
    }

    document.title = topic.title;

    // Set current topic title text and progress indicator
    current.textContent = topic.title + ` (${getCurrentTopicIndex()}/${getCurrentChapterLength()})`;

    // Set course accent colour
    const course = getCurrentCourse();
    document.documentElement.style.setProperty('--course-colour', `var(--${course.colour})`);
    
    if (topic.markdown) {
        const markdown = await getCurrentTopicFile(topic.markdown);

        if (markdown) {
            // Parse the markdown to HTML using the marked library
            const html = marked.parse(markdown);
            document.querySelector(".markdown").innerHTML = html;
        }
        else {
            displayError(`Cannot find markdown file: ${topic.markdown}`);
        }
    }

    if (topic.goFile) {
        document.querySelector(".file-name").textContent = topic.goFile;
        
        const { getEditor } = await import("./sandbox.js");
        const editor = getEditor();

        // Check there is no existing session state before updating the editor code
        const saved = sessionStorage.getItem(window.location.pathname + window.location.search);
        if (saved === null) {            
            const code = await getCurrentTopicCode();
            
            if (code) {                
                editor.setValue(code);
            }
            else {                
                displayError(`Cannot find Go file: ${topic.goFile}`);
            }
        }
    }

    if (topic.goSolution) {
        const { getCodeWindow } = await import("./exercise.js");
        const codeWindow = getCodeWindow();

        const solution = await getCurrentTopicFile(topic.goSolution);

        if (solution) {
            codeWindow.setValue(solution);
        }
        else {
            displayError(`Cannot find Go file: ${topic.goSolution}`);
        }
    }

    if (topic.question) {
        document.querySelector(".question").textContent = topic.question;

        // Set each option to each radio button span
        const options = topic.options;
        const spans = document.querySelectorAll('input[name="radio"] + span');

        for (let i = 0; i < options.length; i++) {
            spans[i].textContent = options[i];
        }

        const answerIndex = topic.answer;
            
        const correctMessage = document.querySelector(".correct-message");
        const incorrectMessage = document.querySelector(".incorrect-message");

        document.getElementById("mcq").addEventListener("submit", function(e) {
            e.preventDefault();

            const radios = Array.from(this.elements["radio"]);
            const checkedIndex = radios.findIndex(radio => radio.checked) + 1;

            if (checkedIndex === answerIndex) {
                correctMessage.style.setProperty("visibility", "visible");
                incorrectMessage.style.setProperty("visibility", "hidden");
            }
            else {
                incorrectMessage.style.setProperty("visibility", "visible");
                correctMessage.style.setProperty("visibility", "hidden");
            }
        });
    }

    if (topic.layout === "summary.html") {
        for (let i = 0; i < 4; i++) {
            const markdown = await getCurrentTopicFile(`tab_${i}.md`);

            if (markdown) {
                const label = document.querySelector(`label[for="tab_${i}"]`);
                
                const html = marked.parse(markdown);
                label.querySelector('.content').innerHTML = html;
            }
            else {                
                displayError(`Cannot find markdown file: ${topic.markdown}`);
            }
        }
    }

    if (topic.message) {
        document.querySelector(".message").textContent = topic.message;

        const firstTopic = getCurrentChapterStart();

        const restartChapterButton = document.getElementById("restart-chapter-button");

        restartChapterButton.textContent = `<-- Restart Chapter: ${getCurrentChapter().title}`;
        restartChapterButton.onclick = () => {            
            window.location.href = `/${firstTopic.layout}?topic=${firstTopic.slug}`;
        };
        
        const nextChapterStart = getNextChapterStart();
        
        const nextChapterButton = document.getElementById("next-chapter-button");

        if (nextChapterStart) {
            nextChapterButton.textContent = `--> Next Chapter: ${getNextChapter().title}`;
            nextChapterButton.onclick = () => {
                window.location.href = `/${nextChapterStart.layout}?topic=${nextChapterStart.slug}`;
            };
        }
        else {
            nextChapterButton.disabled = true;
        }
    }

    // Set page navigation links
    if (nextTopic) {
        nextButton.textContent = nextTopic.title + " >";

        nextButton.onclick = () => {
            window.location.href = `/${nextTopic.layout}?topic=${nextTopic.slug}`;
        };
    }
    else {
        nextButton.disabled = true;
    }

    if (prevTopic) {
        prevButton.textContent = "< " + prevTopic.title;

        prevButton.onclick = () => {
            window.location.href = `/${prevTopic.layout}?topic=${prevTopic.slug}`;
        };
    }
    else {
        prevButton.disabled = true;
    }
}