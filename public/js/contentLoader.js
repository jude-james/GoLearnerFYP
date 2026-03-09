import {
    getCurrentTopic,
    getNextTopic,
    getPreviousTopic,
    getCurrentChapter,
    getNextChapter,
    getNextChapterStart,
    getCurrentChapterStart,
    getCurrentChapterLength,
    getCurrentTopicIndex,
    getCurrentTopicMarkdown,
    getCurrentTopicCode,
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

    if (topic.goFile) {
        document.querySelector(".file-name").textContent = topic.goFile;
        
        const { getEditor } = await import("./sandbox.js");
        const editor = getEditor();

        // Checks there is no existing session state before updating the editor code
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