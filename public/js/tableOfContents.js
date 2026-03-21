import { courses } from "./contentManager.js";

const tableOfContents = document.querySelector(".table-of-contents");

// Creates the HTML elements and populates them with the tutorial content
for (let j = 0; j < courses.length; j++) {
    const course = courses[j];

    // TODO accent colour

    const div = document.createElement("div");
    div.className = "course";
    div.innerHTML = `
        <img src="assets/images/course-icon.png" class="course-icon"/>
        <h1>${course.title}</h1>
        <p>${course.description}</p>
        <button id="colland-button">Expand All</button>
    `; // TODO fix button
    
    tableOfContents.append(div);

    for (let i = 0; i < course.chapters.length; i++) {
        let chapter = course.chapters[i];
        const button = document.createElement("button");
        button.className = "chapter";

        button.innerHTML = `
            <h1>Chapter ${i+1}: ${chapter.title}</h1>
            <p>${chapter.description}</p>
        `;

        const div = document.createElement("div");
        div.className = "topics";

        const ol = document.createElement("ol");

        // For each topic, it is added to the ordered list and the link is set
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
    }
}


var expandCollapseBtn = document.getElementById("expand-collapse-button");
var collapsable = document.getElementsByClassName("chapter");

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

// TODO fix for all buttons

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