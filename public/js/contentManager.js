// TODO when adding exercises, hold the solution in another go file and fetch that too

// Content array, holding all the content as a list of objects, which are divided into chapters
// Each chapter is divided into topics, each topic is unique and has a unique identifier
// Then each topic is divided into 3 forms: tutorial, quiz or exercise.

// eventually split this into courses? since it will have to be split into fundamentals and concurrency
// so order becomes content (everything) -> courses (fundamentals/concurrency) -> chapters -> topics -> (tutorial/quiz/exercise)
export const content = [
    {
        title: "Chapter 1: Basics",
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
            }
        ]
    },
    {
        title: "Chapter 2",
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
            }
        ]
    }
]

// Add comments
function getCurrentTopicData() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("topic");

    for (const chapter of content) {
        const index = chapter.topics.findIndex(t => t.slug === slug);

        if (index !== -1) {
            return {
                topic: chapter.topics[index],
                topicIndex: index,
                chapter,
                chapterLength: chapter.topics.length
            };
        }
    }
    return null;
}

export function getCurrentTopic() {
    const result = getCurrentTopicData();
    return result.topic;
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

export function getCurrentChapterLength() {
    const result = getCurrentTopicData();
    return result.chapterLength;
}

export function getCurrentTopicIndex() {
    const result = getCurrentTopicData();
    return result.topicIndex + 1;
}

export async function getCurrentTopicCode() {
    let url;
    const current = getCurrentTopic();

    if (current) {
        url = `/content/${current.slug}/${current.goFile}`;
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