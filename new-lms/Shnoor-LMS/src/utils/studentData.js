export const studentData = {
    currentUser: {
        uid: 'student_001',
        name: 'John Doe',
        email: 'student@example.com',
        xp: 1200,
        rank: 5,
        streak: 12
    },
    courses: [
        {
            id: 'course_001',
            title: 'Complete React Developer',
            instructor: 'Prof. John Smith',
            thumbnail: 'https://via.placeholder.com/300x160?text=React+Course',
            totalModules: 10,
            progress: 45,
            isAssigned: true,
            modules: [
                { id: 'm1', title: 'Introduction to React', type: 'video', duration: '10:00', isLocked: false, isCompleted: true, url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' },
                { id: 'm2', title: 'JSX and Elements', type: 'video', duration: '15:30', isLocked: false, isCompleted: true, url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' },
                { id: 'm3', title: 'Components and Props', type: 'video', duration: '20:00', isLocked: false, isCompleted: false, url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' },
                { id: 'm4', title: 'State and Lifecycle', type: 'pdf', duration: '5:00', isLocked: true, isCompleted: false, url: '#' },
                { id: 'm5', title: 'Handling Events', type: 'video', duration: '12:00', isLocked: true, isCompleted: false, url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' }
            ]
        },
        {
            id: 'course_002',
            title: 'Advanced Node.js',
            instructor: 'Brad Traversy',
            thumbnail: 'https://via.placeholder.com/300x160?text=Node+Course',
            totalModules: 8,
            progress: 0,
            isAssigned: true,
            modules: [
                { id: 'n1', title: 'Node Internals', type: 'video', duration: '14:00', isLocked: false, isCompleted: false, url: 'https://www.youtube.com/embed/w7ejDZ8SWv8' },
                { id: 'n2', title: 'Event Loop', type: 'pdf', duration: '10:00', isLocked: true, isCompleted: false, url: '#' }
            ]
        }
    ],
    certificates: [
        {
            id: 'cert_001',
            courseName: 'Web Development Bootcamp',
            issueDate: '2025-12-15',
            score: 95,
            instructor: 'Colt Steele'
        }
    ],
    exams: [
        {
            id: 'exam_001',
            courseId: 'course_001',
            courseName: 'Complete React Developer',
            title: 'React Final Assessment',
            duration: 60,
            passScore: 70,
            questions: [
                { id: 1, type: 'mcq', text: 'What is the Virtual DOM?', options: ['A direct copy of the DOM', 'A lightweight copy', 'A heavy object', 'None'], correctAnswer: 'A lightweight copy', marks: 5 },
                { id: 2, type: 'mcq', text: 'Which hook replaces componentDidMount?', options: ['useState', 'useEffect', 'useReducer', 'useCallback'], correctAnswer: 'useEffect', marks: 5 },
                {
                    id: 3,
                    type: 'coding',
                    title: 'Sum Two Numbers',
                    text: 'Write a function that adds two numbers.',
                    starterCode: 'function add(a, b) {\n  // your code here\n}',
                    marks: 10,
                    testCases: [
                        { input: '1, 2', output: '3', isPublic: true },
                        { input: '10, 5', output: '15', isPublic: false }
                    ]
                }
            ]
        },
        {
            id: 'exam_002',
            courseId: 'course_002',
            courseName: 'Advanced Node.js',
            title: 'Node.js Mastery Exam',
            duration: 45,
            passScore: 60,
            questions: [
                { id: 1, type: 'mcq', text: 'Which module is used for file operations?', options: ['fs', 'http', 'path', 'os'], correctAnswer: 'fs', marks: 5 },
                {
                    id: 2,
                    type: 'coding',
                    title: 'File Reader',
                    text: 'Write a function that reads a file synchronously.',
                    starterCode: 'const fs = require("fs");\n\nfunction readFile(path) {\n  // your code here\n}',
                    marks: 15,
                    testCases: []
                }
            ]
        }
    ],
    chats: [
        {
            id: 'c1',
            participants: ['student_001', 'inst_001'],
            lastMessage: 'Hello, I have a question about the assignment.',
            unreadCount: 0,
            updatedAt: '2025-12-28T10:30:00Z',
            messages: [
                { id: 'm1', senderId: 'student_001', text: 'Hello, I have a question about the assignment.', timestamp: '2025-12-28T10:30:00Z' },
                { id: 'm2', senderId: 'inst_001', text: 'Sure, what is it?', timestamp: '2025-12-28T10:35:00Z' }
            ]
        }
    ],
    instructors: [
        { id: 'inst_001', name: 'Prof. John Smith', avatar: 'https://via.placeholder.com/40' },
        { id: 'inst_002', name: 'Brad Traversy', avatar: 'https://via.placeholder.com/40' }
    ],
    practiceChallenges: [
        {
            id: 'prac_1',
            title: 'Reverse a String',
            difficulty: 'Easy',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that takes a string as input and returns the string reversed.',
            starterCode: 'function reverseString(str) {\n  // Your code here\n}',
            testCases: [
                { input: '"hello"', output: '"olleh"', isPublic: true },
                { input: '"OpenAI"', output: '"IAnepO"', isPublic: true }
            ],
            marks: 10
        },
        {
            id: 'prac_2',
            title: 'FizzBuzz',
            difficulty: 'Medium',
            status: 'Solved',
            type: 'coding',
            text: 'Write a function that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, and "FizzBuzz" for multiples of both.',
            starterCode: 'function fizzBuzz(n) {\n  // Your code here\n}',
            testCases: [
                { input: '3', output: '"Fizz"', isPublic: true },
                { input: '5', output: '"Buzz"', isPublic: true },
                { input: '15', output: '"FizzBuzz"', isPublic: true }
            ],
            marks: 20
        },
        {
            id: 'prac_3',
            title: 'Two Sum',
            difficulty: 'Hard',
            status: 'Unsolved',
            type: 'coding',
            text: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            starterCode: 'function twoSum(nums, target) {\n  // Your code here\n}',
            testCases: [
                { input: '[2,7,11,15], 9', output: '[0,1]', isPublic: true }
            ],
            marks: 30
        },
        {
            id: 'prac_4',
            title: 'Palindrome Check',
            difficulty: 'Easy',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that checks if a given string is a palindrome. Returns "true" or "false".',
            starterCode: 'function isPalindrome(str) {\n  // Your code here\n}',
            testCases: [
                { input: '"racecar"', output: '"true"', isPublic: true },
                { input: '"hello"', output: '"false"', isPublic: true }
            ],
            marks: 10
        },
        {
            id: 'prac_5',
            title: 'Factorial',
            difficulty: 'Medium',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that returns the factorial of n.',
            starterCode: 'function factorial(n) {\n  // Your code here\n}',
            testCases: [
                { input: '5', output: '120', isPublic: true }
            ],
            marks: 15
        },
        {
            id: 'prac_6',
            title: 'Valid Parentheses',
            difficulty: 'Medium',
            status: 'Unsolved',
            type: 'coding',
            text: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid. Open brackets must be closed by the same type of brackets and in the correct order.',
            starterCode: 'function isValid(s) {\n  // Your code here\n}',
            testCases: [
                { input: '"()"', output: 'true', isPublic: true },
                { input: '"()[]{}"', output: 'true', isPublic: true },
                { input: '"(]"', output: 'false', isPublic: true }
            ],
            marks: 20
        },
        {
            id: 'prac_7',
            title: 'Matrix Diagonal Sum',
            difficulty: 'Hard',
            status: 'Unsolved',
            type: 'coding',
            text: 'Given a square matrix mat, return the sum of the matrix diagonals. Only include the sum of all the elements on the primary diagonal and all the elements on the secondary diagonal that are not part of the primary diagonal.',
            starterCode: 'function diagonalSum(mat) {\n  // Your code here\n}',
            testCases: [
                { input: '[[1,2,3], [4,5,6], [7,8,9]]', output: '25', isPublic: true },
                { input: '[[1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1]]', output: '8', isPublic: false }
            ],
            marks: 30
        },
        {
            id: 'prac_8',
            title: 'Add Two Numbers',
            difficulty: 'Easy',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that accepts two numbers, a and b, and returns their sum.',
            starterCode: '',
            testCases: [
                { input: '1, 2', output: '3', isPublic: true },
                { input: '10, 20', output: '30', isPublic: true },
                { input: '-5, 5', output: '0', isPublic: true }
            ],
            marks: 5
        },
        {
            id: 'prac_9',
            title: 'Check Even or Odd',
            difficulty: 'Easy',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that accepts a number and returns "Even" if the number is even, and "Odd" if it is odd.',
            starterCode: '',
            testCases: [
                { input: '2', output: '"Even"', isPublic: true },
                { input: '3', output: '"Odd"', isPublic: true },
                { input: '0', output: '"Even"', isPublic: true }
            ],
            marks: 5
        },
        {
            id: 'prac_10',
            title: 'Find Maximum',
            difficulty: 'Easy',
            status: 'Unsolved',
            type: 'coding',
            text: 'Write a function that takes an array of numbers and returns the largest number.',
            starterCode: '',
            testCases: [
                { input: '[1, 2, 3]', output: '3', isPublic: true },
                { input: '[-1, -5, -2]', output: '-1', isPublic: true },
                { input: '[10]', output: '10', isPublic: true }
            ],
            marks: 10
        }
    ]
};

export const getStudentData = () => {
    const saved = localStorage.getItem('shnoor_student_data');
    if (!saved) return studentData;

    try {
        const parsed = JSON.parse(saved);
        const merged = { ...studentData, ...parsed };

        if (!merged.exams || merged.exams.length === 0) {
            merged.exams = studentData.exams;
        }
        if (!merged.practiceChallenges || merged.practiceChallenges.length === 0) {
            merged.practiceChallenges = studentData.practiceChallenges;
        }
        if (!merged.courses || merged.courses.length === 0) {
            merged.courses = studentData.courses;
        }
        if (merged.currentUser) {
            merged.currentUser = { ...studentData.currentUser, ...merged.currentUser };
        }

        return merged;
    } catch (e) {
        console.error("Error parsing student data", e);
        return studentData;
    }
};

export const saveStudentData = (data) => {
    localStorage.setItem('shnoor_student_data', JSON.stringify(data));
};

export const getChats = (userId) => {
    const data = getStudentData();
    return data.chats || [];
};

export const getMessages = (chatId) => {
    const data = getStudentData();
    const chat = data.chats.find(c => c.id === chatId);
    return chat ? chat.messages : [];
};

export const sendMessage = (chatId, message) => {
    const data = getStudentData();
    const chatIndex = data.chats.findIndex(c => c.id === chatId);

    if (chatIndex > -1) {
        data.chats[chatIndex].messages.push(message);
        data.chats[chatIndex].lastMessage = message.text;
        data.chats[chatIndex].updatedAt = message.timestamp;
        saveStudentData(data);
        return true;
    }
    return false;
};

export const createChat = (participants) => {
    const data = getStudentData();
    const newChat = {
        id: 'c' + Date.now(),
        participants,
        lastMessage: '',
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        messages: []
    };
    data.chats = data.chats || [];
    data.chats.push(newChat);
    saveStudentData(data);
    return newChat;
};
