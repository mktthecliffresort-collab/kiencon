import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, GradeLevel } from '../types';
import { Flame, Award, Sparkles, Volume2, VolumeX, CheckCircle2, Trophy, Calendar, Zap, X, Settings } from 'lucide-react';
import { audioService } from '../services/audioService';

interface HeaderProps {
  user: UserProfile;
  onSwitchGrade: (grade: GradeLevel) => void;
  onOpenQuests: () => void;
  onOpenAllies: () => void;
  onOpenMastery: () => void;
  onOpenLeaderboard: () => void;
  onOpenProfile: () => void;
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
  unclaimedQuestsCount,
  isStreakTriggered,
}) => {
  const [isMuted, setIsMuted] = React.useState(audioService.getMuted());
  const [isFireActive, setIsFireActive] = useState<boolean>(false);
  const [showStreakPopover, setShowStreakPopover] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Trigger fire animation when isStreakTriggered flips or changes
  useEffect(() => {
    if (isStreakTriggered) {
      triggerFireAnimation();
    }
  }, [isStreakTriggered]);

  // Click outside to close streak popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowStreakPopover(false);
      }
    }
    if (showStreakPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStreakPopover]);

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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* DESKTOP & TABLET VIEW (md:flex hidden): Spacious 1-Tier Header */}
        <div className="hidden md:flex items-center justify-between h-20 gap-4">
          {/* Logo & Playful Ant Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                audioService.playBoingPop();
                onOpenAllies();
              }}
              className="flex items-center gap-3 group text-left focus:outline-none rounded-2xl p-1 active:scale-95 transition-transform"
              title="Khám phá Kiến Con"
            >
              <div className="w-12 h-12 lg:w-13 lg:h-13 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-md shadow-amber-200 border-2 border-amber-200 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200">
                <span className="text-2xl lg:text-3xl animate-bounce-short">🐜</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl lg:text-2xl tracking-tight text-amber-950 group-hover:text-amber-600 transition-colors">
                    KIẾN HỌC
                  </span>
                </div>
                <p className="text-xs font-bold text-amber-700">
                  {user.grade === 5
                    ? '🎒 Kiến Con • Lớp 5'
                    : '🔬 Kiến Con • Lớp 8'}
                </p>
              </div>
            </button>
          </div>

          {/* Center: Big Chunky Profile Switcher (Lớp 5 vs Lớp 8) */}
          <div className="flex items-center bg-amber-50 p-1.5 rounded-2xl border-2 border-amber-200 shadow-inner gap-1.5">
            <button
              id="desktop-switch-grade-5"
              onClick={() => {
                audioService.playBoingPop();
                onSwitchGrade(5);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-black transition-all ${
                user.grade === 5
                  ? 'bg-gradient-to-b from-amber-300 to-amber-400 text-amber-950 border-b-3 border-amber-600 shadow-sm scale-105'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-white/60'
              }`}
            >
              <span className="text-lg">👦</span>
              <span>Lớp 5</span>
            </button>

            <button
              id="desktop-switch-grade-8"
              onClick={() => {
                audioService.playBoingPop();
                onSwitchGrade(8);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-base font-black transition-all ${
                user.grade === 8
                  ? 'bg-gradient-to-b from-sky-300 to-sky-400 text-sky-950 border-b-3 border-sky-600 shadow-sm scale-105'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-white/60'
              }`}
            >
              <span className="text-lg">🧑‍🎓</span>
              <span>Lớp 8</span>
            </button>
          </div>

          {/* Right Gamification Stats: Streak, Leaderboard, XP, Quests, Audio */}
          <div className="flex items-center gap-2 lg:gap-2.5 shrink-0">
            {/* Daily Learning Streak Counter with Fire Animation */}
            <div className="relative" ref={!showStreakPopover ? undefined : popoverRef}>
              <button
                onClick={handleStreakClick}
                className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 font-black text-sm transition-all select-none active:scale-95 ${
                  isFireActive
                    ? 'bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 text-white border-orange-400 shadow-lg shadow-orange-300 animate-fire-burst ring-3 ring-orange-300'
                    : 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-950'
                }`}
                title={`Chuỗi học tập liên tục: ${user.streakDays} ngày. Nhấn xem chi tiết!`}
              >
                <div className="relative flex items-center justify-center">
                  <Flame
                    className={`w-5 h-5 transition-transform ${
                      isFireActive
                        ? 'text-yellow-200 fill-yellow-300 animate-flame-active'
                        : 'text-orange-500 fill-orange-500 animate-pulse'
                    }`}
                  />
                  {isFireActive && (
                    <>
                      <span className="absolute -top-2 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-ember-1 pointer-events-none" />
                      <span className="absolute -top-3 right-0 w-2 h-2 bg-orange-300 rounded-full animate-ember-2 pointer-events-none" />
                      <span className="absolute -top-2.5 left-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ember-3 pointer-events-none" />
                    </>
                  )}
                </div>
                <span className="font-black text-base tracking-tight">
                  {user.streakDays}d
                </span>
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

            {/* Leaderboard Button - Big Golden 3D Button */}
            <button
              id="desktop-header-leaderboard"
              onClick={() => {
                audioService.playBoingPop();
                onOpenLeaderboard();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-b from-amber-300 to-amber-400 border-b-3 border-amber-600 text-amber-950 font-black text-sm active:border-b-0 active:translate-y-1 shadow-xs hover:brightness-105 transition-all"
              title="Xem Bảng Xếp Hạng Thi Đua"
            >
              <Trophy className="w-5 h-5 text-amber-800 fill-amber-500 animate-wiggle" />
              <span>Xếp Hạng</span>
            </button>

            {/* XP & Level Badge */}
            <button
              id="desktop-header-mastery"
              onClick={() => {
                audioService.playBoingPop();
                onOpenMastery();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-b from-purple-100 to-purple-200 border-2 border-purple-300 text-purple-950 font-black text-sm hover:brightness-105 active:scale-95 transition-all"
              title="Xem Bảng Năng Lực"
            >
              <span className="px-1.5 py-0.5 rounded-lg bg-purple-500 text-white text-[11px] font-black">
                Lv{user.level}
              </span>
              <span className="font-bold text-purple-900">
                {user.xp} XP
              </span>
              <span>⭐</span>
            </button>

            {/* Daily Quests Button */}
            <button
              id="desktop-header-quests"
              onClick={() => {
                audioService.playBoingPop();
                onOpenQuests();
              }}
              className="relative p-2.5 rounded-2xl bg-gradient-to-b from-emerald-100 to-emerald-200 border-2 border-emerald-300 text-emerald-800 hover:brightness-105 active:scale-95 transition-all"
              title="Nhiệm vụ hàng ngày"
            >
              <CheckCircle2 className="w-5 h-5" />
              {unclaimedQuestsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-white text-white text-[11px] font-black flex items-center justify-center animate-bounce">
                  {unclaimedQuestsCount}
                </span>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-700 active:scale-90 transition-all"
              title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
            </button>

            {/* Profile & Settings Button */}
            <button
              id="desktop-header-profile"
              onClick={() => {
                audioService.playBoingPop();
                onOpenProfile();
              }}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300 text-amber-950 font-black text-xs sm:text-sm active:scale-95 shadow-2xs transition-all"
              title="Quản lý hồ sơ & cài đặt giao diện"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-base">
                {user.avatar || '🐜'}
              </div>
              <div className="text-left hidden lg:block">
                <div className="leading-tight truncate max-w-[110px] font-black text-amber-950">
                  {user.name || user.nickname || 'Bạn Kiến'}
                </div>
              </div>
              <Settings className="w-4 h-4 text-amber-600 animate-spin-slow hover:text-amber-800" />
            </button>
          </div>
        </div>

        {/* MOBILE VIEW (md:hidden): Structured 2-Tier Mobile Header */}
        <div className="md:hidden py-2 space-y-2">
          {/* Row 1: Brand & Essential Quick Actions */}
          <div className="flex items-center justify-between gap-2 h-11">
            {/* Left: Compact Brand Logo */}
            <button
              onClick={() => {
                audioService.playBoingPop();
                onOpenAllies();
              }}
              className="flex items-center gap-2 group text-left focus:outline-none min-w-0"
              title="Khám phá Kiến Con"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 flex items-center justify-center text-white shadow-xs border border-amber-300 shrink-0">
                <span className="text-xl">🐜</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-lg tracking-tight text-amber-950 truncate">
                    KIẾN HỌC
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                    Lớp {user.grade}
                  </span>
                </div>
              </div>
            </button>

            {/* Right: Streak + Quests + Sound */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Mobile Streak Button */}
              <button
                onClick={handleStreakClick}
                className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-xl border-2 font-black text-xs transition-all select-none active:scale-95 ${
                  isFireActive
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-md ring-2 ring-orange-300'
                    : 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-950'
                }`}
                title={`Chuỗi học tập: ${user.streakDays} ngày`}
              >
                <Flame
                  className={`w-4 h-4 ${
                    isFireActive
                      ? 'text-yellow-200 fill-yellow-300 animate-flame-active'
                      : 'text-orange-500 fill-orange-500'
                  }`}
                />
                <span className="font-black text-xs tracking-tight">
                  {user.streakDays}d
                </span>
              </button>

              {/* Mobile Daily Quests Button */}
              <button
                id="mobile-header-quests"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenQuests();
                }}
                className="relative p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 active:scale-95 transition-all"
                title="Nhiệm vụ hàng ngày"
              >
                <CheckCircle2 className="w-4 h-4" />
                {unclaimedQuestsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border border-white text-white text-[9px] font-black flex items-center justify-center animate-bounce">
                    {unclaimedQuestsCount}
                  </span>
                )}
              </button>

              {/* Mobile Sound Toggle */}
              <button
                onClick={handleToggleSound}
                className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 active:scale-90 transition-all"
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-600" />}
              </button>

              {/* Mobile Profile & Settings Button */}
              <button
                id="mobile-header-profile"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenProfile();
                }}
                className="p-1.5 px-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs flex items-center gap-1.5 active:scale-90 transition-all"
                title="Quản lý hồ sơ & cài đặt"
              >
                <span className="text-base leading-none">{user.avatar || '🐜'}</span>
                <span className="max-w-[70px] truncate font-black text-xs text-amber-950">{user.name || user.nickname || 'Bạn'}</span>
                <Settings className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              </button>
            </div>
          </div>

          {/* Row 2: Grade Switcher & Achievements */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-amber-100/80">
            {/* Left: Compact Grade Switcher */}
            <div className="flex items-center bg-amber-50 p-1 rounded-xl border border-amber-200 gap-1 shrink-0">
              <button
                id="mobile-switch-grade-5"
                onClick={() => {
                  audioService.playBoingPop();
                  onSwitchGrade(5);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  user.grade === 5
                    ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-500/50'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>👦</span>
                <span>Lớp 5</span>
              </button>

              <button
                id="mobile-switch-grade-8"
                onClick={() => {
                  audioService.playBoingPop();
                  onSwitchGrade(8);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                  user.grade === 8
                    ? 'bg-sky-400 text-sky-950 shadow-xs border border-sky-500/50'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <span>🧑‍🎓</span>
                <span>Lớp 8</span>
              </button>
            </div>

            {/* Right: Leaderboard & Level */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Leaderboard Button */}
              <button
                id="mobile-header-leaderboard"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenLeaderboard();
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-950 font-black text-xs active:scale-95 transition-all shadow-2xs"
                title="Bảng Xếp Hạng"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-700 fill-amber-500" />
                <span>BXH</span>
              </button>

              {/* Mastery / Level Button */}
              <button
                id="mobile-header-mastery"
                onClick={() => {
                  audioService.playBoingPop();
                  onOpenMastery();
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-950 font-black text-xs active:scale-95 transition-all shadow-2xs"
                title="Sức mạnh của Kiến"
              >
                <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[10px] font-black">
                  Lv{user.level}
                </span>
                <span className="font-bold text-purple-900 text-[11px]">{user.xp} XP</span>
                <span>⭐</span>
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

