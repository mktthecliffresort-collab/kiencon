import React from 'react';
import { DailyQuest, GradeLevel } from '../types';
import { CheckCircle2, Award, Sparkles, X, Gift } from 'lucide-react';
import { audioService } from '../services/audioService';
import { fireGrandCelebration } from '../utils/confettiHelper';

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  quests: DailyQuest[];
  grade: GradeLevel;
  onClaimQuest: (questId: string) => void;
}

export const DailyQuestsModal: React.FC<DailyQuestsModalProps> = ({
  isOpen,
  onClose,
  quests,
  grade,
  onClaimQuest,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border border-stone-200 shadow-2xl space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
            🎯
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-stone-900 text-lg sm:text-xl">
                Nhiệm Vụ Hàng Ngày
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                Lớp {grade}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Hoàn thành các thử thách để nhận thêm điểm kinh nghiệm XP!
            </p>
          </div>
        </div>

        {/* Quest List */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {quests.map((quest) => {
            const isFinished = quest.progress >= quest.target;
            const percent = Math.min(100, Math.round((quest.progress / quest.target) * 100));

            return (
              <div
                key={quest.id}
                className={`p-4 rounded-2xl border transition-all ${
                  quest.isClaimed
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : isFinished
                    ? 'bg-emerald-50/60 border-emerald-300'
                    : 'bg-white border-stone-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-stone-900">{quest.title}</h4>
                      <span className="text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.2 rounded">
                        +{quest.xpReward} XP
                      </span>
                    </div>
                    <p className="text-xs text-stone-500">{quest.description}</p>

                    {/* Progress Bar */}
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] text-stone-500 font-bold mb-1">
                        <span>Tiến độ</span>
                        <span>
                          {quest.progress}/{quest.target}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden border border-stone-200/60">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  <div className="pt-1">
                    {quest.isClaimed ? (
                      <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã Nhận ⭐
                      </span>
                    ) : isFinished ? (
                      <button
                        onClick={() => {
                          audioService.playCelebrationBurst();
                          fireGrandCelebration();
                          onClaimQuest(quest.id);
                        }}
                        className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-b-4 border-emerald-800 shadow-md active:translate-y-1 active:border-b-0 transition-all flex items-center gap-1.5 animate-wiggle"
                      >
                        <Gift className="w-4 h-4" />
                        <span>Nhận Quà!</span>
                      </button>
                    ) : (
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1 rounded-xl">
                        Đang làm...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
