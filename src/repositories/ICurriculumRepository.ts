import { Subject, Lesson, GradeLevel } from '../types';

export interface ICurriculumRepository {
  getSubjects(grade: GradeLevel): Promise<Subject[]>;
  getSubjectById(subjectId: string): Promise<Subject | null>;
  getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]>;
  getLessonById(lessonId: string): Promise<Lesson | null>;
}
