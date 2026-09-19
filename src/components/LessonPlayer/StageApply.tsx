import React, { useState } from 'react';
import { LessonApply, AntAlly, GradeLevel } from '../../types';
import { HelpCircle, ArrowRight, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import { audioService } from '../../services/audioService';
import { fireGrandCelebration } from '../../utils/confettiHelper';

interface StageApplyProps {
  apply: LessonApply;
  ally: AntAlly;
  grade: GradeLevel;
  onSuccess: () => void;
  onRequestHint: (stage: number, userChoice: string) => void;
}

export const StageApply: React.FC<StageApplyProps> = ({
  apply,
  ally,
  grade,
  onSuccess,
  onRequestHint,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);

  const selectedOption = apply.options.find((o) => o.id === selectedOptionId);
  const isOptimal = selectedOption?.isOptimal || false;

  const handleSubmitChoice = () => {
    if (!selectedOption) return;
    setSubmitted(true);
    setAttempts((c) => c + 1);

    if (isOptimal) {
      audioService.playCelebrationBurst();
      fireGrandCelebration();
    } else {
      audioService.playBoingPop();
      audioService.playHintChime();
      onRequestHint(attempts >= 1 ? 2 : 1, selectedOption.title);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Stage Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-extrabold text-sm">
              3
            </span>
            <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
              CHẶNG 3: GIẢI QUYẾT TÌNH HUỐNG THỰC TẾ (APPLY)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-800">
            Tình huống nan giải
          </span>
        </div>

        {/* Situation Card */}
        <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-stone-700 font-bold text-xs uppercase tracking-wider">
            <Compass className="w-4 h-4 text-purple-600" />
            <span>Tình huống phát sinh: {apply.dilemmaTitle}</span>
          </div>
          <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-medium">
            {apply.situation}
          </p>
          <div className="pt-2 border-t border-stone-200">
            <h4 className="text-sm sm:text-base font-extrabold text-stone-900">
              {apply.question}
            </h4>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {apply.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => {
                  audioService.playClick();
                  setSelectedOptionId(opt.id);
                  setSubmitted(false);
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-300 shadow-sm'
                    : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="font-bold text-sm sm:text-base text-stone-900">{opt.title}</div>
                    <p className="text-xs sm:text-sm text-stone-600">{opt.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button: Submit Choice */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            onClick={() => {
              audioService.playClick();
              onRequestHint(1, 'Hỏi đáp tình huống thực tế');
            }}
            className="text-xs text-purple-700 font-semibold hover:underline flex items-center gap-1"
          >
            <HelpCircle className="w-4 h-4" /> Tham khảo gợi ý
          </button>

          <button
            onClick={handleSubmitChoice}
            disabled={!selectedOptionId}
            className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-95 ${
              selectedOptionId
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                : 'bg-stone-300 text-stone-500 cursor-not-allowed shadow-none'
            }`}
          >
            Kiểm Tra Giải Pháp Này
          </button>
        </div>

        {/* Feedback Display */}
        {submitted && selectedOption && (
          <div
            className={`p-5 rounded-2xl border text-sm font-medium flex items-start gap-3 animate-fadeIn ${
              isOptimal
                ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                : 'bg-amber-50 border-amber-300 text-amber-950'
            }`}
          >
            {isOptimal ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <h5 className="font-bold">
                {isOptimal ? 'Quyết định xuất sắc!' : 'Kiến Con cùng bạn phân tích góc nhìn này:'}
              </h5>
              <p className="leading-relaxed text-xs sm:text-sm">{selectedOption.scientificReason}</p>
            </div>
          </div>
        )}

        {/* Next Stage Navigation */}
        <div className="pt-4 flex justify-between items-center border-t border-stone-100">
          <span className="text-xs text-stone-400">
            {isOptimal && submitted
              ? 'Giải pháp tối ưu đã được chứng minh!'
              : 'Chọn phương án tối ưu để mở khóa Chặng 4: Teach-Back'}
          </span>
          <button
            onClick={() => {
              audioService.playClick();
              onSuccess();
            }}
            disabled={!isOptimal || !submitted}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-95 ${
              isOptimal && submitted
                ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                : 'bg-stone-300 cursor-not-allowed text-stone-500 shadow-none'
            }`}
          >
            <span>Tiến Vào Chặng 4: Giảng Lại Cho Kiến</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
