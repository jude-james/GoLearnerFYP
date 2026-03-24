import { courses } from "./contentManager.js";

const tableOfContents = document.querySelector(".table-of-contents");

// Creates the HTML elements and populates them with the tutorial content
for (let j = 0; j < courses.length; j++) {
    const course = courses[j];

    const div = document.createElement("div");
    div.className = "course";
    div.innerHTML = `
        <img src="assets/images/course-icon.png" class="course-icon"/>
        <h1 style="text-decoration: underline; text-decoration-color: var(--${course.colour});">${course.title}</h1>
        <p>${course.description}</p>
        <button class="colland-button" id="${course.title}">Expand All</button>
    `;
    
    tableOfContents.append(div);

    for (let i = 0; i < course.chapters.length; i++) {
        let chapter = course.chapters[i];
        const button = document.createElement("button");
        button.className = `chapter ${course.title}`;

        button.innerHTML = `
            <h2>Chapter ${i+1}: ${chapter.title}</h2>
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

// Expand or collapse individual chapter sections on click
var collapsable = document.querySelectorAll(".chapter");

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

// Expand or collapse all chapter sections matching the colland button 

var collandButton = document.querySelectorAll(".colland-button");

collandButton.forEach(button => {
    var expanded = false;

    button.addEventListener("click", () => {
        for (const course of courses) {
            if (button.id === course.title) {                
                // Only collapse/expand chapters in that course
                var collapsable = document.querySelectorAll(`.${course.title}`);

                if (expanded) {
                    button.textContent = "Expand All";
                    // Force collapse all
                    for (let i = 0; i < collapsable.length; i++) {
                        collapsable[i].classList.remove("active");
                        let section = collapsable[i].nextElementSibling;
                        section.style.maxHeight = null;
                    }
                }
                else {
                    button.textContent = "Collapse All";
                    // Force expand all
                    for (let i = 0; i < collapsable.length; i++) {
                        collapsable[i].classList.add("active");
                        let section = collapsable[i].nextElementSibling;
                        section.style.maxHeight = section.scrollHeight + "px";
                    }
                }
                expanded = !expanded;
            }
        }
    });
});