import { DailyQuest, GradeLevel } from '../types';

export interface IQuestRepository {
  getQuests(grade: GradeLevel): Promise<DailyQuest[]>;
  updateQuestProgress(grade: GradeLevel, questId: string, delta: number): Promise<DailyQuest | null>;
  claimQuestReward(grade: GradeLevel, questId: string): Promise<{ quest: DailyQuest; xpReward: number } | null>;
}
