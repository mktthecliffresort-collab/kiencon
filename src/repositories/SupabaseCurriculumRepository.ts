import { ICurriculumRepository } from './ICurriculumRepository';
import { Subject, Lesson, GradeLevel } from '../types';
import { supabaseService } from '../services/supabaseService';

export class SupabaseCurriculumRepository implements ICurriculumRepository {
  async getSubjects(grade: GradeLevel): Promise<Subject[]> {
    return supabaseService.getSubjects(grade);
  }

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    const subjects = await supabaseService.getSubjects(5);
    const found5 = subjects.find((s) => s.id === subjectId);
    if (found5) return found5;

    const subjects8 = await supabaseService.getSubjects(8);
    return subjects8.find((s) => s.id === subjectId) || null;
  }

  async getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]> {
    return supabaseService.getLessons(grade, subjectId);
  }

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    return supabaseService.getLessonById(lessonId);
  }
}

export const supabaseCurriculumRepository = new SupabaseCurriculumRepository();
