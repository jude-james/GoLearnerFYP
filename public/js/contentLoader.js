import {
    getCurrentTopic,
    getNextTopic,
    getPreviousTopic,
    getCurrentChapterLength,
    getCurrentTopicIndex,
    getCurrentTopicMarkdown,
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

/**
 * Loads the relevant topic data from the content manager onto the page
 */
async function init() {
    if (!topic) {
        window.location.href = "/index.html";
        return;
    }

    document.title = topic.title;
    current.textContent = topic.title + ` (${getCurrentTopicIndex()}/${getCurrentChapterLength()})`;

    if (topic.markdown) {
        const markdown = await getCurrentTopicMarkdown();

        if (markdown) {
            // Parse the markdown to HTML using the marked library
            const html = marked.parse(markdown);
            document.querySelector(".left-panel").innerHTML = html;
        }
        else {
            displayError(`Cannot find markdown file: ${topic.markdown}`);
        }
    }

    // TODO comment all this
    if (topic.goFile) {
        document.querySelector(".file-name").textContent = topic.goFile;
        
        const editor = getEditor();

        // Check that there is no existing session state before updating the editor code
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