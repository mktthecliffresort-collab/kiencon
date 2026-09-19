import { curriculumRepository } from '../repositories/InMemoryCurriculumRepository';
import { Subject, Lesson, GradeLevel } from '../types';

export const curriculumService = {
  async getSubjects(grade: GradeLevel): Promise<Subject[]> {
    return curriculumRepository.getSubjects(grade);
  },

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    return curriculumRepository.getSubjectById(subjectId);
  },

  async getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]> {
    return curriculumRepository.getLessons(grade, subjectId);
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    return curriculumRepository.getLessonById(lessonId);
  },
};
