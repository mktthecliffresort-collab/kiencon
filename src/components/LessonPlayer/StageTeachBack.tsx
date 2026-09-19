import React, { useState } from 'react';
import { LessonTeachBack, AntAlly, GradeLevel, TeachBackEvaluationResult } from '../../types';
import { geminiService } from '../../services/geminiService';
import { audioService } from '../../services/audioService';
import { fireGrandCelebration } from '../../utils/confettiHelper';
import { Sparkles, Send, Award, HelpCircle, CheckCircle2, MessageSquare, Loader2, ArrowRight } from 'lucide-react';

interface StageTeachBackProps {
  teachBack: LessonTeachBack;
  ally: AntAlly;
  grade: GradeLevel;
  subjectName: string;
  lessonTitle: string;
  onFinishLesson: (score: number, badge: string) => void;
}

export const StageTeachBack: React.FC<StageTeachBackProps> = ({
  teachBack,
  ally,
  grade,
  subjectName,
  lessonTitle,
  onFinishLesson,
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<TeachBackEvaluationResult | null>(null);

  const isGrade5 = grade === 5;
  const antTitle = 'Kiến Con';

  const handleApplyStarter = (starterText: string) => {
    audioService.playClick();
    setExplanation((prev) => (prev ? `${prev} ${starterText}` : starterText));
  };

  const handleSubmitExplanation = async () => {
    if (!explanation.trim()) return;
    audioService.playClick();
    setIsSubmitting(true);

    try {
      const result = await geminiService.evaluateTeachBack({
        grade,
        subject: subjectName,
        topic: lessonTitle,
        studentExplanation: explanation,
        expectedConcepts: teachBack.expectedConcepts,
      });

      setEvaluation(result);
      if (result.passed) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
      } else {
        audioService.playBoingPop();
        audioService.playHintChime();
      }
    } catch (err) {
      console.warn("TeachBack evaluation notice:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Stage Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center font-extrabold text-sm">
              4
            </span>
            <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
              CHẶNG 4: THỬ TÀI KỂ LẠI CHO KIẾN NGHE
            </span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Kiến Lắng Nghe
          </span>
        </div>

        {/* Coach Ant Speech Bubble */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
            🐜
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-stone-900">{antTitle}</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-stone-600 border border-stone-200">
                {isGrade5 ? 'Lắng nghe bạn kể' : 'Đánh giá lập luận'}
              </span>
            </div>
            <p className="text-sm sm:text-base font-bold text-stone-800 italic">
              "{teachBack.guidingQuestion}"
            </p>
          </div>
        </div>

        {/* Guiding Hints */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Gợi ý những ý chính bạn có thể nhắc đến:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {teachBack.helperBulletPoints.map((point, idx) => (
              <div
                key={idx}
                className="bg-stone-50 border border-stone-200/80 rounded-xl p-2.5 text-xs text-stone-700 font-medium flex items-start gap-2"
              >
                <span className="text-amber-500 font-bold">•</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Thought Starters */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-stone-500 block">
            Bấm để lấy câu mở đầu gợi ý:
          </span>
          <div className="flex flex-wrap gap-2">
            {teachBack.sampleStarters.map((starter, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyStarter(starter)}
                className="text-xs bg-white hover:bg-stone-50 border border-stone-200 text-stone-700 px-3 py-1.5 rounded-xl font-medium transition-colors"
              >
                "{starter.slice(0, 35)}..."
              </button>
            ))}
          </div>
        </div>

        {/* Text Area for student explanation */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
            <span>Lời giải thích bằng ngôn từ của chính bạn:</span>
            <span className="text-stone-400 font-normal">
              {explanation.trim().length} ký tự
            </span>
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={4}
            placeholder={
              isGrade5
                ? 'Kiến Con ơi, để chia bánh công bằng thì...'
                : 'Kiến Con ơi, theo nguyên lý áp suất và tiếp xúc bề mặt cát...'
            }
            className="w-full p-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-stone-800 text-sm leading-relaxed"
          />
        </div>

        {/* Action Button: Submit to Gemini */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmitExplanation}
            disabled={isSubmitting || explanation.trim().length < 8}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-95 ${
              !isSubmitting && explanation.trim().length >= 8
                ? isGrade5
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                : 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{antTitle} đang chăm chú lắng nghe...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Gửi Lời Giảng Cho {antTitle}</span>
              </>
            )}
          </button>
        </div>

        {/* Gemini Evaluation Card */}
        {evaluation && (
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-stone-50 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-4 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-200/60 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm">
                  {evaluation.score}
                </div>
                <div>
                  <h4 className="font-black text-stone-900 text-sm sm:text-base">
                    Điểm Tiếp Thu: {evaluation.score}/100
                  </h4>
                  <span className="text-xs text-stone-500">
                    {evaluation.passed
                      ? '✨ Đã đạt chuẩn năng lực hiểu sâu!'
                      : '💡 Cố gắng thêm một chút nữa nhé!'}
                  </span>
                </div>
              </div>

              {/* Awarded Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300">
                <Award className="w-4 h-4 text-amber-600" />
                <span>{evaluation.badge}</span>
              </div>
            </div>

            {/* Coach Speech */}
            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
                Phản hồi từ {antTitle}:
              </span>
              <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
                {evaluation.coachFeedback}
              </p>
            </div>

            {/* Recognized Concepts */}
            {evaluation.keyConceptsRecognized && evaluation.keyConceptsRecognized.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs text-stone-500 font-semibold">Khái niệm đã nắm chắc:</span>
                {evaluation.keyConceptsRecognized.map((concept, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {concept}
                  </span>
                ))}
              </div>
            )}

            {/* Curious Question */}
            {evaluation.curiousQuestion && (
              <div className="bg-white/80 p-3 rounded-xl border border-stone-200 text-xs text-stone-700">
                ❓ <strong className="text-stone-900">Câu hỏi mở để bạn suy ngẫm thêm:</strong>{' '}
                {evaluation.curiousQuestion}
              </div>
            )}

            {/* Complete Lesson Action */}
            <div className="pt-3 flex justify-end">
              <button
                onClick={() => {
                  audioService.playClick();
                  onFinishLesson(evaluation.score, evaluation.badge);
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 transition-all active:scale-95"
              >
                <span>Nhận Thưởng & Hoàn Tất Bài Học</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
