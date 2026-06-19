export type Grade = 11 | 12;
export type Stream = 'Computer Science' | 'Hotel Management';

export interface User {
  id: string;
  name: string;
  email: string;
  grade: Grade;
  stream: Stream;
  streakCount: number;
}

export type Subject = {
  id: string;
  name: string;
  grade: Grade;
  stream?: Stream;
  icon: string;
  chapterCount: number;
};

export type Chapter = {
  id: string;
  subjectId: string;
  title: string;
  orderIndex: number;
  notesContent: string;
  summaryContent: string;
  progress: number;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  youtubeId: string;
  subjectId: string;
  channelName: string;
  duration: string;
  thumbnail: string;
};

export type ExamQuestion = {
  id: string;
  subjectId: string;
  grade: Grade;
  examType: 'Terminal Exam' | 'Final Exam' | 'Pre-board' | 'Model Questions';
  questionText: string;
  marks: number;
  markingScheme: string;
};

export type Flashcard = {
  id: string;
  subject: string;
  front: string;
  back: string;
};

export type TriviaQuestion = {
  id: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};
