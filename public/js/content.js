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
]