import { UserProfile, GradeLevel } from '../types';

export interface IUserRepository {
  getUserProfile(grade: GradeLevel): Promise<UserProfile>;
  updateUserProfile(profile: UserProfile): Promise<UserProfile>;
  addXP(grade: GradeLevel, amount: number): Promise<UserProfile>;
  recordLessonCompletion(grade: GradeLevel, lessonId: string, subjectId: string, masteryDelta: number): Promise<UserProfile>;
  incrementStreak?(grade: GradeLevel): Promise<UserProfile>;
}
