import { IUserRepository } from './IUserRepository';
import { UserProfile, GradeLevel } from '../types';
import { INITIAL_USER_GRADE_5, INITIAL_USER_GRADE_8 } from '../data/mockData';

const STORAGE_KEY_PREFIX = 'kienhoc_user_v1_';

export class InMemoryUserRepository implements IUserRepository {
  private profiles: Record<GradeLevel, UserProfile>;

  constructor() {
    this.profiles = {
      5: this.loadProfileFromStorage(5) || { ...INITIAL_USER_GRADE_5 },
      8: this.loadProfileFromStorage(8) || { ...INITIAL_USER_GRADE_8 },
    };
  }

  private loadProfileFromStorage(grade: GradeLevel): UserProfile | null {
    try {
      if (typeof window === 'undefined') return null;
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${grade}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private saveProfileToStorage(profile: UserProfile): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${profile.grade}`, JSON.stringify(profile));
      }
    } catch (e) {
      console.warn('Failed to persist user profile to localStorage', e);
    }
  }

  async getUserProfile(grade: GradeLevel): Promise<UserProfile> {
    return { ...this.profiles[grade] };
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    this.profiles[profile.grade] = { ...profile };
    this.saveProfileToStorage(profile);
    return { ...this.profiles[profile.grade] };
  }

  async addXP(grade: GradeLevel, amount: number): Promise<UserProfile> {
    const current = this.profiles[grade];
    const newXP = current.xp + amount;
    // Simple level formula: level = Math.floor(newXP / 200) + 1
    const newLevel = Math.floor(newXP / 200) + 1;

    const updated: UserProfile = {
      ...current,
      xp: newXP,
      level: newLevel,
    };

    this.profiles[grade] = updated;
    this.saveProfileToStorage(updated);
    return { ...updated };
  }

  async recordLessonCompletion(
    grade: GradeLevel,
    lessonId: string,
    subjectId: string,
    masteryDelta: number
  ): Promise<UserProfile> {
    const current = this.profiles[grade];
    const completedSet = new Set(current.completedLessons);
    completedSet.add(lessonId);

    const currentSubjectMastery = current.subjectMastery[subjectId] || 0;
    const newSubjectMastery = Math.min(100, Math.round(currentSubjectMastery + masteryDelta));

    // Handle streak logic:
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const lastActiveStr = current.lastActiveDate ? current.lastActiveDate.slice(0, 10) : '';

    let newStreak = current.streakDays || 1;
    if (lastActiveStr !== todayStr) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      if (lastActiveStr === yesterdayStr) {
        newStreak += 1;
      } else if (!lastActiveStr) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    }

    const updated: UserProfile = {
      ...current,
      streakDays: newStreak,
      lastActiveDate: now.toISOString(),
      completedLessons: Array.from(completedSet),
      subjectMastery: {
        ...current.subjectMastery,
        [subjectId]: newSubjectMastery,
      },
    };

    this.profiles[grade] = updated;
    this.saveProfileToStorage(updated);
    return { ...updated };
  }

  async incrementStreak(grade: GradeLevel): Promise<UserProfile> {
    const current = this.profiles[grade];
    const updated: UserProfile = {
      ...current,
      streakDays: (current.streakDays || 0) + 1,
      lastActiveDate: new Date().toISOString(),
    };
    this.profiles[grade] = updated;
    this.saveProfileToStorage(updated);
    return { ...updated };
  }
}

export const userRepository = new InMemoryUserRepository();
