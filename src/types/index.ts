export type GradeLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type EducationalStage = 'primary' | 'secondary' | 'high_school';

export const ALL_GRADES: GradeLevel[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export const DEMO_FEATURED_GRADES: GradeLevel[] = [5, 8];

export function getEducationalStage(grade: GradeLevel): EducationalStage {
  if (grade <= 5) return 'primary';
  if (grade <= 9) return 'secondary';
  return 'high_school';
}

export function getStageName(stage: EducationalStage): string {
  switch (stage) {
    case 'primary':
      return 'Tiểu Học (Lớp 1 - 5)';
    case 'secondary':
      return 'THCS (Lớp 6 - 9)';
    case 'high_school':
      return 'THPT (Lớp 10 - 12)';
  }
}

export function getGradeLabel(grade: GradeLevel): string {
  return `Lớp ${grade}`;
}

export type KHTNDomain = 'vat_li' | 'hoa_hoc' | 'sinh_hoc';

export interface Subject {
  id: string;
  name: string;
  code: string;
  grade: GradeLevel;
  iconName: string;
  color: string;
  description: string;
  // Special for Grade 8 KHTN
  isIntegrated?: boolean;
  domainBranches?: {
    id: KHTNDomain;
    name: string;
    icon: string;
    color: string;
    description: string;
  }[];
}

export interface LessonDiscover {
  storyTitle: string;
  storyContent: string;
  realWorldContext: string;
  promptQuestion: string;
  imageUrl?: string;
  keyObservation: string;
}

export interface LessonPracticeFractionData {
  targetFraction: { num: number; den: number };
  slicesAvailable: number[];
  equivalentFractions: { num: number; den: number; isEquivalent: boolean; label: string }[];
}

export interface LessonPracticePhysicsData {
  riderMassKg: number; // e.g. 50kg + 10kg bike = 60kg => Force ~ 600N
  sandBearingLimitPa: number; // Pressure threshold where tire sinks into loose sand (e.g. 150 kPa)
  tires: {
    id: string;
    name: string;
    widthMm: number; // 25mm, 45mm, 100mm
    contactAreaCm2: number; // 40 cm2, 75 cm2, 160 cm2 per tire (two tires = x2)
    treadType: 'smooth' | 'grooved' | 'deep_lug';
    frictionCoeff: number; // 0.25 to 0.75 on sand
    description: string;
  }[];
}

export interface LessonPracticeMatchingData {
  pairs: {
    id: string;
    fact: string;
    factor: string;
    explanation?: string;
  }[];
}

export interface MathInteractiveTask {
  id: string;
  title: string;
  prompt: string;
  type: 'multiple_choice' | 'number_input' | 'true_false';
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  acceptableAnswers?: string[];
  unit?: string;
  socraticClue: string;
  explanation: string;
  visualBadge?: string;
}

export interface LessonPractice {
  type: 'fraction_cake' | 'tire_physics_sim' | 'matching' | 'interactive_choice' | 'math_interactive';
  challengeTitle: string;
  instructions: string;
  hintStage1: string;
  hintStage2: string;
  fractionData?: LessonPracticeFractionData;
  physicsData?: LessonPracticePhysicsData;
  matchingData?: LessonPracticeMatchingData;
  genericQuestion?: {
    prompt: string;
    options: { id: string; text: string; isCorrect: boolean }[];
  };
  mathTasks?: MathInteractiveTask[];
}

export interface LessonApply {
  dilemmaTitle: string;
  situation: string;
  question: string;
  options: {
    id: string;
    title: string;
    description: string;
    isOptimal: boolean;
    scientificReason: string;
  }[];
  hintStage1: string;
  hintStage2: string;
}

export interface LessonTeachBack {
  promptTitle: string;
  guidingQuestion: string;
  helperBulletPoints: string[];
  sampleStarters: string[];
  expectedConcepts: string[];
}

export interface Lesson {
  id: string;
  subjectId: string;
  domainBranch?: KHTNDomain;
  grade: GradeLevel;
  unit: string;
  title: string;
  subtitle: string;
  allyId: string;
  estimatedMinutes: number;
  xpReward: number;
  discover: LessonDiscover;
  practice: LessonPractice;
  apply: LessonApply;
  teachBack: LessonTeachBack;
}

export interface AntAlly {
  id: string;
  name: string;
  role: string;
  domain: string;
  quote: string;
  avatarColor: string;
  accentColor: string;
  icon: string;
  description: string;
}

export interface UserThemeSettings {
  mode: 'light' | 'soft' | 'warm';
  accentColor: 'amber' | 'sky' | 'emerald' | 'purple' | 'rose';
  soundEnabled: boolean;
  soundVolume: number; // 0 - 100
  ambientChime: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  email?: string;
  password?: string;
  grade: GradeLevel;
  avatar: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  completedLessons: string[];
  subjectMastery: Record<string, number>; // subjectId -> 0-100%
  inventory: string[];
  themeSettings?: UserThemeSettings;
  enrolledCourses?: string[];
  schoolName?: string;
  role?: 'student' | 'parent' | 'teacher' | 'admin';
  isVerified?: boolean;
}

export interface DailyQuest {
  id: string;
  grade: GradeLevel;
  title: string;
  description: string;
  progress: number;
  target: number;
  xpReward: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface TeachBackEvaluationResult {
  passed: boolean;
  score: number;
  coachFeedback: string;
  keyConceptsRecognized: string[];
  curiousQuestion: string;
  badge: string;
  isLocalFallback?: boolean;
}

export interface SocraticHintResult {
  antSpeech: string;
  clueWord: string;
  isLocalFallback?: boolean;
}

export interface AIConfig {
  endpoint: string;
  apiKey: string;
  model: string;
  provider?: 'gemini' | 'openai';
  temperature?: number;
}

export interface SocraticTutorRequest {
  studentGrade: GradeLevel;
  subject: string;
  currentTopic: string;
  questionContext: string;
  studentInput: string;
  attemptCount: number;
  aiConfig?: AIConfig;
}

export interface SocraticTutorResponse {
  guidanceLevel: 1 | 2 | 3;
  responseMessage: string;
  followUpQuestion: string;
  misconceptionDetected?: string;
  isLocalFallback?: boolean;
  modelUsed?: string;
}

export interface TutorChatMessage {
  id: string;
  sender: 'student' | 'ant';
  text: string;
  timestamp: string;
  guidanceLevel?: 1 | 2 | 3;
  followUpQuestion?: string;
  misconceptionDetected?: string;
  isLocalFallback?: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  grade: GradeLevel;
  avatar: string;
  school: string;
  className: string;
  xp: number;
  streakDays: number;
  lessonsCompletedCount: number;
  rankChange: 'up' | 'down' | 'same';
  rankChangeAmount?: number;
  badgeTitle: string;
  cheersReceived: number;
  isCurrentUser?: boolean;
}

export type AdminRole =
  | 'super_admin'
  | 'lesson_manager'
  | 'subject_manager'
  | 'grade_manager'
  | 'content_manager'
  | 'student_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: AdminRole;
  roleTitle: string;
  permissions: string[];
  lastLogin: string;
  status: 'active' | 'inactive';
}

export interface AdminClassInfo {
  id: string;
  name: string;
  grade: GradeLevel;
  academicYear: string;
  studentCount: number;
  headTeacher: string;
  room: string;
  status: 'active' | 'archived';
}

export interface AdminAuditLog {
  id: string;
  timestamp: string;
  adminName: string;
  role: AdminRole;
  action: string;
  target: string;
  details: string;
}

