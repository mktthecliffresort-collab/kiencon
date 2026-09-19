import { IQuestRepository } from './IQuestRepository';
import { DailyQuest, GradeLevel } from '../types';
import { supabaseService } from '../services/supabaseService';

export class SupabaseQuestRepository implements IQuestRepository {
  async getQuests(grade: GradeLevel): Promise<DailyQuest[]> {
    return supabaseService.getQuests(grade);
  }

  async updateQuestProgress(grade: GradeLevel, questId: string, delta: number): Promise<DailyQuest | null> {
    return supabaseService.updateQuestProgress(grade, questId, delta);
  }

  async claimQuestReward(grade: GradeLevel, questId: string): Promise<{ quest: DailyQuest; xpReward: number } | null> {
    return supabaseService.claimQuestReward(grade, questId);
  }
}

export const supabaseQuestRepository = new SupabaseQuestRepository();
