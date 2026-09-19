import React from 'react';
import { LessonDiscover, AntAlly, GradeLevel } from '../../types';
import { Sparkles, Lightbulb, Compass, ArrowRight } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface StageDiscoverProps {
  discover: LessonDiscover;
  ally: AntAlly;
  grade: GradeLevel;
  onContinue: () => void;
}

export const StageDiscover: React.FC<StageDiscoverProps> = ({
  discover,
  ally,
  grade,
  onContinue,
}) => {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Real-World Dilemma Context Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
        {/* Stage 1 Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-extrabold text-sm">
              1
            </span>
            <span className="font-extrabold text-stone-900 tracking-tight text-base sm:text-lg">
              CHẶNG 1: KHÁM PHÁ HIỆN TƯỢNG (DISCOVER)
            </span>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
            Tình huống thực tế
          </span>
        </div>

        {/* Story Illustration / Visual Card */}
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 rounded-2xl p-6 border border-amber-200/70 relative overflow-hidden">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex-shrink-0 flex items-center justify-center text-3xl border border-amber-100">
              {ally.icon || (grade === 5 ? '🎂' : '🔬')}
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 bg-white/80 px-2 py-0.5 rounded-md border border-amber-200">
                {grade === 5
                  ? 'Câu chuyện Vương quốc Kiến'
                  : ally.id === 'no'
                  ? 'Hồ sơ Phòng Thí nghiệm Hóa học'
                  : 'Hồ sơ Thám hiểm Thực địa'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                {discover.storyTitle}
              </h3>
            </div>
          </div>

          <p className="text-sm sm:text-base text-stone-700 mt-4 leading-relaxed whitespace-pre-line">
            {discover.storyContent}
          </p>

          <div className="mt-4 pt-4 border-t border-amber-200/60 flex items-center gap-2 text-xs font-semibold text-amber-900">
            <Compass className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Liên hệ thực tiễn: {discover.realWorldContext}</span>
          </div>
        </div>

        {/* The Prompt Question from Kiến Con */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-3">
          <div className="flex items-center gap-2 text-stone-800 font-bold text-sm">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            <span>Câu hỏi gợi mở từ {ally.name}:</span>
          </div>
          <p className="text-sm sm:text-base font-extrabold text-stone-900 italic">
            "{discover.promptQuestion}"
          </p>
          <div className="bg-white p-3 rounded-xl border border-stone-200 text-xs text-stone-600 font-medium">
            💡 <strong className="text-stone-800">Điểm cốt lõi cần quan sát:</strong>{' '}
            {discover.keyObservation}
          </div>
        </div>

        {/* Next Stage Action */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={() => {
              audioService.playClick();
              onContinue();
            }}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl font-black text-sm text-white transition-all shadow-md active:scale-95 ${
              grade === 5
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
            }`}
          >
            <span>Bắt đầu Chặng 2: Thực Hành Mô Phỏng</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
