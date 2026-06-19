import { Flashcard, Subject, TriviaQuestion, Video, ExamQuestion, Chapter } from '../types';

export const mockSubjects: Subject[] = [
  { id: 's1', name: 'Computer Science', grade: 11, stream: 'Computer Science', icon: 'Laptop', chapterCount: 12 },
  { id: 's2', name: 'Hotel Management', grade: 11, stream: 'Hotel Management', icon: 'Utensils', chapterCount: 10 },
  { id: 's3', name: 'English', grade: 11, icon: 'BookOpen', chapterCount: 8 },
  { id: 's4', name: 'Economics', grade: 11, icon: 'TrendingUp', chapterCount: 14 },
  { id: 's5', name: 'Social Studies', grade: 11, icon: 'Globe', chapterCount: 15 },
  { id: 's6', name: 'Accountancy', grade: 11, icon: 'Calculator', chapterCount: 16 },
  { id: 's7', name: 'Nepali', grade: 11, icon: 'Type', chapterCount: 11 },
];

export const mockChapters: Chapter[] = [
  {
    id: 'c1',
    subjectId: 's1',
    title: 'Computer Systems',
    orderIndex: 1,
    notesContent: '<h3>Introduction to Computer Systems</h3><p>A computer system consists of hardware and software working together to process data...</p><ul><li>Input Devices</li><li>Processing Unit (CPU)</li><li>Output Devices</li><li>Storage Devices</li></ul>',
    summaryContent: 'Computers process data into information via hardware and software.',
    progress: 80,
  },
  {
    id: 'c2',
    subjectId: 's1',
    title: 'Number Systems',
    orderIndex: 2,
    notesContent: '<h3>Binary, Octal, Decimal, Hexadecimal</h3><p>Computers use binary logic.</p>',
    summaryContent: 'Base-2 is binary. Base-10 is decimal.',
    progress: 30,
  }
];

export const mockFlashcards: Flashcard[] = [
  { id: 'f1', subject: 'Accountancy', front: 'Accounting Equation', back: 'Assets = Liabilities + Equity' },
  { id: 'f2', subject: 'Computer Science', front: 'What does CPU stand for?', back: 'Central Processing Unit' },
  { id: 'f3', subject: 'Economics', front: 'Law of Demand', back: 'As price increases, quantity demanded decreases (ceteris paribus).' }
];

export const mockTrivia: TriviaQuestion = {
  id: 't1',
  questionText: 'Which protocol is used to transfer web pages?',
  options: ['FTP', 'HTTP', 'SMTP', 'SSH'],
  correctIndex: 1,
  explanation: 'HTTP (Hypertext Transfer Protocol) is the foundation of data communication for the World Wide Web.'
};

export const mockVideos: Video[] = [
  {
    id: 'v1',
    title: 'Number Systems Conversion Tricks',
    description: 'Learn how to easily convert between binary, octal, decimal, and hexadecimal.',
    youtubeId: 'bCqtb-Z5IgU', // using placeholder
    subjectId: 's1',
    channelName: 'Guru Tech',
    duration: '12:45',
    thumbnail: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&q=80&w=640'
  },
  {
    id: 'v2',
    title: 'Basic Accounting Principles',
    description: 'Debit what comes in, credit what goes out.',
    youtubeId: 'Z_aY2I_004Q',
    subjectId: 's6',
    channelName: 'Commerce Classes',
    duration: '20:10',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=640'
  }
];

export const mockExamQuestions: ExamQuestion[] = [
  {
    id: 'eq1',
    subjectId: 's1',
    grade: 11,
    examType: 'Final Exam',
    questionText: 'Explain the Von Neumann architecture with a suitable block diagram.',
    marks: 5,
    markingScheme: '2 marks for diagram. 3 marks for explanation of components (ALU, CU, Registers, Memory, I/O).'
  },
  {
    id: 'eq2',
    subjectId: 's6',
    grade: 11,
    examType: 'Model Questions',
    questionText: 'What is a Trial Balance? Why is it prepared?',
    marks: 3,
    markingScheme: '1 mark for definition. 2 marks for objectives (checking arithmetic accuracy, facilitating preparation of final accounts).'
  }
];
