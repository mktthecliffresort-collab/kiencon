import React, { useState, useMemo } from 'react';
import { Lesson, Subject, UserProfile, KHTNDomain } from '../types';
import { ALLIES } from '../data/mockData';
import { 
  Sparkles, 
  Lock, 
  Check, 
  Play, 
  Star, 
  Trophy, 
  Compass, 
  Flame, 
  X, 
  ChevronRight, 
  BookOpen, 
  Gift, 
  Zap,
  Target,
  Layers,
  List
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { fireSmallConfetti } from '../utils/confettiHelper';

interface AntLearningPathProps {
  lessons: Lesson[];
  subject: Subject | null;
  selectedDomain?: KHTNDomain;
  user: UserProfile;
  onStartLesson: (lesson: Lesson) => void;
  onOpenRiddles?: () => void;
  onOpenArena?: () => void;
  onSwitchViewToList?: () => void;
}

/**
 * Calculates the horizontal offset (X position) for each node using a sinusoidal curve
 * Creates the organic, winding ant trail inspired by the Ant Kingdom aesthetic.
 */
export const getAntPathOffset = (index: number, containerWidth: number = 360) => {
  const amplitude = Math.min((containerWidth - 100) / 2.8, 80);
  const frequency = 0.85;
  const x = Math.sin(index * frequency) * amplitude;
  return Math.round(x);
};

// Encouraging words spoken by Ant Allies along the path
const ALLY_CHEERS = [
  "Cố lên bạn nhỏ, kiến tha lâu đầy tổ! 🐜",
  "Từng bước nhỏ tạo nên kỳ tích lớn! ⭐",
  "Quan sát kỹ đề bài nhé bạn ơi! 💡",
  "Sắp tới trạm Rương Hạt Đường rồi! 🍯",
  "Giải thích lại cho mình nghe nhé! 🎓",
  "Bạn học rất chăm chỉ và thông minh! 🌟",
  "Đào sâu kiến thức, mở khóa vương quốc! 🏰"
];

export const AntLearningPath: React.FC<AntLearningPathProps> = ({
  lessons,
  subject,
  selectedDomain,
  user,
  onStartLesson,
  onOpenRiddles,
  onOpenArena,
  onSwitchViewToList,
}) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');
  const [showRiddleModal, setShowRiddleModal] = useState<boolean>(false);
  const [riddleClaimed, setRiddleClaimed] = useState<boolean>(false);

  // Filter lessons based on grade 8 KHTN domain or selected theme
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      if (subject?.isIntegrated && selectedDomain) {
        if (lesson.domainBranch !== selectedDomain) return false;
      }
      if (selectedThemeFilter !== 'all') {
        if (!lesson.unit.includes(selectedThemeFilter)) return false;
      }
      return true;
    });
  }, [lessons, subject, selectedDomain, selectedThemeFilter]);

  // Unique theme units for the theme selector plaque
  const themes = useMemo(() => {
    if (subject?.id === 'toan_5') {
      return [
        { id: 'all', label: 'Tất cả bài học' },
        { id: 'Chủ đề 1', label: 'CĐ 1: Ôn tập & Bổ sung' },
        { id: 'Chủ đề 2', label: 'CĐ 2: Số thập phân' },
        { id: 'Chủ đề 3', label: 'CĐ 3: Hình học phẳng' },
        { id: 'Chủ đề 4', label: 'CĐ 4: Các phép tính STP' },
      ];
    }
    return [
      { id: 'all', label: 'Toàn bộ hành trình' },
      { id: 'Chủ đề 1', label: 'Chủ đề 1: Khám phá' },
      { id: 'Chủ đề 2', label: 'Chủ đề 2: Chuyên sâu' },
    ];
  }, [subject]);

  // Calculate first incomplete lesson index to identify active node
  const activeIndex = useMemo(() => {
    const idx = filteredLessons.findIndex((l) => !user.completedLessons.includes(l.id));
    return idx === -1 ? filteredLessons.length - 1 : idx;
  }, [filteredLessons, user.completedLessons]);

  // Progress metrics for current filtered lessons
  const completedCount = useMemo(() => {
    return filteredLessons.filter((l) => user.completedLessons.includes(l.id)).length;
  }, [filteredLessons, user.completedLessons]);

  const progressPercent = filteredLessons.length > 0 
    ? Math.round((completedCount / filteredLessons.length) * 100)
    : 0;

  if (!subject) return null;

  // Interleave checkpoints after every 3 lessons
  const pathItems: Array<
    | { type: 'lesson'; lesson: Lesson; index: number }
    | { type: 'checkpoint_chest'; index: number; id: string }
    | { type: 'checkpoint_arena'; index: number; id: string }
  > = [];

  filteredLessons.forEach((lesson, i) => {
    pathItems.push({ type: 'lesson', lesson, index: i });
    if ((i + 1) % 3 === 0 && i !== filteredLessons.length - 1) {
      if ((i + 1) % 6 === 0) {
        pathItems.push({ type: 'checkpoint_arena', index: i + 0.5, id: `arena_${i}` });
      } else {
        pathItems.push({ type: 'checkpoint_chest', index: i + 0.5, id: `chest_${i}` });
      }
    }
  });

  const handleNodeClick = (lesson: Lesson, isLocked: boolean) => {
    if (isLocked) {
      audioService.playBoingPop();
      return;
    }
    audioService.playBoingPop();
    setSelectedLesson(lesson);
  };

  const handleChestClick = () => {
    audioService.playSparkleShimmer();
    if (onOpenRiddles) {
      onOpenRiddles();
    } else {
      setShowRiddleModal(true);
    }
  };

  const handleArenaClick = () => {
    audioService.playBoingPop();
    if (onOpenArena) {
      onOpenArena();
    } else {
      audioService.playSuccess();
      fireSmallConfetti();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 select-none">
      {/* 1. Domain Section Header - Tấm Bảng Gỗ Treo Vương Quốc Kiến */}
      <div className="relative bg-gradient-to-b from-amber-800 to-amber-950 rounded-3xl p-5 sm:p-6 border-4 border-amber-900 wood-plaque-shadow text-amber-50 overflow-hidden">
        {/* Hanging rope loop accents on top corners */}
        <div className="absolute -top-3 left-8 w-6 h-6 rounded-full border-4 border-amber-600/80 bg-stone-900" />
        <div className="absolute -top-3 right-8 w-6 h-6 rounded-full border-4 border-amber-600/80 bg-stone-900" />

        {/* Background ant pattern watermark */}
        <div className="absolute -right-4 -bottom-6 text-7xl opacity-10 pointer-events-none">
          🐜
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-500 text-stone-950 shadow-xs">
                {subject.code} • LỚP {subject.grade}
              </span>
              <span className="text-xs font-bold text-amber-200/90 flex items-center gap-1">
                <span>🏰 Bản Đồ Hành Trình</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{subject.name}</span>
              <span className="text-xl">🗺️</span>
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-200/80 max-w-md">
              Mỗi bước chân là một hạt cát xây nên tổ ấm tri thức vững vàng.
            </p>
          </div>

          {/* Domain Progress Meter & View Switcher */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5 bg-amber-900/60 p-3 sm:p-3.5 rounded-2xl border border-amber-700/60">
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[11px] font-bold text-amber-300">Tiến trình chặng</div>
                <div className="text-lg sm:text-xl font-black text-amber-100 flex items-center gap-1">
                  <span>{completedCount}/{filteredLessons.length}</span>
                  <span className="text-xs text-amber-300 font-bold">({progressPercent}%)</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl">
                🍯
              </div>
            </div>

            {/* View Switcher Button (Path Map vs List View) */}
            {onSwitchViewToList && (
              <button
                onClick={() => {
                  audioService.playBoingPop();
                  onSwitchViewToList();
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/30 hover:bg-amber-500/50 border border-amber-400/50 text-amber-100 font-black text-xs transition-all active:scale-95"
                title="Chuyển sang danh sách bài học"
              >
                <List className="w-3.5 h-3.5 text-amber-300" />
                <span>Xem dạng thẻ</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar under plaque */}
        <div className="mt-4 pt-3 border-t border-amber-700/50 flex items-center gap-3">
          <div className="flex-1 bg-amber-950/80 rounded-full h-3 p-0.5 border border-amber-700/60 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-400 via-yellow-300 to-emerald-400 h-full rounded-full transition-all duration-700 relative"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-sparkle-sweep" />
            </div>
          </div>
          <span className="text-xs font-black text-amber-300 shrink-0">
            {completedCount === filteredLessons.length && filteredLessons.length > 0
              ? '👑 Hoàn thành!'
              : `${filteredLessons.length - completedCount} bài tiếp theo`}
          </span>
        </div>

        {/* Theme Selector Tabs */}
        {themes.length > 1 && (
          <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => {
                  audioService.playBoingPop();
                  setSelectedThemeFilter(theme.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                  selectedThemeFilter === theme.id
                    ? 'bg-amber-400 text-amber-950 shadow-sm scale-105'
                    : 'bg-amber-900/40 text-amber-200 hover:bg-amber-900/80 border border-amber-700/40'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Sinuous Ant Path Map Area */}
      <div className="relative py-8 px-4 flex flex-col items-center">
        {/* Subtle ground grass/soil texture backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/40 via-emerald-50/20 to-amber-50/30 rounded-3xl -z-10 border border-amber-200/50" />

        {/* SVG Curved Dotted Ant Trail */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none -z-5 overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="antTrailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#10B981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {pathItems.map((item, idx) => {
            if (idx === pathItems.length - 1) return null;
            const nextItem = pathItems[idx + 1];

            // Node vertical spacing is approximately 140px
            const y1 = idx * 140 + 60;
            const y2 = (idx + 1) * 140 + 60;
            const x1 = 180 + getAntPathOffset(item.index, 360);
            const x2 = 180 + getAntPathOffset(nextItem.index, 360);

            // Control points for smooth bezier curve
            const cy1 = y1 + 70;
            const cy2 = y2 - 70;

            return (
              <g key={`trail_${idx}`}>
                <path
                  d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#D97706"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="4 14"
                  opacity="0.35"
                />
                <path
                  d={`M ${x1} ${y1} C ${x1} ${cy1}, ${x2} ${cy2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="url(#antTrailGrad)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="2 16"
                  opacity="0.75"
                />
              </g>
            );
          })}
        </svg>

        {/* Path Nodes List */}
        <div className="space-y-16 w-full flex flex-col items-center">
          {pathItems.map((item, index) => {
            const xOffset = getAntPathOffset(item.index, 360);

            // ================== LESSON NODE ==================
            if (item.type === 'lesson') {
              const lesson = item.lesson;
              const lessonIndex = item.index;
              const isCompleted = user.completedLessons.includes(lesson.id);
              const isActive = lessonIndex === activeIndex;
              const isLocked = lessonIndex > activeIndex;
              const ally = ALLIES[lesson.allyId] || ALLIES.kien;
              const allyQuote = ALLY_CHEERS[lessonIndex % ALLY_CHEERS.length];

              return (
                <div
                  key={lesson.id}
                  className="relative flex flex-col items-center group"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  {/* Floating Speech Bubble for Active Node */}
                  {isActive && (
                    <div className="absolute -top-12 z-20 flex flex-col items-center animate-bubble-float pointer-events-none">
                      <div className="bg-amber-500 text-white font-black text-xs px-3.5 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 tracking-wider uppercase">
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>BẮT ĐẦU NGAY</span>
                      </div>
                      <div className="w-0 h-0 border-x-6 border-x-transparent border-t-6 border-t-amber-500" />
                    </div>
                  )}

                  {/* 3D Round Node Button (76px diameter) */}
                  <button
                    id={`path-node-${lesson.id}`}
                    onClick={() => handleNodeClick(lesson, isLocked)}
                    disabled={isLocked}
                    className={`relative w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center font-black transition-all active:translate-y-2 select-none z-10 ${
                      isCompleted
                        ? 'bg-amber-500 hover:bg-amber-400 text-white border-b-6 border-amber-700 shadow-xl shadow-amber-200'
                        : isActive
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-6 border-emerald-700 shadow-2xl shadow-emerald-200 animate-ant-node-pulse ring-4 ring-emerald-300'
                        : 'bg-slate-200 text-slate-400 border-b-6 border-slate-400 cursor-not-allowed opacity-80'
                    }`}
                    title={isLocked ? 'Hãy hoàn thành bài học trước để mở khóa' : lesson.title}
                  >
                    {/* Inner Node Icon */}
                    {isCompleted ? (
                      <div className="flex flex-col items-center">
                        <Star className="w-7 h-7 fill-white text-white drop-shadow-sm" />
                      </div>
                    ) : isActive ? (
                      <div className="flex flex-col items-center">
                        <span className="text-2xl drop-shadow-sm animate-wiggle">🐜</span>
                      </div>
                    ) : (
                      <Lock className="w-6 h-6 text-slate-400" />
                    )}

                    {/* Checkmark badge for completed node */}
                    {isCompleted && (
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white text-white flex items-center justify-center text-xs shadow-md">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    )}

                    {/* Lesson step index marker */}
                    <span 
                      className={`absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full border-2 border-white text-[11px] font-black flex items-center justify-center shadow-xs ${
                        isCompleted ? 'bg-amber-600 text-white' : isActive ? 'bg-emerald-600 text-white' : 'bg-slate-400 text-white'
                      }`}
                    >
                      {lessonIndex + 1}
                    </span>
                  </button>

                  {/* Title Label Beneath Node */}
                  <div className="mt-2 text-center max-w-[160px]">
                    <div className="font-extrabold text-xs sm:text-sm text-stone-900 line-clamp-2 leading-tight">
                      {lesson.title}
                    </div>
                    <div className="text-[10px] font-bold text-stone-500 flex items-center justify-center gap-1 mt-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>+{lesson.xpReward} XP</span>
                    </div>
                  </div>

                  {/* Ant Mascot standing beside the active or alternating node */}
                  {(isActive || lessonIndex % 4 === 1) && (
                    <div 
                      className={`absolute top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 pointer-events-none ${
                        lessonIndex % 2 === 0 ? 'left-[95px]' : 'right-[95px] flex-row-reverse'
                      }`}
                    >
                      <div className="w-11 h-11 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-sm animate-wiggle">
                        {ally.icon || '🐜'}
                      </div>
                      <div className="bg-white px-3 py-1.5 rounded-2xl border-2 border-amber-200 shadow-md text-left max-w-[160px]">
                        <div className="text-[10px] font-black text-amber-700">{ally.name}</div>
                        <div className="text-[11px] font-semibold text-stone-700 leading-tight">
                          {allyQuote}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ================== CHECKPOINT: CHEST ==================
            if (item.type === 'checkpoint_chest') {
              return (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  <button
                    onClick={handleChestClick}
                    className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-300 border-b-6 border-amber-600 shadow-xl flex items-center justify-center text-3xl transition-all active:translate-y-2 hover:scale-105"
                    title="Mở Rương Hạt Đường - Đố vui Toán học"
                  >
                    🎁
                  </button>
                  <div className="mt-1 bg-amber-100 border border-amber-300 text-amber-900 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" />
                    <span>Rương Hạt Đường</span>
                  </div>
                </div>
              );
            }

            // ================== CHECKPOINT: ARENA ==================
            if (item.type === 'checkpoint_arena') {
              return (
                <div
                  key={item.id}
                  className="relative flex flex-col items-center"
                  style={{ transform: `translateX(${xOffset}px)` }}
                >
                  <button
                    onClick={handleArenaClick}
                    className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 border-b-6 border-emerald-700 shadow-xl flex items-center justify-center text-3xl transition-all active:translate-y-2 hover:scale-105"
                    title="Thách Đấu Đấu Trường 60s"
                  >
                    🏆
                  </button>
                  <div className="mt-1 bg-emerald-100 border border-emerald-300 text-emerald-900 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <Flame className="w-3 h-3 text-emerald-600" />
                    <span>Đấu Trường 60s</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* 3. Interactive Lesson Launch Modal (Popup khởi động bài học khi bấm vào Node) */}
      {selectedLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 border-2 border-amber-300 shadow-2xl space-y-5 relative overflow-hidden text-left">
            {/* Top decorative amber strip */}
            <div className="absolute top-0 inset-x-0 h-2.5 bg-gradient-to-r from-amber-400 via-orange-500 to-emerald-500" />

            {/* Header row with Close button */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full border border-amber-300 inline-block">
                  {selectedLesson.unit || 'Bài học trọng tâm'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-stone-900 leading-snug">
                  {selectedLesson.title}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-stone-500">
                  {selectedLesson.subtitle}
                </p>
              </div>

              <button
                onClick={() => setSelectedLesson(null)}
                className="text-stone-400 hover:text-stone-700 p-1.5 rounded-2xl hover:bg-stone-100 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 4-Stage Pedagogical Roadmap Visualizer */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5">
              <div className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-amber-600" />
                <span>Quy trình chinh phục 4 chặng:</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-200">
                  <div className="text-base">🧭</div>
                  <div className="text-[11px] font-black text-amber-900">1. Khám phá</div>
                  <div className="text-[9px] text-amber-700 font-semibold">Tình huống thực tế</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-100/70 border border-blue-200">
                  <div className="text-base">🔬</div>
                  <div className="text-[11px] font-black text-blue-900">2. Luyện tập</div>
                  <div className="text-[9px] text-blue-700 font-semibold">Mô phỏng tương tác</div>
                </div>
                <div className="p-2 rounded-xl bg-purple-100/70 border border-purple-200">
                  <div className="text-base">💡</div>
                  <div className="text-[11px] font-black text-purple-900">3. Vận dụng</div>
                  <div className="text-[9px] text-purple-700 font-semibold">Giải quyết bài toán</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-100/70 border border-emerald-200">
                  <div className="text-base">🤖</div>
                  <div className="text-[11px] font-black text-emerald-900">4. Giảng lại</div>
                  <div className="text-[9px] text-emerald-700 font-semibold">Socratic AI</div>
                </div>
              </div>
            </div>

            {/* Companion Ant & XP Reward Banner */}
            <div className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs">
                  {ALLIES[selectedLesson.allyId]?.icon || '🐜'}
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-stone-500">Đồng hành cùng bạn</div>
                  <div className="text-xs font-black text-stone-900">
                    {ALLIES[selectedLesson.allyId]?.name || 'Bạn Kiến'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] font-semibold text-stone-500">Phần thưởng</div>
                <div className="text-base font-black text-amber-700 flex items-center justify-end gap-1">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>+{selectedLesson.xpReward} XP</span>
                </div>
              </div>
            </div>

            {/* 3D Action Launch Button */}
            <button
              id="launch-lesson-3d-button"
              onClick={() => {
                audioService.playSuccess();
                const target = selectedLesson;
                setSelectedLesson(null);
                onStartLesson(target);
              }}
              className="w-full py-4 text-white font-black text-base sm:text-lg btn-ant-3d-green flex items-center justify-center gap-2 shadow-lg"
            >
              <span>CHINH PHỤC CÙNG BẠN KIẾN</span>
              <span className="text-xl">🐜 ➔</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Riddle Chest Quick Modal Fallback */}
      {showRiddleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border-2 border-amber-300 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center text-4xl mx-auto shadow-inner">
              🎁
            </div>
            <h3 className="text-xl font-black text-stone-900">Rương Hạt Đường Của Vương Quốc!</h3>
            <p className="text-xs text-stone-600 font-semibold">
              Chúc mừng bạn đã đào tổ tới trạm bí ẩn! Tặng bạn 50 Hạt Đường Năng Lượng (XP) để tiếp sức trên đường mòn!
            </p>
            <div className="text-2xl font-black text-amber-600 flex items-center justify-center gap-1">
              <Sparkles className="w-6 h-6" />
              <span>+50 XP</span>
            </div>
            <button
              onClick={() => {
                audioService.playCelebrationBurst();
                fireSmallConfetti();
                setShowRiddleModal(false);
                setRiddleClaimed(true);
              }}
              className="w-full py-3.5 rounded-2xl text-white font-black text-sm btn-ant-3d-amber"
            >
              NHẬN HẠT ĐƯỜNG 🍯
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
