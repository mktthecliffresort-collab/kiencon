import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, GradeLevel, getEducationalStage, getStageName, ALL_GRADES, DEMO_FEATURED_GRADES } from '../types';
import { Flame, Award, Sparkles, Volume2, VolumeX, CheckCircle2, Trophy, Calendar, Zap, X, Settings, Database, BookOpen, Heart, LogOut, LogIn, UserPlus, ShieldCheck, ChevronDown, Star } from 'lucide-react';
import { audioService } from '../services/audioService';
import { supabaseService } from '../services/supabaseService';

interface HeaderProps {
  user: UserProfile;
  onSwitchGrade: (grade: GradeLevel) => void;
  onOpenQuests: () => void;
  onOpenAllies: () => void;
  onOpenMastery: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup' | 'signout_confirm') => void;
  onOpenAdmin?: () => void;
  isAuthenticated?: boolean;
  unclaimedQuestsCount: number;
  isStreakTriggered?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onSwitchGrade,
  onOpenQuests,
  onOpenAllies,
  onOpenMastery,
  onOpenLeaderboard,
  onOpenProfile,
  onOpenAuth,
  onOpenAdmin,
  isAuthenticated = false,
  unclaimedQuestsCount,
  isStreakTriggered,
}) => {
  const [isMuted, setIsMuted] = React.useState(audioService.getMuted());
  const [isFireActive, setIsFireActive] = useState<boolean>(false);
  const [showStreakPopover, setShowStreakPopover] = useState<boolean>(false);
  const [showLeavesPopover, setShowLeavesPopover] = useState<boolean>(false);
  const [showGradePopover, setShowGradePopover] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const leavesPopoverRef = useRef<HTMLDivElement>(null);
  const gradePopoverRef = useRef<HTMLDivElement>(null);

  // Trigger fire animation when isStreakTriggered flips or changes
  useEffect(() => {
    if (isStreakTriggered) {
      triggerFireAnimation();
    }
  }, [isStreakTriggered]);

  // Click outside to close streak, leaves, & grade popovers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowStreakPopover(false);
      }
      if (leavesPopoverRef.current && !leavesPopoverRef.current.contains(event.target as Node)) {
        setShowLeavesPopover(false);
      }
      if (gradePopoverRef.current && !gradePopoverRef.current.contains(event.target as Node)) {
        setShowGradePopover(false);
      }
    }
    if (showStreakPopover || showLeavesPopover || showGradePopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStreakPopover, showLeavesPopover, showGradePopover]);

  const triggerFireAnimation = () => {
    setIsFireActive(true);
    audioService.playFireIgnite();
    setTimeout(() => {
      setIsFireActive(false);
    }, 2800);
  };

  const handleToggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playBoingPop();
    }
  };

  const handleStreakClick = () => {
    audioService.playBoingPop();
    triggerFireAnimation();
    setShowStreakPopover((prev) => !prev);
  };

  const xpProgressPercent = Math.min(100, Math.round(((user.xp % 200) / 200) * 100));

  // Weekly days representation (Monday to Sunday)
  const weekDays = [
    { label: 'T2', active: user.streakDays >= 1 },
    { label: 'T3', active: user.streakDays >= 2 },
    { label: 'T4', active: user.streakDays >= 3 },
    { label: 'T5', active: user.streakDays >= 4 },
    { label: 'T6', active: user.streakDays >= 5 },
    { label: 'T7', active: user.streakDays >= 6 },
    { label: 'CN', active: user.streakDays >= 7 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-amber-200 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        {/* DESKTOP & TABLET VIEW (md:flex hidden): Responsive 1-Tier Header with perfect Tablet support */}
        <div className="hidden md:flex items-center justify-between h-16 lg:h-20 gap-1.5 lg:gap-3">
          {/* Logo & Playful Ant Brand */}
          <div className="flex items-center gap-1.5 lg:gap-3 shrink-0">
            <button
              onClick={() => {
                audioService.playBoingPop();
                onOpenAllies();
              }}
              className="flex items-center gap-1.5 lg:gap-2.5 group text-left focus:outline-none rounded-2xl p-1 active:scale-95 transition-transform"
              title="Khám phá Kiến Con"
            >
              <div className="w-9 h-9 lg:w-12 lg:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-200 border-2 border-amber-200 group-hover:scale-105 group-hover:rotate-6 transition-all duration-200 shrink-0">
                <span className="text-xl lg:text-3xl animate-bounce-short">🐜</span>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-base lg:text-2xl tracking-tight text-amber-950 group-hover:text-amber-600 transition-colors">
                    KIẾN HỌC
                  </span>
                </div>
                <p className="hidden xl:block text-[11px] lg:text-xs font-bold text-amber-700">
                  {user.grade === 5
                    ? '🎒 Kiến Con • Lớp 5'
                    : '🔬 Kiến Con • Lớp 8'}
                </p>
              </div>
            </button>
          </div>

          {/* Center: Grade Display & Switcher (Toàn diện Khối Lớp 1 - 12 chuẩn GDPT 2018) */}
          <div className="relative shrink-0" ref={gradePopoverRef}>
            <button
              id="desktop-switch-grade-btn"
              onClick={() => {
                audioService.playBoingPop();
                setShowGradePopover((prev) => !prev);
              }}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3.5 py-1 lg:py-1.5 rounded-2xl border-2 font-black text-xs lg:text-sm transition-all select-none active:scale-95 shadow-2xs ${
                showGradePopover
                  ? 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm ring-2 ring-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100/80 border-amber-300 text-amber-950'
              }`}
              title="Nhấn để chuyển đổi khối lớp học (Lớp 1 - 12 chuẩn GDPT 2018)"
            >
              <BookOpen className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-900 shrink-0" />
              <span className="font-black">Lớp {user.grade}</span>
              <span className="hidden xl:inline text-xs text-amber-800 font-semibold">
                ({user.grade <= 5 ? 'Tiểu Học' : user.grade <= 9 ? 'THCS' : 'THPT'})
              </span>
              {([5, 8] as GradeLevel[]).includes(user.grade) && (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] bg-amber-300 text-amber-950 px-1.5 py-0.5 rounded-md font-black uppercase">
                  <Star className="w-2.5 h-2.5 fill-amber-700 text-amber-700" /> Demo
                </span>
              )}
              <ChevronDown className={`w-3.5 h-3.5 text-amber-800 transition-transform duration-200 ${showGradePopover ? 'rotate-180' : ''}`} />
            </button>

            {/* Desktop Grade Dropdown Card */}
            {showGradePopover && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-88 bg-white rounded-3xl p-4 border-3 border-amber-200 shadow-2xl z-50 animate-fadeIn space-y-3 text-left">
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base">
                      🎒
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-stone-900 leading-tight">
                        Chọn Khối Lớp Học (GDPT 2018)
                      </h4>
                      <p className="text-[10px] text-stone-500 font-medium">Hỗ trợ đầy đủ Lớp 1 - 12</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGradePopover(false)}
                    className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Tiểu học */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-amber-900 px-1">
                    <span>🎒 TIỂU HỌC (LỚP 1 - 5)</span>
                    <span className="text-[9px] text-amber-700 font-bold">Lớp 5: Demo Chuyên Sâu ★</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {([1, 2, 3, 4, 5] as GradeLevel[]).map((g) => {
                      const isSelected = user.grade === g;
                      const isDemo = g === 5;
                      return (
                        <button
                          key={g}
                          onClick={() => {
                            audioService.playBoingPop();
                            onSwitchGrade(g);
                            setShowGradePopover(false);
                          }}
                          className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                            isSelected
                              ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-xs ring-2 ring-amber-300/40'
                              : 'bg-stone-50 hover:bg-amber-50 border border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>Lớp {g}</span>
                          {isDemo && (
                            <span className="text-[8px] text-amber-900 font-black uppercase">Demo ★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* THCS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-sky-900 px-1">
                    <span>📚 THCS (LỚP 6 - 9)</span>
                    <span className="text-[9px] text-sky-700 font-bold">Lớp 8: Demo Chuyên Sâu ★</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {([6, 7, 8, 9] as GradeLevel[]).map((g) => {
                      const isSelected = user.grade === g;
                      const isDemo = g === 8;
                      return (
                        <button
                          key={g}
                          onClick={() => {
                            audioService.playBoingPop();
                            onSwitchGrade(g);
                            setShowGradePopover(false);
                          }}
                          className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                            isSelected
                              ? 'bg-sky-400 text-sky-950 border-2 border-sky-500 shadow-xs ring-2 ring-sky-300/40'
                              : 'bg-stone-50 hover:bg-sky-50 border border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>Lớp {g}</span>
                          {isDemo && (
                            <span className="text-[8px] text-sky-900 font-black uppercase">Demo ★</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* THPT */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-black text-purple-900 px-1">
                    <span>🎓 THPT (LỚP 10 - 12)</span>
                    <span className="text-[9px] text-purple-700 font-medium">Toàn diện GDPT</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {([10, 11, 12] as GradeLevel[]).map((g) => {
                      const isSelected = user.grade === g;
                      return (
                        <button
                          key={g}
                          onClick={() => {
                            audioService.playBoingPop();
                            onSwitchGrade(g);
                            setShowGradePopover(false);
                          }}
                          className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                            isSelected
                              ? 'bg-purple-400 text-purple-950 border-2 border-purple-500 shadow-xs ring-2 ring-purple-300/40'
                              : 'bg-stone-50 hover:bg-purple-50 border border-stone-200 text-stone-700'
                          }`}
                        >
                          <span>Lớp {g}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 leading-tight">
                  ✨ Lớp 5 & Lớp 8 là dữ liệu trải nghiệm demo chuyên sâu; bạn có thể chọn bất kỳ khối lớp nào để khám phá chương trình!
                </div>
              </div>
            )}
          </div>

          {/* Right Gamification Stats: Streak, Leaderboard, XP, Quests, Audio, Profile, Auth */}
          <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2 shrink-0">
            {/* Daily Learning Streak Counter with Fire Animation */}
            <div className="relative" ref={!showStreakPopover ? undefined : popoverRef}>
              <button
                onClick={handleStreakClick}
                className={`relative flex items-center gap-1 px-2 lg:px-3 py-1 lg:py-1.5 rounded-2xl border-2 font-black text-xs lg:text-sm transition-all select-none active:scale-95 ${
                  isFireActive
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white border-orange-400 shadow-sm ring-2 ring-orange-300'
                    : 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-950'
                }`}
                title={`Chuỗi học tập liên tục: ${user.streakDays} ngày. Nhấn xem chi tiết!`}
              >
                <Flame
                  className={`w-3.5 h-3.5 lg:w-4 lg:h-4 shrink-0 ${
                    isFireActive
                      ? 'text-yellow-200 fill-yellow-300 animate-flame-active'
                      : 'text-orange-500 fill-orange-500'
                  }`}
                />
                <span className="font-black tracking-tight">{user.streakDays}</span>
                <span className="hidden xl:inline text-xs">ngày</span>
              </button>

              {/* Desktop Streak Dropdown Card */}
              {showStreakPopover && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl p-5 border-3 border-orange-200 shadow-2xl z-50 animate-fadeIn space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shadow-inner">
                        🔥
                      </div>
                      <div>
                        <h4 className="text-base font-black text-stone-900">
                          Chuỗi Ngày Học Tập
                        </h4>
                        <p className="text-xs text-stone-500 font-semibold">Chăm chỉ mỗi ngày</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowStreakPopover(false)}
                      className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-100"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-orange-200 text-center space-y-1">
                    <div className="text-2xl font-black text-orange-600 flex items-center justify-center gap-2">
                      <Flame className="w-6 h-6 fill-orange-500 text-orange-500 animate-pulse" />
                      <span>{user.streakDays} Ngày Rực Cháy!</span>
                    </div>
                    <p className="text-xs font-semibold text-stone-600">
                      Mỗi ngày hoàn thành 1 bài học để thắp sáng và duy trì ngọn lửa thông thái!
                    </p>
                  </div>

                  {/* 7-Day Weekly Calendar Tracker */}
                  <div className="space-y-2">
                    <div className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>Tuần này của bạn:</span>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {weekDays.map((day, idx) => (
                        <div
                          key={idx}
                          className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                            day.active
                              ? 'bg-orange-200 border-orange-400 text-orange-950 font-black shadow-xs'
                              : 'bg-stone-50 border-stone-200 text-stone-400'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{day.label}</span>
                          <span className="text-base">
                            {day.active ? '🔥' : '○'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next Milestone */}
                  <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-700 shrink-0" />
                    <div className="text-xs font-bold text-amber-950">
                      <div>Mốc tiếp: {Math.max(5, user.streakDays + 1)} ngày (+50 XP)</div>
                    </div>
                  </div>

                  {/* Trigger Flame Test Button */}
                  <button
                    onClick={() => {
                      triggerFireAnimation();
                    }}
                    className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white shadow-md border-b-4 border-orange-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Flame className="w-5 h-5 fill-white" />
                    <span>Bùng Cháy Ngọn Lửa! 🔥</span>
                  </button>
                </div>
              )}
            </div>

            {/* Leaderboard Button - Golden 3D Button (Icon on tablet, icon + text on desktop) */}
            <button
              id="desktop-header-leaderboard"
              onClick={() => {
                audioService.playBoingPop();
                onOpenLeaderboard();
              }}
              className="flex items-center gap-1.5 p-1.5 lg:px-3 lg:py-2 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 border-b-2 lg:border-b-3 border-amber-600 text-amber-950 font-black text-xs lg:text-sm active:border-b-0 active:translate-y-0.5 shadow-xs hover:brightness-105 transition-all shrink-0"
              title="Xem Bảng Xếp Hạng Thi Đua"
            >
              <Trophy className="w-4 h-4 lg:w-5 lg:h-5 text-amber-800 fill-amber-500 animate-wiggle shrink-0" />
              <span className="hidden xl:inline">Xếp Hạng</span>
            </button>

            {/* XP & Level Badge */}
            <button
              id="desktop-header-mastery"
              onClick={() => {
                audioService.playBoingPop();
                onOpenMastery();
              }}
              className="flex items-center gap-1 lg:gap-1.5 px-2 lg:px-2.5 py-1 lg:py-1.5 rounded-2xl bg-gradient-to-b from-purple-100 to-purple-200 border-2 border-purple-300 text-purple-950 font-black text-xs lg:text-sm hover:brightness-105 active:scale-95 transition-all shrink-0"
              title="Xem Bảng Năng Lực"
            >
              <span className="px-1.5 py-0.5 rounded-lg bg-purple-500 text-white text-[10px] lg:text-[11px] font-black">
                Lv{user.level}
              </span>
              <span className="font-bold text-purple-900 text-xs lg:text-sm">
                {user.xp} XP
              </span>
              <span className="hidden xl:inline">⭐</span>
            </button>

            {/* 5 Energy Leaves (Lá Sinh Mệnh) - Duolingo Inspired Health / Energy */}
            <div className="relative hidden xl:block" ref={leavesPopoverRef}>
              <button
                id="desktop-header-energy-leaves"
                onClick={() => {
                  audioService.playBoingPop();
                  setShowLeavesPopover(!showLeavesPopover);
                }}
                className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 lg:py-2 rounded-2xl bg-gradient-to-b from-emerald-100 to-teal-100 border-2 border-emerald-300 text-emerald-950 font-black text-xs lg:text-sm hover:brightness-105 active:scale-95 transition-all shrink-0"
                title="5 Lá Sinh Mệnh - Năng lượng đào tổ và khám phá bài học"
              >
                <span className="text-base lg:text-lg animate-leaf-flutter inline-block">🍃</span>
                <span className="text-emerald-900 font-black">5/5</span>
              </button>

              {/* Leaves Explanatory Popover */}
              {showLeavesPopover && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-3xl p-5 border-3 border-emerald-300 shadow-2xl z-50 animate-fadeIn space-y-3 text-left">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-xl shadow-inner">
                        🍃
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-stone-900">
                          Lá Sinh Mệnh
                        </h4>
                        <p className="text-[11px] text-stone-500 font-bold">Năng lượng Vương quốc</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowLeavesPopover(false)}
                      className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-center space-y-1.5">
                    <div className="flex items-center justify-center gap-1.5 text-xl">
                      <span>🍃</span>
                      <span>🍃</span>
                      <span>🍃</span>
                      <span>🍃</span>
                      <span>🍃</span>
                    </div>
                    <div className="text-xs font-black text-emerald-950">5/5 Lá Sinh Mệnh Trọn Vẹn!</div>
                    <p className="text-[11px] text-stone-600 font-semibold leading-relaxed">
                      Lá sinh mệnh đồng hành giúp bạn kiên trì thử thách. Mỗi bài học hoàn thành sẽ giúp khu vườn tri thức mãi xanh tươi!
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      audioService.playSuccess();
                      setShowLeavesPopover(false);
                    }}
                    className="w-full py-2.5 rounded-xl font-black text-xs btn-ant-3d-green text-white shadow-xs"
                  >
                    ĐÃ HIỂU RỒI 🐜
                  </button>
                </div>
              )}
            </div>

            {/* Daily Quests Button */}
            <button
              id="desktop-header-quests"
              onClick={() => {
                audioService.playBoingPop();
                onOpenQuests();
              }}
              className="relative p-1.5 lg:p-2 rounded-2xl bg-gradient-to-b from-emerald-100 to-emerald-200 border-2 border-emerald-300 text-emerald-800 hover:brightness-105 active:scale-95 transition-all shrink-0"
              title="Nhiệm vụ hàng ngày"
            >
              <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
              {unclaimedQuestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-red-500 border-2 border-white text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                  {unclaimedQuestsCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-1.5 lg:p-2 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 active:scale-90 transition-all shrink-0"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Profile & Settings Button (Chỉ hiển thị khi đã đăng nhập) */}
            {isAuthenticated && (
              <button
                id="desktop-header-profile"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenProfile();
                }}
                className="flex items-center gap-1 lg:gap-1.5 p-1.5 lg:px-2.5 lg:py-1.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm active:scale-95 shadow-2xs transition-all shrink-0 relative"
                title="Quản lý hồ sơ & cài đặt học tập"
              >
                <div className="w-6 h-6 lg:w-7 lg:h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-sm lg:text-base shrink-0 relative">
                  {user.avatar || '🐜'}
                </div>
                <div className="text-left hidden xl:block">
                  <div className="leading-tight truncate max-w-[90px] font-black text-amber-950">
                    {user.nickname || user.name || 'Bạn Kiến'}
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Settings className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-amber-600 animate-spin-slow hover:text-amber-800 shrink-0" />
                </div>
              </button>
            )}

            {/* Auth / Account Buttons (Sign In / Sign Up / Sign Out - Always visible on Tablet) */}
            {isAuthenticated ? (
              <button
                id="desktop-header-signout"
                onClick={() => {
                  audioService.playBoingPop();
                  if (onOpenAuth) onOpenAuth('signout_confirm');
                }}
                className="p-1.5 lg:p-2 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 hover:text-rose-900 active:scale-95 transition-all shrink-0"
                title="Thoát tài khoản (Đăng xuất)"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="desktop-header-auth-cta"
                onClick={() => {
                  audioService.playBoingPop();
                  if (onOpenAuth) onOpenAuth('signup');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl btn-ant-3d-amber text-amber-950 font-black text-xs hover:brightness-105 active:scale-95 transition-all shadow-xs shrink-0"
                title="Đăng ký tài khoản học tập"
              >
                <UserPlus className="w-4 h-4 text-amber-800" />
                <span>Đăng ký</span>
              </button>
            )}
          </div>
        </div>

        {/* MOBILE VIEW (md:hidden): Structured 2-Tier Mobile Header */}
        <div className="md:hidden py-1.5 space-y-1.5">
          {/* Row 1: Brand & Essential Quick Actions */}
          <div className="flex items-center justify-between gap-1.5 h-10">
            {/* Left: Compact Brand Logo with Ant Icon */}
            <button
              onClick={() => {
                audioService.playBoingPop();
                onOpenAllies();
              }}
              className="flex items-center gap-1.5 group text-left focus:outline-none shrink-0"
              title="Khám phá Kiến Con"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-xs border border-amber-300 shrink-0">
                <span className="text-base">🐜</span>
              </div>
              <span className="font-black text-base tracking-tight text-amber-950">
                KIẾN HỌC
              </span>
            </button>

            {/* Right: Clean, Balanced Control Cluster (No Overflow) */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Energy Leaves */}
              <button
                onClick={() => {
                  audioService.playBoingPop();
                  setShowLeavesPopover(!showLeavesPopover);
                }}
                className="flex items-center gap-1 px-1.5 py-1 rounded-xl border border-emerald-300 bg-emerald-100 text-emerald-950 font-black text-xs active:scale-95 shrink-0"
                title="Lá Sinh Mệnh"
              >
                <span className="text-xs animate-leaf-flutter">🍃</span>
                <span className="text-[11px] font-black">5</span>
              </button>

              {/* Streak Counter */}
              <button
                onClick={handleStreakClick}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl border font-black text-xs transition-all active:scale-95 shrink-0 ${
                  isFireActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-xs ring-1 ring-orange-300'
                    : 'bg-orange-100 border-orange-300 text-orange-950'
                }`}
                title={`Chuỗi học tập: ${user.streakDays} ngày`}
              >
                <Flame
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isFireActive
                      ? 'text-yellow-200 fill-yellow-300 animate-flame-active'
                      : 'text-orange-500 fill-orange-500'
                  }`}
                />
                <span className="font-black text-xs tracking-tight">
                  {user.streakDays}d
                </span>
              </button>

              {/* 1-Tap Sound Toggle (Preserved for Students & Parents) */}
              <button
                onClick={handleToggleSound}
                className="p-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 active:scale-90 transition-all shrink-0"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-stone-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-600" />}
              </button>

              {/* Daily Quests Button */}
              <button
                id="mobile-header-quests"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenQuests();
                }}
                className="relative p-1.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 active:scale-95 transition-all shrink-0"
                title="Nhiệm vụ hàng ngày"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {unclaimedQuestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 border border-white text-white text-[8px] font-black flex items-center justify-center animate-bounce">
                    {unclaimedQuestsCount}
                  </span>
                )}
              </button>

              {/* Profile / Settings Button (Chỉ hiển thị khi đã đăng nhập) */}
              {isAuthenticated && (
                <button
                  id="mobile-header-profile"
                  onClick={() => {
                    audioService.playBoingPop();
                    onOpenProfile();
                  }}
                  className="p-1 px-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs flex items-center gap-1 active:scale-90 transition-all shrink-0"
                  title="Quản lý hồ sơ & cài đặt"
                >
                  <span className="text-sm leading-none">{user.avatar || '🐜'}</span>
                  <Settings className="w-3 h-3 text-amber-700 shrink-0" />
                </button>
              )}

              {/* Auth / Account Buttons */}
              {isAuthenticated ? (
                <button
                  id="mobile-header-signout"
                  onClick={() => {
                    audioService.playBoingPop();
                    if (onOpenAuth) onOpenAuth('signout_confirm');
                  }}
                  className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 active:scale-90 transition-all shrink-0"
                  title="Thoát tài khoản"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  id="mobile-header-auth-cta"
                  onClick={() => {
                    audioService.playBoingPop();
                    if (onOpenAuth) onOpenAuth('signup');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 font-black text-xs flex items-center gap-1 active:scale-95 shadow-2xs shrink-0"
                  title="Đăng ký tài khoản"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span className="font-black">Đăng ký</span>
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Unified Segmented Grade Switcher & Achievements */}
          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-amber-100">
            {/* Left: Mobile Grade Switcher Button */}
            <div className="relative">
              <button
                id="mobile-switch-grade-btn"
                onClick={() => {
                  audioService.playBoingPop();
                  setShowGradePopover((prev) => !prev);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border font-black text-xs shrink-0 shadow-2xs active:scale-95 transition-all ${
                  showGradePopover
                    ? 'bg-amber-400 text-amber-950 border-amber-600 ring-2 ring-amber-300'
                    : 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950'
                }`}
                title="Đổi khối lớp học (Lớp 1 - 12)"
              >
                <span>{user.grade <= 5 ? '🎒' : user.grade <= 9 ? '📚' : '🎓'}</span>
                <span>Lớp {user.grade}</span>
                {([5, 8] as GradeLevel[]).includes(user.grade) && (
                  <span className="text-[9px] bg-amber-300 text-amber-950 px-1 py-0.2 rounded font-black uppercase">
                    Demo ★
                  </span>
                )}
                <ChevronDown className={`w-3 h-3 text-amber-800 transition-transform ${showGradePopover ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Grade Dropdown Card */}
              {showGradePopover && (
                <div className="fixed inset-x-2 top-24 bg-white rounded-3xl p-4 border-3 border-amber-200 shadow-2xl z-50 animate-fadeIn space-y-3 text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base">
                        🎒
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-stone-900 leading-tight">
                          Chọn Khối Lớp Học (GDPT 2018)
                        </h4>
                        <p className="text-[10px] text-stone-500 font-medium">Hỗ trợ đầy đủ Lớp 1 - 12</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowGradePopover(false)}
                      className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tiểu học */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-amber-900 px-1">
                      <span>🎒 TIỂU HỌC (LỚP 1 - 5)</span>
                      <span className="text-[9px] text-amber-700 font-bold">Lớp 5: Demo Chuyên Sâu ★</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1">
                      {([1, 2, 3, 4, 5] as GradeLevel[]).map((g) => {
                        const isSelected = user.grade === g;
                        const isDemo = g === 5;
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              audioService.playBoingPop();
                              onSwitchGrade(g);
                              setShowGradePopover(false);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                              isSelected
                                ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-xs ring-2 ring-amber-300/40'
                                : 'bg-stone-50 hover:bg-amber-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                            {isDemo && (
                              <span className="text-[8px] text-amber-900 font-black uppercase">Demo ★</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* THCS */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-sky-900 px-1">
                      <span>📚 THCS (LỚP 6 - 9)</span>
                      <span className="text-[9px] text-sky-700 font-bold">Lớp 8: Demo Chuyên Sâu ★</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {([6, 7, 8, 9] as GradeLevel[]).map((g) => {
                        const isSelected = user.grade === g;
                        const isDemo = g === 8;
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              audioService.playBoingPop();
                              onSwitchGrade(g);
                              setShowGradePopover(false);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                              isSelected
                                ? 'bg-sky-400 text-sky-950 border-2 border-sky-500 shadow-xs ring-2 ring-sky-300/40'
                                : 'bg-stone-50 hover:bg-sky-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                            {isDemo && (
                              <span className="text-[8px] text-sky-900 font-black uppercase">Demo ★</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* THPT */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-black text-purple-900 px-1">
                      <span>🎓 THPT (LỚP 10 - 12)</span>
                      <span className="text-[9px] text-purple-700 font-medium">Toàn diện GDPT</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {([10, 11, 12] as GradeLevel[]).map((g) => {
                        const isSelected = user.grade === g;
                        return (
                          <button
                            key={g}
                            onClick={() => {
                              audioService.playBoingPop();
                              onSwitchGrade(g);
                              setShowGradePopover(false);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center ${
                              isSelected
                                ? 'bg-purple-400 text-purple-950 border-2 border-purple-500 shadow-xs ring-2 ring-purple-300/40'
                                : 'bg-stone-50 hover:bg-purple-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-100 text-[10px] text-stone-500 leading-tight">
                    ✨ Lớp 5 & Lớp 8 là dữ liệu demo chuyên sâu; bạn có thể chọn bất kỳ khối lớp nào để học tập!
                  </div>
                </div>
              )}
            </div>

            {/* Right: Leaderboard & Level */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Leaderboard Button */}
              <button
                id="mobile-header-leaderboard"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenLeaderboard();
                }}
                className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs active:scale-95 transition-all shadow-2xs shrink-0"
                title="Bảng Xếp Hạng"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-700 fill-amber-500 shrink-0" />
                <span>BXH</span>
              </button>

              {/* Mastery / Level Button */}
              <button
                id="mobile-header-mastery"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenMastery();
                }}
                className="flex items-center gap-1 px-1.5 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-950 font-black text-xs active:scale-95 transition-all shadow-2xs shrink-0"
                title="Sức mạnh của Kiến"
              >
                <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[9px] font-black shrink-0">
                  Lv{user.level}
                </span>
                <span className="font-bold text-purple-900 text-[11px] whitespace-nowrap">{user.xp} XP</span>
                <span className="text-[10px]">⭐</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Streak Popover (Centrally Fixed Modal on Mobile so it NEVER clips or overflows) */}
      {showStreakPopover && (
        <div className="md:hidden">
          {/* Backdrop for easy tap-to-dismiss on mobile */}
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-2xs z-40"
            onClick={() => setShowStreakPopover(false)}
          />

          <div
            ref={popoverRef}
            className="fixed inset-x-3 top-24 max-w-sm mx-auto bg-white rounded-3xl p-5 border-3 border-orange-200 shadow-2xl z-50 animate-fadeIn space-y-4 text-left max-h-[80vh] overflow-y-auto soft-scrollbar"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-2xl shadow-inner">
                  🔥
                </div>
                <div>
                  <h4 className="text-base font-black text-stone-900">
                    Chuỗi Ngày Học Tập
                  </h4>
                  <p className="text-xs text-stone-500 font-semibold">Chăm chỉ mỗi ngày</p>
                </div>
              </div>
              <button
                onClick={() => setShowStreakPopover(false)}
                className="text-stone-400 hover:text-stone-600 p-1.5 rounded-xl hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-orange-200 text-center space-y-1">
              <div className="text-2xl font-black text-orange-600 flex items-center justify-center gap-2">
                <Flame className="w-6 h-6 fill-orange-500 text-orange-500 animate-pulse" />
                <span>{user.streakDays} Ngày Rực Cháy!</span>
              </div>
              <p className="text-xs font-semibold text-stone-600">
                Mỗi ngày hoàn thành 1 bài học để thắp sáng và duy trì ngọn lửa thông thái!
              </p>
            </div>

            {/* 7-Day Weekly Calendar Tracker */}
            <div className="space-y-2">
              <div className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span>Tuần này của bạn:</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weekDays.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                      day.active
                        ? 'bg-orange-200 border-orange-400 text-orange-950 font-black shadow-xs'
                        : 'bg-stone-50 border-stone-200 text-stone-400'
                    }`}
                  >
                    <span className="text-[11px] font-bold">{day.label}</span>
                    <span className="text-base">
                      {day.active ? '🔥' : '○'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Milestone */}
            <div className="p-3 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-700 shrink-0" />
              <div className="text-xs font-bold text-amber-950">
                <div>Mốc tiếp: {Math.max(5, user.streakDays + 1)} ngày (+50 XP)</div>
              </div>
            </div>

            {/* Trigger Flame Test Button */}
            <button
              onClick={() => {
                triggerFireAnimation();
              }}
              className="w-full py-3 rounded-2xl font-black text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-white shadow-md border-b-4 border-orange-700 flex items-center justify-center gap-2 transition-all"
            >
              <Flame className="w-5 h-5 fill-white" />
              <span>Bùng Cháy Ngọn Lửa! 🔥</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

