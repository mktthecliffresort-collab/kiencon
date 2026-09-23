import { GradeLevel, TeachBackEvaluationResult, SocraticHintResult, SocraticTutorRequest, SocraticTutorResponse } from '../types';
import { adminService } from './adminService';

export const geminiService = {
  async askSocraticTutor(params: SocraticTutorRequest): Promise<SocraticTutorResponse> {
    try {
      const aiConfig = params.aiConfig || adminService.getAIConfig();
      const response = await fetch('/api/gemini/socratic-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...params,
          aiConfig,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: SocraticTutorResponse = await response.json();
      return data;
    } catch (err) {
      console.warn('Gemini socratic tutor API failed or reached quota, switching to client fallback:', err);
      const isGrade5 = params.studentGrade === 5;
      const attempts = Math.max(1, params.attemptCount || 1);
      const level: 1 | 2 | 3 = attempts <= 1 ? 1 : attempts === 2 ? 2 : 3;

      if (isGrade5) {
        if (level === 1) {
          return {
            guidanceLevel: 1,
            responseMessage: 'Kiến Con đang cùng bạn thám hiểm nè! Bạn đừng vội chọn đáp án nha. Hãy nhìn kỹ vào phần bánh được tô màu trên màn hình nhé!',
            followUpQuestion: 'Có tất cả bao nhiêu phần bằng nhau trong chiếc bánh này?',
            isLocalFallback: true,
          };
        } else if (level === 2) {
          return {
            guidanceLevel: 2,
            responseMessage: 'Ví dụ thực tế nhé: Nếu con có 1 chiếc bánh pizza cắt làm 4 phần, con ăn 2 phần, thì con đã ăn một nửa chiếc bánh rồi đúng không nào?',
            followUpQuestion: 'Vậy phân số 2/4 có bằng với phân số 1/2 không con?',
            isLocalFallback: true,
          };
        } else {
          return {
            guidanceLevel: 3,
            responseMessage: 'Kiến Con bật mí nguyên lý: Khi nhân hoặc chia cả tử số và mẫu số cho cùng một số tự nhiên khác 0, ta sẽ nhận được một phân số bằng với phân số ban đầu!',
            followUpQuestion: 'Nếu mẫu số tăng từ 2 lên 4 (gấp 2 lần) thì tử số 1 sẽ biến đổi thành số mấy?',
            isLocalFallback: true,
          };
        }
      } else {
        if (level === 1) {
          return {
            guidanceLevel: 1,
            responseMessage: 'Kiến Con chào bạn! Để giải quyết thách thức này, hãy xét đến điều kiện để bánh xe không bị chìm ngập trong cát lún.',
            followUpQuestion: 'Đại lượng nào quyết định mức độ lún của vật: trọng lực toàn phần hay áp suất tác dụng lên từng cm² bề mặt cát?',
            isLocalFallback: true,
          };
        } else if (level === 2) {
          return {
            guidanceLevel: 2,
            responseMessage: 'Liên hệ thực tế: Những chiếc xe jeep vượt đồi cát Mũi Né hay xe máy cày ở miền Tây luôn dùng lốp to bản với diện tích tiếp xúc khổng lồ để giảm thiểu áp suất đè lên nền đất yếu.',
            followUpQuestion: 'Dựa vào công thức p = F / S, khi bạn tăng diện tích tiếp xúc S lên thì áp suất p sẽ tăng hay giảm?',
            isLocalFallback: true,
          };
        } else {
          return {
            guidanceLevel: 3,
            responseMessage: 'Phân tích khoa học từ Kiến Con: Trọng lực F = 600 N là cố định. Giới hạn chịu tải của cát là 150 kPa. Khi sử dụng lốp Fat Bike 100mm, tổng diện tích tiếp xúc S = 320 cm², áp suất giảm xuống chỉ còn 93.8 kPa (nhỏ hơn 150 kPa), giúp xe lăn bánh an toàn!',
            followUpQuestion: 'Tại sao việc giảm áp suất lại ngăn hiện tượng cát trượt lún dưới bánh xe?',
            isLocalFallback: true,
          };
        }
      }
    }
  },
  async evaluateTeachBack(params: {
    grade: GradeLevel;
    subject: string;
    topic: string;
    studentExplanation: string;
    expectedConcepts: string[];
  }): Promise<TeachBackEvaluationResult> {
    try {
      const response = await fetch('/api/gemini/teach-back', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: TeachBackEvaluationResult = await response.json();
      return data;
    } catch (err) {
      console.warn('Gemini teach-back API call failed, using client-side fallback evaluator:', err);

      const isGrade5 = params.grade === 5;
      const text = (params.studentExplanation || '').trim();
      const hasContent = text.length >= 12;

      return {
        passed: hasContent,
        score: hasContent ? 92 : 60,
        coachFeedback: isGrade5
          ? (hasContent
            ? 'Kiến Con reo vang: Bạn giải thích vừa dễ hiểu vừa hệt như một nhà toán học nhí! Kiến hiểu ngay vì sao các phần lại bằng nhau rồi!'
            : 'Kiến Con lắng nghe nè: Bạn hãy kể rõ hơn về số phần được tô màu so với tổng số phần của chiếc bánh nhé!')
          : (hasContent
            ? 'Kiến Con phân tích: Lập luận của bạn rất có cơ sở khoa học. Sự phối hợp giữa diện tích tiếp xúc lớn và áp suất phân bổ đều chính là chìa khóa giải quyết bài toán ma sát.'
            : 'Kiến Con gợi ý: Hãy bổ sung sự liên hệ với định luật áp suất p = F/S để bài phân tích thêm thuyết phục.'),
        keyConceptsRecognized: params.expectedConcepts.slice(0, 2),
        curiousQuestion: isGrade5
          ? 'Nếu mang chiếc bánh chia cho cả lớp thì mình cần làm gì nhỉ?'
          : 'Nếu chiếc xe đạp chở thêm balo nặng 15kg thì diện tích lốp cần tăng thêm bao nhiêu?',
        badge: isGrade5 ? 'Nhà Thám Hiểm Phân Số' : 'Kỹ Sư Động Lực Học Cát Lún',
        isLocalFallback: true,
      };
    }
  },

  async getSocraticHint(params: {
    grade: GradeLevel;
    subject: string;
    question: string;
    currentAttempt: string;
    stage: number;
  }): Promise<SocraticHintResult> {
    try {
      const response = await fetch('/api/gemini/socratic-hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data: SocraticHintResult = await response.json();
      return data;
    } catch (err) {
      console.warn('Gemini socratic-hint API call failed, using client fallback hint:', err);
      const isGrade5 = params.grade === 5;

      return {
        antSpeech: isGrade5
          ? (params.stage === 2
            ? 'Hãy nhìn vào chiếc bánh: Tử số là số miếng được lấy, còn mẫu số là tổng số miếng bằng nhau chia ra ban đầu nè!'
            : 'Đừng nản lòng nha! Bạn hãy đếm xem chiếc bánh tròn này đang được chia thành mấy miếng bằng nhau trước đã?')
          : (params.stage === 2
            ? 'Gợi ý từ Kiến Con: Công thức p = F / S cho thấy p tỉ lệ nghịch với S. Muốn xe không bị chìm trong cát lún, hãy tìm cách cực đại hóa diện tích tiếp xúc S!'
            : 'Hãy quan sát lực tác dụng: Trọng lực của người và xe không đổi, nhưng áp lực cục bộ lên từng hạt cát lại phụ thuộc vào độ rộng của lốp xe.'),
        clueWord: isGrade5 ? 'Số phần bằng nhau' : 'Công thức p = F / S',
        isLocalFallback: true,
      };
    }
  },
};
