import { IUserRepository } from './IUserRepository';
import { UserProfile, GradeLevel } from '../types';
import { supabaseService } from '../services/supabaseService';

export class SupabaseUserRepository implements IUserRepository {
  async getUserProfile(grade: GradeLevel): Promise<UserProfile> {
    return supabaseService.getUserProfile(grade);
  }

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    return supabaseService.updateUserProfile(profile);
  }

  async addXP(grade: GradeLevel, amount: number): Promise<UserProfile> {
    return supabaseService.addXP(grade, amount);
  }

  async recordLessonCompletion(
    grade: GradeLevel,
    lessonId: string,
    subjectId: string,
    masteryDelta: number
  ): Promise<UserProfile> {
    return supabaseService.recordLessonCompletion(grade, lessonId, subjectId, masteryDelta);
  }

  async incrementStreak(grade: GradeLevel): Promise<UserProfile> {
    return supabaseService.incrementStreak(grade);
  }
}

export const supabaseUserRepository = new SupabaseUserRepository();
