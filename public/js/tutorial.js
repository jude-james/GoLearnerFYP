var expandCollapseBtn = document.getElementById("expand-collapse-button");
var collapsable = document.getElementsByClassName("collapsible");

var expanded = false;

// Expand or collapse individual chapter sections on click
for (let i = 0; i < collapsable.length; i++) {
    collapsable[i].addEventListener("click", function() {
        this.classList.toggle("active");
        content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } 
        else {
            content.style.maxHeight = content.scrollHeight + "px";
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
            content = collapsable[i].nextElementSibling
            content.style.maxHeight = null;
        }
    }
    else {
        expandCollapseBtn.textContent = "Collapse All";
        // Force expand all
        for (let i = 0; i < collapsable.length; i++) {
            collapsable[i].classList.add("active");
            content = collapsable[i].nextElementSibling;
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }
    expanded = !expanded;
});