import { userRepository } from '../repositories';
import { UserProfile, GradeLevel } from '../types';

export const userService = {
  async createProfile(profileData: {
    id?: string;
    name: string;
    nickname?: string;
    username?: string;
    phone?: string;
    birthDate?: string;
    email?: string;
    grade: GradeLevel;
    avatar?: string;
    xp?: number;
    level?: number;
    streakDays?: number;
    themeSettings?: UserProfile['themeSettings'];
    enrolledCourses?: string[];
    schoolName?: string;
    role?: 'student' | 'parent' | 'teacher' | 'admin';
    isVerified?: boolean;
  }): Promise<UserProfile> {
    const grade = profileData.grade;
    const baseProfile = await userRepository.getUserProfile(grade);
    const newProfile: UserProfile = {
      ...baseProfile,
      id: profileData.id || `user_${Date.now()}`,
      name: profileData.name,
      nickname: profileData.nickname || profileData.name,
      username: profileData.username || baseProfile.username,
      phone: profileData.phone || baseProfile.phone,
      birthDate: profileData.birthDate || baseProfile.birthDate || '2014-08-15',
      email: profileData.email || baseProfile.email,
      grade: profileData.grade,
      avatar: profileData.avatar || baseProfile.avatar || '🐜',
      xp: typeof profileData.xp === 'number' ? profileData.xp : (baseProfile.xp || 50),
      level: profileData.level || baseProfile.level || 1,
      streakDays: profileData.streakDays || baseProfile.streakDays || 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      themeSettings: profileData.themeSettings || baseProfile.themeSettings,
      enrolledCourses: profileData.enrolledCourses || baseProfile.enrolledCourses || (grade === 5 ? ['toan_5'] : ['khtn_8']),
      schoolName: profileData.schoolName || baseProfile.schoolName,
      role: profileData.role || baseProfile.role || 'student',
      isVerified: profileData.isVerified !== undefined ? profileData.isVerified : (baseProfile.isVerified ?? false),
    };

    return userRepository.updateUserProfile(newProfile);
  },

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
