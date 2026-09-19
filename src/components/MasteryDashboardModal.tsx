import React, { useState, useEffect } from 'react';
import { UserProfile, Subject } from '../types';
import { Award, CheckCircle2, TrendingUp, X, Sparkles, BookOpen, RotateCcw, Zap } from 'lucide-react';
import { audioService } from '../services/audioService';
import { fireSmallConfetti } from '../utils/confettiHelper';

interface MasteryDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  subjects: Subject[];
  recentlyCompletedSubjectId?: string | null;
}

export const MasteryDashboardModal: React.FC<MasteryDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  subjects,
  recentlyCompletedSubjectId,
}) => {
  const [animationKey, setAnimationKey] = useState<number>(0);
  const [barsVisible, setBarsVisible] = useState<boolean>(false);

  // Trigger smooth fill transition whenever modal opens or animationKey changes
  useEffect(() => {
    if (isOpen) {
      setBarsVisible(false);
      const timer = setTimeout(() => {
        setBarsVisible(true);
        audioService.playSparkleShimmer();
      }, 120);

      return () => clearTimeout(timer);
    } else {
      setBarsVisible(false);
    }
  }, [isOpen, animationKey]);

  if (!isOpen) return null;

  const handleReplayAnimation = () => {
    audioService.playSparkleShimmer();
    fireSmallConfetti();
    setAnimationKey((prev) => prev + 1);
  };

  // Calculate overall mastery score
  const masteryScores = subjects.map((s) => user.subjectMastery[s.id] || 0);
  const overallMastery = masteryScores.length
    ? Math.round(masteryScores.reduce((acc, curr) => acc + curr, 0) / masteryScores.length)
    : 0;

  // 4 Core Competencies
  const competencies = [
    {
      name: 'Năng lực Tìm hiểu Tự nhiên & Đời sống',
      score: Math.min(100, overallMastery + 10),
      desc: 'Quan sát hiện tượng thực tế, đặt câu hỏi khoa học và thu thập dữ liệu khách quan.',
    },
    {
      name: 'Năng lực Tư duy & Lập luận Toán/Khoa học',
      score: overallMastery,
      desc: 'Áp dụng công thức, mô hình hóa số học và phân tích nguyên lý tương tác.',
    },
    {
      name: 'Năng lực Vận dụng Thực tiễn',
      score: Math.min(100, Math.max(20, overallMastery - 5)),
      desc: 'Ra quyết định tối ưu trong các tình huống phát sinh ngoài đời sống.',
    },
    {
      name: 'Năng lực Truyền đạt & Giảng giải Tự tin',
      score: Math.min(100, overallMastery + 5),
      desc: 'Diễn giải sâu sắc bằng ngôn từ cá nhân, chứng minh sự thấu suốt bản chất.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => {
            audioService.playClick();
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-amber-600" />
            <h3 className="font-extrabold text-stone-900 text-xl sm:text-2xl">
              Sức mạnh của Kiến - {user.name || user.nickname || 'Bạn Kiến'} (Lớp {user.grade})
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-stone-500">
            Hệ thống đánh giá sự tiến bộ liên tục, không so sánh thứ hạng mà tập trung vào năng lực nội tại.
          </p>
        </div>

        {/* Recently completed lesson celebration alert banner */}
        {recentlyCompletedSubjectId && (
          <div className="bg-gradient-to-r from-emerald-50 via-amber-50 to-orange-50 p-4 rounded-2xl border border-emerald-300 shadow-xs flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-xs">
                ✨
              </div>
              <div>
                <div className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                  <span>Vừa hoàn thành bài học xuất sắc!</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold">
                    +15% Năng Lực
                  </span>
                </div>
                <div className="text-[11px] text-stone-600">
                  Thanh năng lực môn học vừa được tăng trưởng với hiệu ứng lấp lánh bên dưới.
                </div>
              </div>
            </div>
            <button
              onClick={handleReplayAnimation}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-stone-700 hover:bg-stone-50 border border-stone-200 shadow-xs flex items-center gap-1 shrink-0"
              title="Phát lại hiệu ứng nạp tiến độ"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden xs:inline">Phát lại</span>
            </button>
          </div>
        )}

        {/* Big Overall Mastery Ring Card */}
        <div className="bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700">
              Chỉ số Thành thạo Tổng thể
            </span>
            <div className="text-3xl sm:text-4xl font-black text-stone-900">
              {overallMastery}% Mastery
            </div>
            <p className="text-xs text-stone-600 max-w-sm">
              Dựa trên tiến độ các bài học và thử thách đã hoàn thành.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-center bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-2xl font-black text-amber-600">{user.xp}</div>
              <div className="text-[11px] font-bold text-stone-500 uppercase">Tổng XP</div>
            </div>
            <div className="text-center bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
              <div className="text-2xl font-black text-orange-600">{user.streakDays}d</div>
              <div className="text-[11px] font-bold text-stone-500 uppercase">Chuỗi ngày</div>
            </div>
          </div>
        </div>

        {/* Subject Mastery Progress Bars with Smooth Transition & Sparkle Effect */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Mức độ làm chủ theo môn học:</span>
            </h4>
            <button
              onClick={handleReplayAnimation}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 px-2.5 py-1 rounded-lg hover:bg-amber-50 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Xem hiệu ứng lấp lánh ✨</span>
            </button>
          </div>

          <div className="space-y-3">
            {subjects.map((subj, index) => {
              const score = user.subjectMastery[subj.id] || 0;
              const isRecent = recentlyCompletedSubjectId === subj.id;

              return (
                <div
                  key={`${subj.id}_${animationKey}`}
                  className={`p-4 rounded-2xl border transition-all duration-300 relative ${
                    isRecent
                      ? 'bg-amber-50/60 border-amber-300 ring-2 ring-amber-400/30 shadow-xs'
                      : 'bg-stone-50/80 border-stone-200/90'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-stone-900 text-sm font-extrabold">{subj.name}</span>
                      {isRecent && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          <Zap className="w-3 h-3 text-emerald-600" />
                          Vừa tăng năng lực!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-stone-900">{score}%</span>
                      <span className="text-[10px] font-semibold text-stone-500">Mastery</span>
                    </div>
                  </div>

                  {/* Outer Track with Rounded Inset */}
                  <div className="w-full h-3.5 bg-stone-200/80 rounded-full overflow-hidden p-0.5 relative shadow-inner">
                    {/* Inner Animated Progress Bar */}
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                      style={{
                        width: barsVisible ? `${Math.max(4, score)}%` : '0%',
                        transitionDelay: `${index * 80}ms`,
                        background:
                          score >= 70
                            ? 'linear-gradient(90deg, #f59e0b 0%, #10b981 100%)'
                            : score >= 40
                            ? 'linear-gradient(90deg, #f59e0b 0%, #ea580c 100%)'
                            : 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                      }}
                    >
                      {/* Subtle Sparkle Light Sweep effect passing across the progress bar */}
                      <div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none animate-sparkle-sweep"
                        style={{
                          animationDelay: `${index * 120}ms`,
                        }}
                      />

                      {/* Twinkling sparkle star at the leading tip */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="inline-block text-[9px] text-white animate-sparkle-twinkle select-none drop-shadow-xs">
                          ✦
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtitle / context description */}
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-stone-500">
                    <span>{subj.description}</span>
                    {barsVisible && (
                      <span className="text-[10px] text-amber-700 font-bold flex items-center gap-0.5 shrink-0">
                        <span>✨</span>
                        <span>Chuẩn kiến thức môn học</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Core Competency Profiles */}
        <div className="space-y-3 pt-2">
          <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            4 Sức Mạnh Cốt Lõi Của Kiến:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {competencies.map((comp, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-stone-900">{comp.name}</span>
                  <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                    {comp.score}%
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 leading-relaxed">{comp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory / Badges Earned */}
        <div className="space-y-2 pt-2">
          <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            Hành trang & Huy hiệu đã thu thập:
          </h4>
          <div className="flex flex-wrap gap-2">
            {user.inventory.map((item, idx) => (
              <span
                key={idx}
                className="text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5"
              >
                <span>🎖️</span>
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
