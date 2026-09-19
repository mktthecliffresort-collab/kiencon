export interface ExamOption {
  id: string;
  label: string;
  text: string;
}

export interface ExamQuestion {
  id: string;
  examNumber: number;
  questionNumber: string;
  type: 'multiple_choice' | 'short_answer';
  question: string;
  options?: ExamOption[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  unit?: string;
  explanation: string;
  socraticHint: string;
  category: 'decimals' | 'calculations' | 'units' | 'percentage' | 'geometry' | 'word_problems';
  points: number;
  isAdvanced?: boolean;
}

export interface ExamPaper {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  timeMinutes: number;
  totalPoints: number;
  highlightCategory: string;
  questions: ExamQuestion[];
}

export interface MathTopicReview {
  id: string;
  title: string;
  icon: string;
  badge: string;
  color: string;
  summary: string;
  rules: {
    title: string;
    content: string;
    example: string;
    trapAlert: string;
  }[];
  sampleExamProblems: {
    source: string;
    problem: string;
    solution: string;
    keyTakeaway: string;
  }[];
}

export interface MathRiddle {
  id: string;
  title: string;
  sourceExam: string;
  difficulty: 'vừa' | 'thử thách' | 'ngôi sao';
  badge: string;
  story: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  answerExplanation: string;
  antTip: string;
  diagramInfo?: string;
}

export interface MathStory {
  id: string;
  title: string;
  sourceExam: string;
  antHero: string;
  antRole: string;
  badge: string;
  context: string;
  plot: string[];
  mathChallenge: {
    question: string;
    options: { id: string; text: string; isCorrect: boolean }[];
    solution: string;
  };
  lifeLesson: string;
}

export interface ArenaQuestion {
  id: string;
  question: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  timeLimitSeconds: number;
  category: string;
}
