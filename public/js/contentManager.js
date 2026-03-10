/* 
Content array, holding all the content as a list of objects, which are divided into chapters
Each chapter is divided into topics, each topic is unique and has a unique identifier
Then each topic is divided into 3 formats: tutorial, quiz or exercise. 
*/
// eventually split this into courses? since it will have to be split into fundamentals and concurrency
// so order becomes content (everything) -> courses (fundamentals/concurrency) -> chapters -> topics -> (tutorial/quiz/exercise)
export const content = [
    {
        title: "Basics",
        description: "Learn all about the basics",
        topics: [
            {
                title: "Introduction",
                slug: "introduction",
                layout: "tutorial.html",
                markdown: "test.md",
                goFile: "welcome.go",
            },
            {
                title: "Variables",
                slug: "variables",
                layout: "tutorial.html",
                markdown: "test.md",
                goFile: "vars.go",
            },
            {
                title: "Functions",
                slug: "functions",
                layout: "tutorial.html",
                markdown: "test.md",
                goFile: "funcs.go",
            },
            {
                title: "Functions Exercise",
                slug: "functions_exercise",
                layout: "exercise.html",
                markdown: "test.md",
                goFile: "funcs.go",
                goSolution: "funcs_solution.go"
            },
            {
                title: "Chapter 1 Complete",
                slug: "chapter1",
                layout: "chapter-complete.html",
                message: "Congratulations! You have completed Chapter 1: Basics. You now understand..."
            }
        ]
    },
    {
        title: "Loops",
        description: "Learn all about loops",
        topics: [
            {
                title: "For loops",
                slug: "forloops",
                layout: "tutorial.html",
                markdown: "test.md",
                goFile: "forloop.go",
            },
            {
                title: "While Loops",
                slug: "whileloops",
                layout: "tutorial.html",
                markdown: "test.md",
                goFile: "whileloop.go",
            },
            {
                title: "Chapter 2 Complete",
                slug: "chapter2",
                layout: "chapter-complete.html",
                message: "Congratulations! You have completed chapter 2. You now understand..."
            }
        ]
    },
    {
        title: "Methods & Interfaces",
        description: "Learn all about methods and interfaces",
        topics: [
            {
                title: "Chapter 3 Complete",
                slug: "chapter3",
                layout: "chapter-complete.html",
                message: "Congratulations! You have completed Methods & Interfaces. You now understand..."
            }
        ]
    }
]

/**
 * Reads the current page slug then searches the content array to find the topic details
 */
function getCurrentTopicData() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("topic");

    for (let i = 0; i < content.length; i++) {
        const chapter = content[i];
        const topicIndex = chapter.topics.findIndex(t => t.slug === slug);

        if (topicIndex !== -1) {
            return {
                topic: chapter.topics[topicIndex],
                topicIndex: topicIndex,
                chapter,
                chapterIndex: i,
                chapterLength: chapter.topics.length
            };
        }
    }
    return null;
}

export function getCurrentTopic() {
    const result = getCurrentTopicData();
    if (result) {
        return result.topic;
    }
    else {
        return null;
    }
}

export function getNextTopic() {
    const result = getCurrentTopicData();
    if (!result) {
        return null;
    }

    const { chapter, topicIndex } = result;    
    return chapter.topics[topicIndex + 1] || null;
}

export function getPreviousTopic() {
    const result = getCurrentTopicData();
    if (!result) {
        return null;
    }

    const { chapter, topicIndex } = result;
    return chapter.topics[topicIndex - 1] || null;
}

export function getCurrentChapter() {
    const result = getCurrentTopicData();
    if (!result) {
        return null;
    }

    return result.chapter;
}

export function getNextChapter() {
    const result = getCurrentTopicData();
    if (!result) {
        return null;
    }

    const nextChapter = content[result.chapterIndex + 1];
    if (!nextChapter) {
        return null;
    }

    return nextChapter;
}

/**
 * Returns the first topic of the current chapter
 */
export function getCurrentChapterStart() {
    const chapter = getCurrentChapter();
    if (!chapter) {
        return null;
    }

    return chapter.topics[0];
}

/**
 * Returns the first topic of the next chapter
 */
export function getNextChapterStart() {
    const nextChapter = getNextChapter();
    if (!nextChapter) {
        return null;
    }

    return nextChapter.topics[0];
}

export function getCurrentChapterLength() {
    const result = getCurrentTopicData();
    return result.chapterLength;
}

export function getCurrentTopicIndex() {
    const result = getCurrentTopicData();
    return result.topicIndex + 1;
}

/**
 * Fetches the file from the current topics content folder, then returns the file as text
 * @param {string} fileName - The name of the file to search for
 */
export async function getCurrentTopicFile(fileName) {
    const topic = getCurrentTopic();
    const url = `/content/${topic.slug}/${fileName}`;
    return await getFileAsText(url);
}

/**
 * Fetches the Go source file from the current topics content folder, then returns the file as text.
 * If the page has no topic, it returns the sandbox.go code
 */
export async function getCurrentTopicCode() {
    let url;
    const topic = getCurrentTopic();

    if (topic) {
        url = `/content/${topic.slug}/${topic.goFile}`;
    }
    else {
        url = `/content/sandbox.go`;
    }

    return await getFileAsText(url);
}

/**
 * Fetches the file from the url, then returns the file as text.
 * @param {string} url - The path
 */
async function getFileAsText(url) {
    try {            
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const text = await response.text();
        return text;
    } 
    catch (error) {
        console.error(error.message);
    }
}