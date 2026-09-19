import { userRepository } from '../repositories/InMemoryUserRepository';
import { UserProfile, GradeLevel } from '../types';

export const userService = {
  async getProfile(grade: GradeLevel): Promise<UserProfile> {
    return userRepository.getUserProfile(grade);
  },

  async updateProfile(profile: UserProfile): Promise<UserProfile> {
    return userRepository.updateUserProfile(profile);
  },

  async addXP(grade: GradeLevel, amount: number): Promise<UserProfile> {
    return userRepository.addXP(grade, amount);
  },

  async recordLessonCompletion(
    grade: GradeLevel,
    lessonId: string,
    subjectId: string,
    masteryDelta: number
  ): Promise<UserProfile> {
    return userRepository.recordLessonCompletion(grade, lessonId, subjectId, masteryDelta);
  },

  async incrementStreak(grade: GradeLevel): Promise<UserProfile> {
    if (userRepository.incrementStreak) {
      return userRepository.incrementStreak(grade);
    }
    const profile = await userRepository.getUserProfile(grade);
    profile.streakDays = (profile.streakDays || 0) + 1;
    return userRepository.updateUserProfile(profile);
  },
};
