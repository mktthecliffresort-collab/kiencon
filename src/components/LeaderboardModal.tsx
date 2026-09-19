import React, { useState, useMemo } from 'react';
import { UserProfile, GradeLevel, LeaderboardEntry } from '../types';
import { getLeaderboardEntries } from '../data/leaderboardData';
import { audioService } from '../services/audioService';
import { fireSmallConfetti } from '../utils/confettiHelper';
import {
  Trophy,
  Medal,
  Flame,
  Award,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Heart,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentGrade: GradeLevel;
  onSelectGrade?: (grade: GradeLevel) => void;
  onNavigateToStudy?: () => void;
}

type LeaderboardMetric = 'xp' | 'streak' | 'lessons';
type TimeFrame = 'week' | 'month' | 'all';

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  user,
  currentGrade,
  onSelectGrade,
  onNavigateToStudy,
}) => {
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(currentGrade);
  const [metric, setMetric] = useState<LeaderboardMetric>('xp');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('week');
  const [cheerCounts, setCheerCounts] = useState<Record<string, number>>({});
  const [cheerAnimId, setCheerAnimId] = useState<string | null>(null);

  // Sync selectedGrade with currentGrade if modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedGrade(currentGrade);
    }
  }, [isOpen, currentGrade]);

  const rawEntries = useMemo(() => {
    return getLeaderboardEntries(user, selectedGrade);
  }, [user, selectedGrade]);

  const sortedEntries = useMemo(() => {
    const list = [...rawEntries];
    if (metric === 'xp') {
      list.sort((a, b) => b.xp - a.xp);
    } else if (metric === 'streak') {
      list.sort((a, b) => b.streakDays - a.streakDays);
    } else if (metric === 'lessons') {
      list.sort((a, b) => b.lessonsCompletedCount - a.lessonsCompletedCount);
    }
    return list;
  }, [rawEntries, metric]);

  const currentUserRank = sortedEntries.findIndex((e) => e.isCurrentUser) + 1;
  const currentEntry = sortedEntries.find((e) => e.isCurrentUser);
  const entryAbove = currentUserRank > 1 ? sortedEntries[currentUserRank - 2] : null;

  const handleSendCheer = (id: string) => {
    audioService.playBoingPop();
    fireSmallConfetti();
    setCheerCounts((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
    setCheerAnimId(id);
    setTimeout(() => {
      setCheerAnimId(null);
    }, 600);
  };

  if (!isOpen) return null;

  const top1 = sortedEntries[0];
  const top2 = sortedEntries[1];
  const top3 = sortedEntries[2];
  const remainingEntries = sortedEntries.slice(3);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative">
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-100 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center text-xl shadow-sm shadow-amber-200">
              <Trophy className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  Đua Top Vương Quốc Kiến
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                  Toàn quốc ⭐
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Cùng nhau tiến bộ: Thi đua điểm XP, chuỗi ngày chăm chỉ và các thử thách xuất sắc
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls Row: Grade + TimeFrame + Metric */}
        <div className="p-4 sm:px-6 bg-stone-50/70 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
          {/* Grade Selector */}
          <div className="flex items-center bg-stone-200/70 p-1 rounded-xl">
            <button
              onClick={() => {
                audioService.playClick();
                setSelectedGrade(5);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedGrade === 5
                  ? 'bg-white text-amber-900 shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>👦 Lớp 5 (Tiểu học)</span>
            </button>
            <button
              onClick={() => {
                audioService.playClick();
                setSelectedGrade(8);
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                selectedGrade === 8
                  ? 'bg-white text-blue-900 shadow-xs font-black'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🧑‍🎓 Lớp 8 (THCS)</span>
            </button>
          </div>

          {/* Metric Selector */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
            <button
              onClick={() => {
                audioService.playClick();
                setMetric('xp');
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                metric === 'xp' ? 'bg-amber-500 text-white font-extrabold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Điểm XP</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setMetric('streak');
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                metric === 'streak' ? 'bg-orange-500 text-white font-extrabold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Chuỗi Ngày</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setMetric('lessons');
              }}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                metric === 'lessons' ? 'bg-emerald-600 text-white font-extrabold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Bài Học</span>
            </button>
          </div>

          {/* Timeframe pill */}
          <div className="flex items-center gap-1 text-[11px] text-stone-500 font-semibold">
            <span className="hidden md:inline">Kỳ thi đua:</span>
            <span className="bg-amber-100/70 text-amber-900 px-2.5 py-1 rounded-lg border border-amber-200">
              Tuần 3 - Tháng 9
            </span>
          </div>
        </div>

        {/* Modal Scroll Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* The Top 3 Podium (Bục Vinh Quang) */}
          <div className="pt-4 pb-2">
            <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-xl mx-auto text-center">
              {/* Top 2 - Silver (Left) */}
              {top2 && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-stone-100 border-2 border-stone-300 flex items-center justify-center text-2xl sm:text-3xl shadow-sm">
                      {top2.avatar}
                    </div>
                    <span className="absolute -top-2.5 -right-2 text-base">🥈</span>
                    {top2.isCurrentUser && (
                      <span className="absolute -bottom-2 inset-x-0 mx-auto text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full uppercase">
                        Bạn
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1">
                      {top2.name}
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">{top2.className}</div>
                    <div className="text-xs font-black text-stone-700">
                      {metric === 'xp' ? `${top2.xp} XP` : metric === 'streak' ? `${top2.streakDays} ngày` : `${top2.lessonsCompletedCount} bài`}
                    </div>
                  </div>

                  {/* Silver Podium Base */}
                  <div className="w-full h-20 sm:h-24 bg-gradient-to-b from-stone-200 to-stone-300 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-stone-300 text-stone-600 shadow-inner">
                    <span className="text-xl sm:text-2xl font-black">2</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Huy chương Bạc</span>
                  </div>
                </div>
              )}

              {/* Top 1 - Gold (Center - Highest) */}
              {top1 && (
                <div className="flex flex-col items-center space-y-2 -mt-4">
                  <div className="relative">
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-100 border-3 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-md ring-4 ring-amber-200/60">
                      {top1.avatar}
                    </div>
                    <span className="absolute -top-3.5 -right-2 text-2xl animate-bounce">👑</span>
                    {top1.isCurrentUser && (
                      <span className="absolute -bottom-2 inset-x-0 mx-auto text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full uppercase">
                        Bạn
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1">
                      {top1.name}
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">{top1.className}</div>
                    <div className="text-xs sm:text-sm font-black text-amber-700">
                      {metric === 'xp' ? `${top1.xp} XP` : metric === 'streak' ? `${top1.streakDays} ngày 🔥` : `${top1.lessonsCompletedCount} bài`}
                    </div>
                  </div>

                  {/* Gold Podium Base */}
                  <div className="w-full h-28 sm:h-32 bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-200 text-amber-950 shadow-md">
                    <span className="text-2xl sm:text-3xl font-black">1</span>
                    <span className="text-[10px] uppercase font-black tracking-wider">Quán Quân</span>
                  </div>
                </div>
              )}

              {/* Top 3 - Bronze (Right) */}
              {top3 && (
                <div className="flex flex-col items-center space-y-2">
                  <div className="relative">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-amber-50 border-2 border-amber-700/40 flex items-center justify-center text-2xl sm:text-3xl shadow-sm">
                      {top3.avatar}
                    </div>
                    <span className="absolute -top-2.5 -right-2 text-base">🥉</span>
                    {top3.isCurrentUser && (
                      <span className="absolute -bottom-2 inset-x-0 mx-auto text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full uppercase">
                        Bạn
                      </span>
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-xs sm:text-sm font-black text-stone-900 line-clamp-1">
                      {top3.name}
                    </div>
                    <div className="text-[10px] text-stone-500 line-clamp-1">{top3.className}</div>
                    <div className="text-xs font-black text-stone-700">
                      {metric === 'xp' ? `${top3.xp} XP` : metric === 'streak' ? `${top3.streakDays} ngày` : `${top3.lessonsCompletedCount} bài`}
                    </div>
                  </div>

                  {/* Bronze Podium Base */}
                  <div className="w-full h-16 sm:h-20 bg-gradient-to-b from-orange-200 to-amber-300/80 rounded-t-2xl flex flex-col items-center justify-center border-t-2 border-amber-300 text-amber-900 shadow-inner">
                    <span className="text-xl sm:text-2xl font-black">3</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Huy chương Đồng</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* List of Remaining Competitors (Rank 4+) */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-500 px-1">
              Bảng Tổng Hợp Chi Tiết:
            </h4>

            <div className="space-y-2">
              {sortedEntries.map((entry, index) => {
                const rank = index + 1;
                const isUser = entry.isCurrentUser;
                const cheers = (entry.cheersReceived || 0) + (cheerCounts[entry.id] || 0);

                return (
                  <div
                    key={entry.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isUser
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40 shadow-xs'
                        : 'bg-white border-stone-200/90 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank badge */}
                      <div className="w-8 text-center flex-shrink-0">
                        {rank === 1 ? (
                          <span className="text-lg">🥇</span>
                        ) : rank === 2 ? (
                          <span className="text-lg">🥈</span>
                        ) : rank === 3 ? (
                          <span className="text-lg">🥉</span>
                        ) : (
                          <span
                            className={`text-sm font-black ${
                              isUser ? 'text-amber-700' : 'text-stone-500'
                            }`}
                          >
                            #{rank}
                          </span>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-xl flex-shrink-0 border border-stone-200">
                        {entry.avatar}
                      </div>

                      {/* Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-extrabold text-stone-900">
                            {entry.name}
                          </span>
                          {isUser && (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-0.2 rounded-full">
                              BẠN
                            </span>
                          )}
                          <span className="hidden sm:inline-block text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-200">
                            {entry.badgeTitle}
                          </span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          <span>{entry.className}</span> • <span>{entry.school}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Cheer Button */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                      {/* Metric Stat */}
                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-black text-stone-900">
                          {metric === 'xp'
                            ? `${entry.xp} XP`
                            : metric === 'streak'
                            ? `${entry.streakDays} ngày`
                            : `${entry.lessonsCompletedCount} bài`}
                        </div>
                        <div className="text-[10px] text-stone-600 font-semibold flex items-center justify-end gap-1">
                          <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                          <span>{entry.streakDays}d streak</span>
                        </div>
                      </div>

                      {/* Cheer button */}
                      <button
                        onClick={() => handleSendCheer(entry.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1 ${
                          cheerAnimId === entry.id
                            ? 'bg-rose-500 text-white border-rose-600 scale-110 shadow-xs'
                            : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                        }`}
                        title="Gửi lời cổ vũ bạn học!"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                        <span className="text-[11px]">{cheers}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pinned User Progress Bar & Motivational Gap Banner */}
        <div className="p-4 sm:px-6 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-left w-full sm:w-auto">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-sm shrink-0">
              #{currentUserRank}
            </div>
            <div>
              <div className="text-xs font-black text-stone-900">
                Thứ hạng hiện tại của bạn: Hạng #{currentUserRank} ({currentEntry?.xp} XP)
              </div>
              <div className="text-[11px] text-stone-600">
                {entryAbove ? (
                  <span>
                    Chỉ cần thêm{' '}
                    <strong className="text-amber-700 font-extrabold">
                      {Math.max(10, entryAbove.xp - (currentEntry?.xp || 0) + 10)} XP
                    </strong>{' '}
                    nữa để vượt qua bạn <strong className="text-stone-800">{entryAbove.name}</strong> (#{currentUserRank - 1})!
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">
                    🎉 Tuyệt vời! Bạn đang giữ vị trí dẫn đầu bảng xếp hạng!
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              audioService.playClick();
              onClose();
              if (onNavigateToStudy) onNavigateToStudy();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs bg-stone-900 hover:bg-black text-white shadow-xs flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
          >
            <span>Vào học để tích lũy XP</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
