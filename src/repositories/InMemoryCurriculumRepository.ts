import { ICurriculumRepository } from './ICurriculumRepository';
import { Subject, Lesson, GradeLevel } from '../types';
import { getSubjectsForGrade, ALL_GRADE_SUBJECTS, LESSONS } from '../data/mockData';

export class InMemoryCurriculumRepository implements ICurriculumRepository {
  private lessons: Lesson[] = [...LESSONS];

  async getSubjects(grade: GradeLevel): Promise<Subject[]> {
    return getSubjectsForGrade(grade);
  }

  async getSubjectById(subjectId: string): Promise<Subject | null> {
    for (const subjects of Object.values(ALL_GRADE_SUBJECTS)) {
      const found = subjects.find((s) => s.id === subjectId);
      if (found) return found;
    }
    return null;
  }

  async getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]> {
    let result = this.lessons.filter((l) => l.grade === grade);
    if (subjectId) {
      result = result.filter((l) => l.subjectId === subjectId);
    }

    // Nếu khối lớp này chưa có bài học tĩnh chi tiết (như Lớp 5 và Lớp 8 là demo mẫu),
    // cung cấp bài học nền tảng 4 bước khởi đầu tương ứng môn học để học sinh khám phá
    if (result.length === 0) {
      const currentSubjects = getSubjectsForGrade(grade);
      const targetSubject = subjectId
        ? currentSubjects.find((s) => s.id === subjectId) || currentSubjects[0]
        : currentSubjects[0];

      if (targetSubject) {
        const stage = grade <= 5 ? 'Tiểu Học' : grade <= 9 ? 'THCS' : 'THPT';
        const starterLesson: Lesson = {
          id: `starter_g${grade}_${targetSubject.id}`,
          subjectId: targetSubject.id,
          grade,
          unit: `Chương 1: Khởi Động Tri Thức Lớp ${grade} (${stage})`,
          title: `Chinh Phục Môn ${targetSubject.name} Lớp ${grade}`,
          subtitle: `Hành trình kiến thức chuẩn GDPT 2018 cùng bạn Kiến thông thái`,
          allyId: 'cham_can',
          estimatedMinutes: 10,
          xpReward: 100,
          discover: {
            storyTitle: `Chào đón bạn đến với Vương Quốc Kiến Học Lớp ${grade}!`,
            storyContent: `Chào bạn học sinh chăm chỉ! Bạn đang bước vào lộ trình học tập môn ${targetSubject.name} Lớp ${grade}. Tại đây, Kiến Con và các bạn Kiến Đồng Minh sẽ cùng bạn khám phá từng khái niệm một cách trực quan, vui vẻ và sâu sắc nhất theo chuẩn GDPT 2018. Lưu ý: Lớp 5 và Lớp 8 hiện đang có bộ dữ liệu mô phỏng tương tác chuyên sâu nhất để bạn trải nghiệm!`,
            realWorldContext: `Môn ${targetSubject.name} giúp em phát triển tư duy logic và giải quyết các bài toán, hiện tượng thực tế xung quanh đời sống mỗi ngày.`,
            promptQuestion: `Em đã sẵn sàng đồng hành cùng các bạn Kiến khám phá thế giới tri thức Lớp ${grade} chưa nào?`,
            keyObservation: `Học tập bằng cách tự khám phá và giảng lại giúp em hiểu sâu bản chất, nhớ lâu hơn gấp 3 lần!`,
          },
          practice: {
            type: 'multiple_choice',
            challengeTitle: `Khởi Động Phản Xạ Tư Duy - Lớp ${grade}`,
            instructions: `Hãy vận dụng tư duy để chọn đáp án chính xác nhất nhé!`,
            multipleChoiceData: {
              question: `Để học tốt môn ${targetSubject.name} Lớp ${grade} theo chương trình GDPT 2018, phương pháp nào sau đây là hiệu quả nhất?`,
              options: [
                { id: 'opt_1', text: 'Hiểu bản chất qua 4 bước: Khám phá, Luyện tập, Vận dụng và Giảng lại', isCorrect: true, explanation: 'Chính xác! Chu trình 4 bước của Kiến Học giúp rèn luyện tư duy sâu và tự giác học tập.' },
                { id: 'opt_2', text: 'Học vẹt thuộc lòng câu chữ mà không cần hiểu ý nghĩa', isCorrect: false, explanation: 'Học vẹt sẽ rất nhanh quên và không thể áp dụng vào bài toán thực tế.' },
                { id: 'opt_3', text: 'Chỉ làm bài tập khi sắp đến kỳ thi', isCorrect: false, explanation: 'Duy trì chuỗi học tập đều đặn mỗi ngày mới tạo nên kết quả vượt trội!' },
              ],
            },
          },
          apply: {
            dilemmaTitle: `Thử Thách Ứng Dụng Thực Tiễn - Lớp ${grade}`,
            situation: `Bạn Kiến muốn áp dụng kiến thức môn ${targetSubject.name} để giải quyết một thử thách trong ngày của Vương Quốc Kiến.`,
            question: `Theo em, việc áp dụng kiến thức lý thuyết vào đời sống thực tế mang lại lợi ích gì lớn nhất?`,
            options: [
              {
                id: 'apply_1',
                title: 'Giúp giải quyết vấn đề hiệu quả và hiểu bài sâu sắc hơn',
                description: 'Kiến thức gắn liền với thực hành sẽ biến thành kỹ năng sống và tư duy lâu dài.',
                isOptimal: true,
                scientificReason: 'Học đi đôi với hành là nguyên lý giáo dục hiện đại của GDPT 2018.',
              },
              {
                id: 'apply_2',
                title: 'Chỉ để đạt điểm số trên giấy thi',
                description: 'Điểm số là quan trọng nhưng không phải mục tiêu duy nhất của việc học.',
                isOptimal: false,
                scientificReason: 'Mục tiêu của GDPT 2018 là phát triển phẩm chất và năng lực giải quyết vấn đề của học sinh.',
              },
            ],
          },
          teachBack: {
            promptTitle: `Em Tập Làm Thầy Giáo Nhí (Teach-Back)`,
            guidingQuestion: `Kiến Con thắc mắc: "Bạn có thể tóm tắt cho mình nghe một điều tâm đắc nhất bạn học được trong môn ${targetSubject.name} Lớp ${grade} không?"`,
            helperBulletPoints: [
              'Khái niệm cốt lõi của bài học',
              'Ứng dụng thú vị trong đời sống',
              'Lời khuyên của em dành cho bạn Kiến',
            ],
            sampleStarters: [
              `Kiến Con ơi, trong môn ${targetSubject.name} Lớp ${grade}, điều quan trọng nhất là...`,
            ],
            expectedConcepts: ['tư duy', 'bản chất', 'thực tiễn', 'liên hệ', 'bài học'],
          },
        };
        result = [starterLesson];
      }
    }

    return result;
  }

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const found = this.lessons.find((l) => l.id === lessonId);
    if (found) return found;

    // Kiểm tra starter lesson
    if (lessonId.startsWith('starter_g')) {
      const parts = lessonId.split('_');
      const grade = parseInt(parts[1]?.replace('g', '') || '5', 10) as GradeLevel;
      const starterLessons = await this.getLessons(grade);
      return starterLessons.find((l) => l.id === lessonId) || null;
    }

    return null;
  }
}

export const curriculumRepository = new InMemoryCurriculumRepository();
