import React, { useEffect } from 'react';
import { audioService } from '../services/audioService';
import { fireGrandCelebration } from '../utils/confettiHelper';
import { Sparkles, Trophy, ArrowRight, Heart } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  xpEarned?: number;
  mascotReaction?: string;
  buttonText?: string;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  title = 'CHÍNH XÁC! QUÁ XUẤT SẮC! 🎉',
  subtitle = 'Bạn đã làm chủ kiến thức này một cách tự tin và tuyệt đối!',
  xpEarned = 20,
  mascotReaction = '🐜🥳',
  buttonText = 'Tiếp Tục Bài Học Nào! ➔',
}) => {
  useEffect(() => {
    if (isOpen) {
      audioService.playCelebrationBurst();
      fireGrandCelebration();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-gradient-to-b from-amber-50 via-white to-orange-50 rounded-3xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 border-4 border-amber-300 shadow-2xl text-center relative animate-bounce-short">
        {/* Floating Stars and Emojis */}
        <div className="text-5xl sm:text-6xl mb-2 animate-wiggle select-none">
          {mascotReaction}
        </div>

        {/* Big Punchy Title */}
        <h3 className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight mb-2">
          {title}
        </h3>

        {/* Short Subtitle */}
        <p className="text-sm sm:text-base font-semibold text-stone-600 mb-6 leading-relaxed">
          {subtitle}
        </p>

        {/* XP Reward Badge */}
        {xpEarned > 0 && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-400 border-b-4 border-amber-600 text-amber-950 font-black text-lg shadow-md mb-6 transform hover:scale-105 transition-transform select-none">
            <Sparkles className="w-5 h-5 text-yellow-100 fill-white animate-spin" />
            <span>+{xpEarned} XP Thưởng</span>
            <span>⭐</span>
          </div>
        )}

        {/* Big 3D Cartoon Action Button */}
        <div>
          <button
            onClick={() => {
              audioService.playBoingPop();
              onClose();
            }}
            className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg text-white bg-gradient-to-r from-emerald-500 to-teal-500 border-b-4 border-emerald-700 shadow-lg active:border-b-0 active:translate-y-1 hover:brightness-105 transition-all flex items-center justify-center gap-2 select-none"
          >
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
