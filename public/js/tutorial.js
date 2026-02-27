import { chapters } from "./content.js";

window.onload = function() {
    console.log("Loaded");

    // On load function, checks number in URL, if there is none then it should show
    // the contents page
    renderTableOfContents();
}

function goTo(index, chapter) {
    console.log("Chapter:", chapter);
    console.log("Index:", index);

    // now access that from the content list, or just attach the data to the button?
}

function renderTableOfContents() {
    let html = "<h1>Table of Contents</h1><ul>";

    chapters.forEach((chapter, i) => {
        html += `<p> ${i + 1} - ${chapter.title} </p>`;
        chapter.chapter.forEach((content, j) => {
            html += `
            <li>
                <a href="tutorial/${chapter.title}/${j + 1}" class="content-button" data-index=${j} data-chapter=${i}>
                    ${j + 1} - ${content.type}  - ${content.content.title}
                </a>
            </li>`;
        });
    });

    html += "</ul>";

    document.querySelector(".main").innerHTML = html;
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("content-button")) {
        e.preventDefault();

        const i = parseInt(e.target.dataset.index);
        const chapter = parseInt(e.target.dataset.chapter);
        
        goTo(i, chapter);
    }
});