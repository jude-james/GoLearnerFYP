// List of chapters for fundamentals course
const fundamentalsChapters = [
    {
        title: "Basics",
        description: "Get your first Go program running and learn how packages, imports, and formatted output work.",
        topics: [
            {
                title: "Introduction",
                slug: "introduction",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "welcome.go",
            },
            {
                title: "Packages & Main",
                slug: "packages_main",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "hello.go",
            },
            {
                title: "Standard Library",
                slug: "standard_library",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "libraries.go",
            },
            {
                title: "Formatted Output",
                slug: "formatted_output",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "students.go",
            },
            {
                title: "Packages Quiz",
                slug: "packages_quiz",
                layout: "quiz.html",
                question: "What happens if you import a package in Go but never use it?",
                answer: 2,
                options: [
                    "The program compiles but prints a warning",
                    "The program does not compile",
                    "The unused import is silently ignored"
                ]
            },
            {
                title: "Formatting Quiz",
                slug: "format_quiz",
                layout: "quiz.html",
                question: "Which of the following correctly formats the integer?",
                answer: 1,
                options: [
                    'fmt.Printf("Weight: %dkg", 76)',
                    'fmt.Printf("Weight: %tkg", 76)',
                    'fmt.Printf("Weight: %pkg", 76)'
                ]
            },
            {
                title: "Chapter 1 Summary",
                slug: "chapter1_summary",
                layout: "summary.html",
            },
            {
                title: "Chapter 1 Complete",
                slug: "chapter1",
                layout: "chapter-complete.html",
                message: "Congratulations! You've completed your first chapter. You've written your first Go programs and learned how packages, imports, and formatted output work. You're ready to start filling them with data."
            }
        ]
    },
    {
        title: "Variables & Types",
        description: "Explore how Go stores and organises data, from basic types and variables to slices, maps, and pointers",
        topics: [
            {
                title: "Variables & Declaration",
                slug: "variables_declaration",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "cities.go",
            },
            {
                title: "Basic Types",
                slug: "basic_types",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "types.go",
            },
            {
                title: "Slices",
                slug: "slices",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "primes.go",
            },
            {
                title: "Maps",
                slug: "maps",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "capitals.go",
            },
            {
                title: "Pointers",
                slug: "pointers",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "pointers.go",
            },
            {
                title: "Types Quiz",
                slug: "types_quiz",
                layout: "quiz.html",
                question: "What is the zero value of a string in Go?",
                answer: 3,
                options: [
                    "nil",
                    "0",
                    "An empty string"
                ]
            },
            {
                title: "Word Frequency Exercise",
                slug: "word_frequency",
                layout: "exercise.html",
                markdown: "markdown.md",
                goFile: "word_freq.go",
                goSolution: "solution.go"
            },
            {
                title: "Chapter 2 Summary",
                slug: "chapter2_summary",
                layout: "summary.html",
            },
            {
                title: "Chapter 2 Complete",
                slug: "chapter2",
                layout: "chapter-complete.html",
                message: "Great work! You now know how Go stores and organises data, from basic types and variables through to slices, maps, and pointers. These are the building blocks everything else is built on."
            }
        ]
    },
    {
        title: "Control Flow",
        description: "Learn how to direct your program's logic using conditionals, loops, switch statements, and defer.",
        topics: [
            {
                title: "If Else",
                slug: "if_else",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "grade_checker.go",
            },
            {
                title: "For Loops",
                slug: "for_loops",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "looping.go",
            },
            {
                title: "Switch",
                slug: "switch",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "switch.go",
            },
            {
                title: "Defer",
                slug: "defer",
                layout: "lesson.html",
                markdown: "markdown.md",
                goFile: "defer.go",
            },
            {
                title: "Switches Quiz",
                slug: "switches_quiz",
                layout: "quiz.html",
                question: "In Go, do switch cases fall through to the next case by default?",
                answer: 2,
                options: [
                    "Yes, just like in C and Java",
                    "No, each case breaks automatically",
                    "Only if the case body is empty"
                ]
            },
            {
                title: "FizzBuzz Exercise",
                slug: "fizzbuzz",
                layout: "exercise.html",
                markdown: "markdown.md",
                goFile: "fizzbuzz.go",
                goSolution: "solution.go"
            },
            {
                title: "Chapter 3 Summary",
                slug: "chapter3_summary",
                layout: "summary.html",
            },
            {
                title: "Chapter 3 Complete",
                slug: "chapter3",
                layout: "chapter-complete.html",
                message: "Nice one! You can now direct your program's logic with conditionals, loops, switch statements, and defer."
            }
        ]
    }
]

// List of chapters for concurrency course
const concurrencyChapters = [
    {
        title: "Goroutines",
        description: "Learn how multithreading works in Go, with it's signature goroutines",
        topics: [
            {
                title: "Concurrency 1",
                slug: "concurrency1",
                layout: "lesson.html",
            },
            {
                title: "Concurrency 2",
                slug: "goroutines",
                layout: "lesson-visualiser.html",
                goFile: "code.go",
                markdown: "markdown.md"
            },
            {
                title: "Goroutines quiz",
                slug: "goroutines_quiz",
                layout: "quiz.html",
                question: "This is a question...?",
                answer: 1,
                options: [
                    "A", "B", "C"
                ]
            }
        ]
    },
    {
        title: "Channels",
        description: "Channels?",
        topics: [
            {
                title: "Concurrency 1",
                slug: "concurrency1",
                layout: "lesson.html",
            },
            {
                title: "Concurrency 2",
                slug: "goroutines",
                layout: "lesson-visualiser.html",
                goFile: "code.go",
                markdown: "markdown.md"
            },
            {
                title: "Goroutines quiz",
                slug: "goroutines_quiz",
                layout: "quiz.html",
                question: "This is a question...?",
                answer: 1,
                options: [
                    "A", "B", "C"
                ]
            }
        ]
    }
]

/**
Content array, holding all the content as a list of objects.
Each course contains multiple chapters, each chapter is divided into topics, each topic is unique and has a unique identifier
Then each topic is divided into 3 formats: lesson, quiz or exercise. With additional non-intractable formats like summary pages and chapter completion pages
*/
export const courses = [
    {
        title: "Concurrency",
        description: "Understand Go's concurrency with interactive examples",
        colour: "red",
        chapters: concurrencyChapters,
    },
    {
        title: "Fundamentals",
        description: "Progress through Go's fundamentals with structured lessons, exercises, and quizzes",
        colour: "yellow",
        chapters: fundamentalsChapters,
    }
]

/**
 * Reads the current page slug then searches the content array to find the topic details
 */
function getCurrentTopicData() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get("topic");

    for (const course of courses) {
        for (let i = 0; i < course.chapters.length; i++) {
            const chapter = course.chapters[i];
            const topicIndex = chapter.topics.findIndex(t => t.slug === slug);
            
            if (topicIndex !== -1) {
                return {
                    topic: chapter.topics[topicIndex],
                    topicIndex: topicIndex,
                    chapter,
                    chapterIndex: i,
                    chapterLength: chapter.topics.length,
                    course: course
                };
            }
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

    const nextChapter = result.course.chapters[result.chapterIndex + 1];
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

export function getCurrentCourse() {
    const result = getCurrentTopicData();
    return result.course;
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
        const path = window.location.pathname;
        url = path.includes("sandbox-visualiser") ? 
        `/content/sandbox_concurrency.go` : `/content/sandbox.go`;
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