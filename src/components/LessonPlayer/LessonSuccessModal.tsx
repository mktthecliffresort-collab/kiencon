import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { AntAlly, GradeLevel } from '../../types';
import { Award, Sparkles, CheckCircle2, ArrowRight, Flame, Star, Target, ShieldCheck } from 'lucide-react';
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
  const [animatedXp, setAnimatedXp] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      audioService.playCelebrationBurst();
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#FBBF24', '#059669', '#D97706'],
        });
      } catch (e) {
        console.warn('Confetti error', e);
      }

      // Animate XP counter from 0 to xpEarned
      let current = 0;
      const step = Math.max(1, Math.floor(xpEarned / 20));
      const interval = setInterval(() => {
        current += step;
        if (current >= xpEarned) {
          setAnimatedXp(xpEarned);
          clearInterval(interval);
        } else {
          setAnimatedXp(current);
        }
      }, 35);

      return () => clearInterval(interval);
    } else {
      setAnimatedXp(0);
    }
  }, [isOpen, xpEarned]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-md animate-fadeIn select-none">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border-4 border-amber-300 shadow-2xl text-center space-y-5 relative overflow-hidden">
        {/* Top Glow Amber Strip */}
        <div className="absolute top-0 inset-x-0 h-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-emerald-500" />

        {/* Bento Card 1: Mascot & Victory Trophy Header */}
        <div className="relative bg-gradient-to-b from-amber-50 to-orange-50/60 p-5 rounded-3xl border-2 border-amber-200">
          <div className="flex items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 text-stone-900 border-b-4 border-amber-600 shadow-lg flex items-center justify-center text-3xl animate-bounce">
              🏆
            </div>
            <div className="w-16 h-16 rounded-3xl bg-emerald-400 text-stone-900 border-b-4 border-emerald-600 shadow-lg flex items-center justify-center text-3xl animate-wiggle">
              {ally.icon || '🐜'}
            </div>
          </div>

          <div className="mt-3 space-y-1">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300 inline-block shadow-2xs">
              HOÀN THÀNH CHẶNG ĐƯỜNG ⭐
            </span>
            <h3 className="text-2xl font-black text-stone-900 tracking-tight">
              Chiến Thắng Rực Rỡ!
            </h3>
            <p className="text-xs text-stone-600 font-bold max-w-md mx-auto line-clamp-1">
              {lessonTitle}
            </p>
          </div>
        </div>

        {/* Bento Grid 2: 3-column stats */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Bento Subcard A: XP Gained */}
          <div className="bg-amber-50 border-2 border-amber-200 p-3 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Hạt Đường</span>
            </span>
            <div className="text-2xl font-black text-amber-600 mt-0.5">
              +{animatedXp}
            </div>
            <span className="text-[10px] font-black text-amber-700">XP</span>
          </div>

          {/* Bento Subcard B: Teach-back Score */}
          <div className="bg-emerald-50 border-2 border-emerald-200 p-3 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span>Giảng Lại</span>
            </span>
            <div className="text-2xl font-black text-emerald-600 mt-0.5">
              {score}
            </div>
            <span className="text-[10px] font-black text-emerald-700">/100 Điểm</span>
          </div>

          {/* Bento Subcard C: Energy leaves retained */}
          <div className="bg-teal-50 border-2 border-teal-200 p-3 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[11px] font-bold text-teal-800 flex items-center gap-1">
              <span>🍃</span>
              <span>Sinh Mệnh</span>
            </span>
            <div className="text-2xl font-black text-teal-600 mt-0.5">
              5/5
            </div>
            <span className="text-[10px] font-black text-teal-700">Lá Xanh</span>
          </div>
        </div>

        {/* Bento Card 3: Mascot Praise & Badge Granted */}
        <div className="bg-stone-50 p-4 rounded-2xl border-2 border-stone-200 flex items-center gap-3 text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-white flex items-center justify-center text-2xl shadow-sm shrink-0 border border-amber-300">
            🎖️
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
              Danh hiệu do {ally.name} vinh danh
            </div>
            <div className="text-sm font-black text-stone-900 truncate">
              {badgeTitle || 'Dũng Sĩ Kiến Thông Thái'}
            </div>
            <p className="text-xs text-stone-600 italic mt-0.5 line-clamp-1">
              "{ally.quote}"
            </p>
          </div>
        </div>

        {/* 3D Action Continue Button */}
        <button
          id="victory-continue-btn"
          onClick={() => {
            audioService.playSuccess();
            onClose();
          }}
          className="w-full py-4 rounded-2xl font-black text-base text-white btn-ant-3d-green shadow-xl flex items-center justify-center gap-2"
        >
          <span>TIẾP TỤC HÀNH TRÌNH KIẾN HỌC</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
