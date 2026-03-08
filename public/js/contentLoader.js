import {
    getCurrentTopic,
    getNextTopic,
    getPreviousTopic,
    getCurrentChapterLength,
    getCurrentTopicIndex,
    getCurrentTopicCode
} from "./contentManager.js";

import { displayError } from "./errorPopup.js";

import { getEditor } from "./sandbox.js";

const nextButton = document.getElementById("next-button");
const prevButton = document.getElementById("prev-button");
const current = document.getElementById("current");

const topic = getCurrentTopic();
const nextTopic = getNextTopic();
const prevTopic = getPreviousTopic();

init();

// TODO add comments
async function init() {
    if (!topic) {
        window.location.href = "/index.html";
        return;
    }

    document.title = topic.title;
    current.textContent = topic.title + ` (${getCurrentTopicIndex()}/${getCurrentChapterLength()})`;

    if (topic.markdown) {
        loadMarkdown(topic.markdown);
    }

    // TODO comment all this
    if (topic.goFile) {
        document.querySelector(".file-name").textContent = topic.goFile;
        
        const editor = getEditor();

        const saved = sessionStorage.getItem(window.location.pathname + window.location.search);
        if (saved === null) {
            const code = await getCurrentTopicCode();
            if (code) {
                editor.setValue(code);
            }
            else {
                displayError("Cannot find Go file");
            }
        }
    }

    if (nextTopic) {
        nextButton.textContent = nextTopic.title + " >";

        nextButton.onclick = () => {
            window.location.href =
            `/${nextTopic.layout}?topic=${nextTopic.slug}`;
        };
    }
    else {
        nextButton.disabled = true;
    }

    if (prevTopic) {
        prevButton.textContent = "< " + prevTopic.title;

        prevButton.onclick = () => {
            window.location.href =
            `/${prevTopic.layout}?topic=${prevTopic.slug}`;
        };
    }
    else {
        prevButton.disabled = true;
    }
}

// TODO add comments
async function loadMarkdown(fileName) {
    try {
        const response = await fetch(`/content/${topic.slug}/${fileName}`);

        if (!response.ok) {
            displayError(`Cannot find markdown file: ${fileName}`)
            return;
        }

        const markdown = await response.text();
        const html = marked.parse(markdown);
        document.querySelector(".left-panel").innerHTML = html;
    } 
    catch (error) {
        console.error(error.message);
    }
}