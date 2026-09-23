import { getSocraticTutorGuidance } from '../../server/services/geminiTutor.js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { studentGrade, subject, currentTopic, questionContext, studentInput, attemptCount, aiConfig } = req.body || {};
    const result = await getSocraticTutorGuidance({
      studentGrade: (Number(studentGrade) === 8 ? 8 : 5) as 5 | 8,
      subject: String(subject || 'Toán / Khoa học'),
      currentTopic: String(currentTopic || 'Bài học'),
      questionContext: String(questionContext || ''),
      studentInput: String(studentInput || ''),
      attemptCount: Number(attemptCount || 1),
      aiConfig,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(200).json({
      guidanceLevel: 1,
      responseMessage: 'Chú Kiến đang kiểm tra lại bài học nè, con hãy thử đọc kỹ lại đề bài một xíu nha!',
      followUpQuestion: 'Con thấy điểm gì đặc biệt nhất trong câu hỏi này?',
      isLocalFallback: true,
    });
  }
}
