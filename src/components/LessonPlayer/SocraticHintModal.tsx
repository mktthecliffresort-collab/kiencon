import React from 'react';
import { GradeLevel } from '../../types';
import { Lightbulb, X, Sparkles } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface SocraticHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade: GradeLevel;
  stage: number; // 1 or 2
  hintText: string;
  clueWord?: string;
  userAttempt?: string;
}

export const SocraticHintModal: React.FC<SocraticHintModalProps> = ({
  isOpen,
  onClose,
  grade,
  stage,
  hintText,
  clueWord,
  userAttempt,
}) => {
  if (!isOpen) return null;

  const isGrade5 = grade === 5;
  const antTitle = 'Kiến Con';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-stone-200 shadow-xl space-y-5 relative max-h-[90vh] overflow-y-auto soft-scrollbar">
        {/* Close button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ant Coach Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-2xl shadow-sm">
            🐜
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-stone-900 text-base">{antTitle} đồng hành</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Gợi ý nấc {stage}/2
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {isGrade5
                ? 'Không sao cả! Kiến Con cùng bạn quan sát lại nhé!'
                : 'Phân tích dữ liệu & Gợi mở hướng tư duy'}
            </p>
          </div>
        </div>

        {/* Clue Word Badge if present */}
        {clueWord && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>Từ khóa mấu chốt: {clueWord}</span>
          </div>
        )}

        {/* Speech Bubble */}
        <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 text-sm text-stone-800 leading-relaxed space-y-2">
          <p className="font-medium">{hintText}</p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-stone-900 hover:bg-black text-white transition-all shadow-sm active:scale-95"
          >
            Đã hiểu, mình sẽ thử lại ngay!
          </button>
        </div>
      </div>
    </div>
  );
};
