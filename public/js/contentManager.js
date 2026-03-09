/* Content array, holding all the content as a list of objects, which are divided into chapters
Each chapter is divided into topics, each topic is unique and has a unique identifier
Then each topic is divided into 3 forms: tutorial, quiz or exercise. 
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
                layout: "tutorialA.html",
                markdown: "intro.md",
                goFile: "welcome.go",
            },
            {
                title: "Functions",
                slug: "functions",
                layout: "tutorialA.html",
                markdown: "functions.md",
                goFile: "funcs.go",
            },
            {
                title: "Variables",
                slug: "variables",
                layout: "tutorialA.html",
                markdown: "variables.md",
                goFile: "vars.go",
            },
            {
                title: "Chapter 1 Complete",
                slug: "chapter1",
                layout: "chapter-complete.html",
                message: "Congratulations! You have completed chapter 1. You now understand..."
            }
        ]
    },
    {
        title: "Control Flow",
        description: "Ch2 description",
        topics: [
            {
                title: "chp2 Topic 1",
                slug: "ch2",
                layout: "tutorialA.html",
                markdown: "functions.md",
                goFile: "funcs.go",
            },
            {
                title: "chp2 Topic 2",
                slug: "ch22",
                layout: "tutorialA.html",
            },
            {
                title: "Chapter 2 Complete",
                slug: "ch2end",
                layout: "chapter-complete.html",
                message: "Congratulations! You have completed chapter 2. You now understand..."
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

export function getNextChapterStart() {
    const nextChapter = getNextChapter();
    if (!nextChapter) {
        return null;
    }

    return nextChapter.topics[0];
}

export function getCurrentChapterStart() {
    const chapter = getCurrentChapter();
    if (!chapter) {
        return null;
    }

    return chapter.topics[0];
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
 * Fetches the current topics markdown file, then returns the file as text
 */
export async function getCurrentTopicMarkdown() {
    const topic = getCurrentTopic();

    try {
        const response = await fetch(`/content/${topic.slug}/${topic.markdown}`);

        if (!response.ok) {
            return null;
        }

        const markdown = await response.text();
        return markdown;
    } 
    catch (error) {
        console.error(error.message);
    }
}

/**
 * Fetches the current topics Go source file, then returns the file as text.
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

    try {
        const response = await fetch(url);

        if (!response.ok) {
            return null;
        }

        const code = await response.text();   
        return code;
    } 
    catch (error) {
        console.error(error.message);
    }
}