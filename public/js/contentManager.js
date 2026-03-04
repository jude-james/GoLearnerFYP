/*
// Code for loading md file in


const lessons = [
    {
        title: "Functions",
        description: "This is a function...",
        layout: 2,
        code: "package main..."
    }
]

lessons.customString = function() {
    return "Lesson";
};

const exercises = [ // list of objects
    {   // object literal
        title: "Rabbit",
        description: "Do some rabbit challenge...",
        layout: 3, // layout will have to be different for exercises, how will it know?, just have exercise layout, then like lesson_quad, layout, quiz layout etc
        code: "package...",
        solution: "427"
    },
    {
        title: "Fibonacci",
        description: "In this exercise...",
        layout: 3,
        code: "package...",
        solution: "12" // would have to be more complex sometimes, like multi line output
    }
]

exercises.customString = function() {
    return "Exercise";
};

const quizzes = [
    {
        title: "Functions Recap quiz",
        option1: "fmt.Println...",
        answer: "fmt.Println..."
    }
]

quizzes.customString = function() {
    return "Quiz";
};

const chapter1 = [
    {
        id: 1,
        content: lessons[0],
        type: lessons.customString()
    },
    {
        id: 2,
        content: exercises[0],
        type: exercises.customString()
    },
]

const chapter2 = [
    {
        id: 1, // dont need ids at all?
        content: exercises[1],
        type: exercises.customString()
    },
    {
        id: 2,
        content: quizzes[0],
        type: quizzes.customString()
    },
]

export const chapters = [ // rename to syllabus?
    {
        title: "Introduction", // then the url would be eg tutorial/introduction/1
        chapter: chapter1,
        time: 30,
        difficulty: "easy"
    },
    {
        title: "Basics", 
        chapter: chapter2
    }
]*/

// list of objects, is this json?
const topics = [
    {     // object literal
        // type: "tutorial-basic", // dont even need type? just do if statemets for all the fields and use layout
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
];

// TODO add comments
export function getCurrentTopic() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("topic");
    return topics.find(t => t.slug === slug);
}

export function getCurrentIndex() {
    const current = getCurrentTopic();
    return topics.findIndex(t => t.slug === current.slug) + 1;
}

export function getTopicsLength() {
    return topics.length;
}

export function getNextTopic() {
    const current = getCurrentTopic();
    if (!current) {
        return null;
    }

    const i = topics.findIndex(t => t.slug === current.slug);
    return topics[i + 1] || null;
}

export function getPreviousTopic() {
    const current = getCurrentTopic();
    if (!current) {
        return null;
    }

    const i = topics.findIndex(t => t.slug === current.slug);
    return topics[i - 1] || null;
}

// TODO add comments
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