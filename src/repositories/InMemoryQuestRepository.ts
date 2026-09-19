import { IQuestRepository } from './IQuestRepository';
import { DailyQuest, GradeLevel } from '../types';
import { INITIAL_QUESTS } from '../data/mockData';

const QUEST_STORAGE_KEY = 'kienhoc_quests_v1';

export class InMemoryQuestRepository implements IQuestRepository {
  private quests: DailyQuest[];

  constructor() {
    this.quests = this.loadFromStorage() || [...INITIAL_QUESTS];
  }

  private loadFromStorage(): DailyQuest[] | null {
    try {
      if (typeof window === 'undefined') return null;
      const raw = localStorage.getItem(QUEST_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(this.quests));
      }
    } catch (e) {
      console.warn('Failed to save quests to localStorage', e);
    }
  }

  async getQuests(grade: GradeLevel): Promise<DailyQuest[]> {
    return this.quests.filter((q) => q.grade === grade);
  }

  async updateQuestProgress(grade: GradeLevel, questId: string, delta: number): Promise<DailyQuest | null> {
    const quest = this.quests.find((q) => q.id === questId && q.grade === grade);
    if (!quest) return null;

    quest.progress = Math.min(quest.target, quest.progress + delta);
    if (quest.progress >= quest.target) {
      quest.isCompleted = true;
    }

    this.saveToStorage();
    return { ...quest };
  }

  async claimQuestReward(grade: GradeLevel, questId: string): Promise<{ quest: DailyQuest; xpReward: number } | null> {
    const quest = this.quests.find((q) => q.id === questId && q.grade === grade);
    if (!quest || !quest.isCompleted || quest.isClaimed) return null;

    quest.isClaimed = true;
    this.saveToStorage();
    return { quest: { ...quest }, xpReward: quest.xpReward };
  }
}

export const questRepository = new InMemoryQuestRepository();
