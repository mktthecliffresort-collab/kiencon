import { questRepository } from '../repositories/InMemoryQuestRepository';
import { DailyQuest, GradeLevel } from '../types';

export const questService = {
  async getQuests(grade: GradeLevel): Promise<DailyQuest[]> {
    return questRepository.getQuests(grade);
  },

  async advanceQuest(grade: GradeLevel, questId: string, delta = 1): Promise<DailyQuest | null> {
    return questRepository.updateQuestProgress(grade, questId, delta);
  },

  async claimReward(grade: GradeLevel, questId: string): Promise<{ quest: DailyQuest; xpReward: number } | null> {
    return questRepository.claimQuestReward(grade, questId);
  },
};
