import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { AntAlly, GradeLevel } from '../../types';
import { Award, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface LessonSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  grade: GradeLevel;
  ally: AntAlly;
  xpEarned: number;
  badgeTitle: string;
  score: number;
}

export const LessonSuccessModal: React.FC<LessonSuccessModalProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  grade,
  ally,
  xpEarned,
  badgeTitle,
  score,
}) => {
  useEffect(() => {
    if (isOpen) {
      audioService.playLevelUp();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#3b82f6', '#10b981', '#ec4899'],
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-stone-200 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500" />

        {/* Celebration Trophy/Ant */}
        <div className="relative inline-block mt-2">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-4xl shadow-lg shadow-amber-200 mx-auto animate-bounce">
            🏆
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">🐜</span>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 inline-block">
            Chinh Phục Thành Công ⭐
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
            Chúc mừng bạn đã chinh phục bài học!
          </h3>
          <p className="text-xs text-stone-500 line-clamp-1">{lessonTitle}</p>
        </div>

        {/* Reward Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-amber-50 border border-amber-200/80 p-3.5 rounded-2xl">
            <div className="text-xs text-amber-800 font-medium">Kinh nghiệm đạt được</div>
            <div className="text-xl sm:text-2xl font-black text-amber-900 flex items-center justify-center gap-1">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span>+{xpEarned} XP</span>
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-200/80 p-3.5 rounded-2xl">
            <div className="text-xs text-emerald-800 font-medium">Điểm Giảng Lại</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-900">
              {score}/100
            </div>
          </div>
        </div>

        {/* Badge Achieved */}
        <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-xl flex-shrink-0">
            🎖️
          </div>
          <div>
            <div className="text-[11px] text-stone-400 font-semibold">Danh hiệu trao bởi {ally.name}</div>
            <div className="text-sm font-black text-stone-900">{badgeTitle || 'Nhà Thám Hiểm Kiến'}</div>
          </div>
        </div>

        {/* Ally Quote */}
        <p className="text-xs text-stone-600 italic px-4">
          "{ally.quote}"
        </p>

        {/* Continue Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl font-black text-sm bg-stone-900 hover:bg-black text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <span>Trở Về Bảng Bài Học</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
