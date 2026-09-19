import { ICurriculumRepository } from './ICurriculumRepository';
import { Subject, Lesson, GradeLevel } from '../types';
import { SUBJECTS_GRADE_5, SUBJECTS_GRADE_8, LESSONS } from '../data/mockData';

export class InMemoryCurriculumRepository implements ICurriculumRepository {
  private lessons: Lesson[] = [...LESSONS];

  async getSubjects(grade: GradeLevel): Promise<Subject[]> {
    return grade === 5 ? [...SUBJECTS_GRADE_5] : [...SUBJECTS_GRADE_8];
  }

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    const allSubjects = [...SUBJECTS_GRADE_5, ...SUBJECTS_GRADE_8];
    const found = allSubjects.find((s) => s.id === subjectId);
    return found || null;
  }

  async getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]> {
    let result = this.lessons.filter((l) => l.grade === grade);
    if (subjectId) {
      result = result.filter((l) => l.subjectId === subjectId);
    }
    return result;
  }

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const found = this.lessons.find((l) => l.id === lessonId);
    return found || null;
  }
}

export const curriculumRepository = new InMemoryCurriculumRepository();
