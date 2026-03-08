import { content } from "./contentManager.js";

const tableOfContents = document.querySelector(".table-of-contents");

// TODO add comments
content.forEach(chapter => {
    const button = document.createElement("button");
    button.className = "collapsible";

    button.innerHTML = `
        <h1>${chapter.title}</h1>
        <p>${chapter.description}</p>
    `;

    const div = document.createElement("div");
    div.className = "section";

    const ol = document.createElement("ol");

    chapter.topics.forEach(topic => {
        const li = document.createElement("li");

        const link = document.createElement("a");
        link.href = `${topic.layout}?topic=${topic.slug}`;
        link.textContent = topic.title;

        li.appendChild(link);
        ol.appendChild(li);
    });

    div.appendChild(ol);

    tableOfContents.appendChild(button);
    tableOfContents.appendChild(div);
});

var expandCollapseBtn = document.getElementById("expand-collapse-button");
var collapsable = document.getElementsByClassName("collapsible");

var expanded = false;

// Expand or collapse individual chapter sections on click
for (let i = 0; i < collapsable.length; i++) {
    collapsable[i].addEventListener("click", function() {
        this.classList.toggle("active");
        let section = this.nextElementSibling;
        if (section.style.maxHeight) {
            section.style.maxHeight = null;
        } 
        else {
            section.style.maxHeight = section.scrollHeight + "px";
        }
    });
}

// Expand or collapse all chapter sections
expandCollapseBtn.addEventListener("click", () => {
    if (expanded) {
        expandCollapseBtn.textContent = "Expand All";
        // Force collapse all
        for (let i = 0; i < collapsable.length; i++) {
            collapsable[i].classList.remove("active");
            let section = collapsable[i].nextElementSibling;
            section.style.maxHeight = null;
        }
    }
    else {
        expandCollapseBtn.textContent = "Collapse All";
        // Force expand all
        for (let i = 0; i < collapsable.length; i++) {
            collapsable[i].classList.add("active");
            let section = collapsable[i].nextElementSibling;
            section.style.maxHeight = section.scrollHeight + "px";
        }
    }
    expanded = !expanded;
});