import React, { useState, useEffect } from 'react';
import {
  MATH_REVIEW_TOPICS,
  MATH_RIDDLES,
  MATH_STORIES,
  ARENA_QUESTIONS,
} from '../../data/grade5MathExamData';
import { MathTopicReview, MathRiddle, MathStory } from '../../types/mathExam';
import { audioService } from '../../services/audioService';
import { fireGrandCelebration, fireSmallConfetti } from '../../utils/confettiHelper';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Trophy,
  Zap,
  Sparkles,
  Timer,
  ChevronRight,
  Flame,
  Award,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  RotateCcw,
  Star,
  Check,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { DragScrollContainer } from '../DragScrollContainer';

interface Grade5MathReviewHubProps {
  onEarnXP?: (xp: number) => void;
  onBackToRoadmap?: () => void;
  initialTab?: ActiveTab;
}

type ActiveTab = 'arena' | 'stories' | 'riddles' | 'review';

export const Grade5MathReviewHub: React.FC<Grade5MathReviewHubProps> = ({
  onEarnXP,
  onBackToRoadmap,
  initialTab = 'arena',
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Topic Review State
  const [selectedTopicId, setSelectedTopicId] = useState<string>(MATH_REVIEW_TOPICS[0].id);

  // Riddles State
  const [selectedRiddleId, setSelectedRiddleId] = useState<string>(MATH_RIDDLES[0].id);
  const [riddleAnswers, setRiddleAnswers] = useState<Record<string, string>>({});
  const [revealedRiddleTips, setRevealedRiddleTips] = useState<Record<string, boolean>>({});

  // Stories State
  const [selectedStoryId, setSelectedStoryId] = useState<string>(MATH_STORIES[0].id);
  const [storyAnswers, setStoryAnswers] = useState<Record<string, string>>({});

  // Arena Speed Run State
  const [arenaActive, setArenaActive] = useState<boolean>(false);
  const [arenaIndex, setArenaIndex] = useState<number>(0);
  const [arenaScore, setArenaScore] = useState<number>(0);
  const [arenaStreak, setArenaStreak] = useState<number>(0);
  const [arenaTimeLeft, setArenaTimeLeft] = useState<number>(60);
  const [arenaFeedback, setArenaFeedback] = useState<{ correct: boolean; text: string } | null>(null);

  // Timer for Arena
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (arenaActive && arenaTimeLeft > 0) {
      timer = setInterval(() => {
        setArenaTimeLeft((prev) => {
          if (prev <= 1) {
            audioService.playLevelUp();
            setArenaActive(false);
            if (onEarnXP) onEarnXP(arenaScore * 10);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [arenaActive, arenaTimeLeft, arenaScore, onEarnXP]);

  const currentTopic = MATH_REVIEW_TOPICS.find((t) => t.id === selectedTopicId) || MATH_REVIEW_TOPICS[0];
  const currentRiddle = MATH_RIDDLES.find((r) => r.id === selectedRiddleId) || MATH_RIDDLES[0];
  const currentStory = MATH_STORIES.find((s) => s.id === selectedStoryId) || MATH_STORIES[0];

  // Arena Handlers
  const handleStartArena = () => {
    audioService.playBoingPop();
    setArenaActive(true);
    setArenaIndex(0);
    setArenaScore(0);
    setArenaStreak(0);
    setArenaTimeLeft(60);
    setArenaFeedback(null);
  };

  const handleArenaAnswer = (isCorrect: boolean) => {
    if (isCorrect) {
      const newStreak = arenaStreak + 1;
      setArenaStreak(newStreak);
      setArenaScore((prev) => prev + 10 + (newStreak >= 3 ? 5 : 0));
      setArenaFeedback({ correct: true, text: 'Chính xác! +10 XP ⭐' });

      if (newStreak >= 3) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
      } else {
        audioService.playSuccess();
        fireSmallConfetti();
      }
    } else {
      audioService.playHintChime();
      setArenaStreak(0);
      setArenaFeedback({ correct: false, text: 'Chưa đúng, thử câu tiếp nhé!' });
    }

    setTimeout(() => {
      setArenaFeedback(null);
      if (arenaIndex + 1 < ARENA_QUESTIONS.length) {
        setArenaIndex((prev) => prev + 1);
      } else {
        setArenaIndex(0); // Loop or wrap
      }
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-15 text-9xl select-none pointer-events-none">
          📐
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hệ Thống Ôn Luyện & Đấu Trường Toán 5
            </h1>
            <p className="text-xs sm:text-sm text-amber-100/90 leading-relaxed">
              Tập hợp trọn vẹn kiến thức số thập phân, 4 phép tính, đơn vị đo, tỉ số phần trăm và hình học. Cùng Kiến
              Con vượt qua mọi dạng bài hóc búa nhất!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onBackToRoadmap && (
              <button
                onClick={onBackToRoadmap}
                className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs transition-colors border border-white/30"
              >
                ← Quay lại Bài học
              </button>
            )}
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('arena');
              }}
              className="px-5 py-2.5 rounded-2xl bg-white text-amber-900 font-extrabold text-xs shadow-md hover:bg-amber-50 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              Đấu Trường Tốc Độ 60s
            </button>
          </div>
        </div>
      </div>

      {/* Main Feature Tabs Navigation */}
      {/* Mobile View (< sm): DragScrollContainer */}
      <div className="block sm:hidden">
        <DragScrollContainer
          id="math-hub-main-tabs"
          fadeColorClass="from-stone-50"
          className="pb-1"
        >
          <div className="flex items-center gap-2 pb-1 px-1">
            {/* 0. Học theo bài (như sách giáo khoa) */}
            {onBackToRoadmap && (
              <button
                id="tab-back-roadmap-btn-mobile"
                onClick={() => {
                  audioService.playClick();
                  onBackToRoadmap();
                }}
                className="px-4 py-3 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 text-amber-950 border-2 border-amber-300 hover:brightness-105 active:scale-95 transition-all shadow-xs"
                title="Quay lại danh sách bài học theo tuần của sách giáo khoa"
              >
                <span className="text-base">🚀</span>
                <span>Khởi động</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold">Theo bài 📖</span>
              </button>
            )}

            {/* 1. Đấu trường 60s */}
            <button
              id="tab-arena-btn-mobile"
              onClick={() => {
                audioService.playClick();
                setActiveTab('arena');
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 ${
                activeTab === 'arena'
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-b-3 border-orange-700 scale-102'
                  : 'bg-white hover:bg-orange-50/50 text-stone-700 border-2 border-orange-200/80'
              }`}
            >
              <Flame className={`w-4 h-4 ${activeTab === 'arena' ? 'text-yellow-200 fill-yellow-300' : 'text-orange-500 fill-orange-400'}`} />
              <span>Đấu trường 60s</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'arena' ? 'bg-white/20' : 'bg-orange-100 text-orange-800'}`}>Tốc độ ⚡</span>
            </button>

            {/* 2. Kiến kể chuyện */}
            <button
              id="tab-stories-btn-mobile"
              onClick={() => {
                audioService.playClick();
                setActiveTab('stories');
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 ${
                activeTab === 'stories'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md border-b-3 border-amber-700 scale-102'
                  : 'bg-white hover:bg-amber-50/50 text-stone-700 border-2 border-amber-200/80'
              }`}
            >
              <span className="text-base">🐜</span>
              <span>Kiến kể chuyện</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'stories' ? 'bg-white/30 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>Ghi nhớ 💡</span>
            </button>

            {/* 3. Kiến đố vui */}
            <button
              id="tab-riddles-btn-mobile"
              onClick={() => {
                audioService.playClick();
                setActiveTab('riddles');
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 ${
                activeTab === 'riddles'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-b-3 border-amber-700 scale-102'
                  : 'bg-white hover:bg-yellow-50/50 text-stone-700 border-2 border-yellow-200/80'
              }`}
            >
              <Star className={`w-4 h-4 ${activeTab === 'riddles' ? 'text-yellow-200 fill-yellow-200' : 'text-amber-500 fill-amber-400'}`} />
              <span>Kiến đố vui</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'riddles' ? 'bg-white/20' : 'bg-yellow-100 text-amber-900'}`}>Sao tinh anh ⭐</span>
            </button>

            {/* 4. Kiến luyện võ */}
            <button
              id="tab-review-btn-mobile"
              onClick={() => {
                audioService.playClick();
                setActiveTab('review');
              }}
              className={`px-5 py-3 rounded-2xl font-black text-xs flex items-center gap-2 whitespace-nowrap transition-all active:scale-95 ${
                activeTab === 'review'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border-b-3 border-emerald-800 scale-102'
                  : 'bg-white hover:bg-emerald-50/50 text-stone-700 border-2 border-emerald-200/80'
              }`}
            >
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Kiến luyện võ</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${activeTab === 'review' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>Bí kíp 🥋</span>
            </button>
          </div>
        </DragScrollContainer>
      </div>

      {/* Tablet & Desktop View (sm+): Balanced, non-scrolling responsive grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2.5 w-full">
        {/* 0. Học theo bài */}
        {onBackToRoadmap && (
          <button
            id="tab-back-roadmap-btn"
            onClick={() => {
              audioService.playClick();
              onBackToRoadmap();
            }}
            className="w-full px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 bg-gradient-to-r from-amber-100 via-orange-100 to-amber-100 text-amber-950 border-2 border-amber-300 hover:brightness-105 active:scale-95 transition-all shadow-xs"
            title="Quay lại danh sách bài học theo tuần của sách giáo khoa"
          >
            <span className="text-base shrink-0">🚀</span>
            <span className="whitespace-nowrap">Khởi động</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-extrabold whitespace-nowrap">Theo bài 📖</span>
          </button>
        )}

        {/* 1. Đấu trường 60s */}
        <button
          id="tab-arena-btn"
          onClick={() => {
            audioService.playClick();
            setActiveTab('arena');
          }}
          className={`w-full px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'arena'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-b-3 border-orange-700 scale-102'
              : 'bg-white hover:bg-orange-50/50 text-stone-700 border-2 border-orange-200/80'
          }`}
        >
          <Flame className={`w-4 h-4 shrink-0 ${activeTab === 'arena' ? 'text-yellow-200 fill-yellow-300' : 'text-orange-500 fill-orange-400'}`} />
          <span className="whitespace-nowrap">Đấu trường 60s</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${activeTab === 'arena' ? 'bg-white/20' : 'bg-orange-100 text-orange-800'}`}>Tốc độ ⚡</span>
        </button>

        {/* 2. Kiến kể chuyện */}
        <button
          id="tab-stories-btn"
          onClick={() => {
            audioService.playClick();
            setActiveTab('stories');
          }}
          className={`w-full px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'stories'
              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md border-b-3 border-amber-700 scale-102'
              : 'bg-white hover:bg-amber-50/50 text-stone-700 border-2 border-amber-200/80'
          }`}
        >
          <span className="text-base shrink-0">🐜</span>
          <span className="whitespace-nowrap">Kiến kể chuyện</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${activeTab === 'stories' ? 'bg-white/30 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>Ghi nhớ 💡</span>
        </button>

        {/* 3. Kiến đố vui */}
        <button
          id="tab-riddles-btn"
          onClick={() => {
            audioService.playClick();
            setActiveTab('riddles');
          }}
          className={`w-full px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'riddles'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-b-3 border-amber-700 scale-102'
              : 'bg-white hover:bg-yellow-50/50 text-stone-700 border-2 border-yellow-200/80'
          }`}
        >
          <Star className={`w-4 h-4 shrink-0 ${activeTab === 'riddles' ? 'text-yellow-200 fill-yellow-200' : 'text-amber-500 fill-amber-400'}`} />
          <span className="whitespace-nowrap">Kiến đố vui</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${activeTab === 'riddles' ? 'bg-white/20' : 'bg-yellow-100 text-amber-900'}`}>Sao tinh anh ⭐</span>
        </button>

        {/* 4. Kiến luyện võ */}
        <button
          id="tab-review-btn"
          onClick={() => {
            audioService.playClick();
            setActiveTab('review');
          }}
          className={`w-full px-3.5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 ${
            activeTab === 'review'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border-b-3 border-emerald-800 scale-102'
              : 'bg-white hover:bg-emerald-50/50 text-stone-700 border-2 border-emerald-200/80'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="whitespace-nowrap">Kiến luyện võ</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${activeTab === 'review' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>Bí kíp 🥋</span>
        </button>
      </div>


      {/* ========================================================= */}
      {/* TAB 2: CẨM NANG 5 CHUYÊN ĐỀ ÔN TẬP (TOPIC REVIEW) */}
      {/* ========================================================= */}
      {activeTab === 'review' && (
        <div className="space-y-6">
          {/* Mobile Swipeable Topic Cards */}
          <div className="sm:hidden">
            <DragScrollContainer
              id="mobile-review-topics"
              fadeColorClass="from-stone-50"
            >
              <div className="flex items-center gap-2.5 pb-2 px-1">
                {MATH_REVIEW_TOPICS.map((topic) => {
                  const isSelected = topic.id === selectedTopicId;
                  return (
                    <button
                      key={topic.id}
                      id={`mobile-topic-${topic.id}`}
                      onClick={() => {
                        audioService.playClick();
                        setSelectedTopicId(topic.id);
                      }}
                      className={`flex-shrink-0 w-44 p-3.5 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50 shadow-xs'
                          : 'border-stone-200 bg-white'
                      }`}
                    >
                      <div className="text-2xl mb-1">{topic.icon}</div>
                      <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                        {topic.badge}
                      </div>
                      <div className="font-extrabold text-xs text-stone-900 mt-0.5 line-clamp-1">
                        {topic.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </DragScrollContainer>
          </div>

          {/* Desktop Topic Grid */}
          <div className="hidden sm:grid sm:grid-cols-5 gap-3">
            {MATH_REVIEW_TOPICS.map((topic) => {
              const isSelected = topic.id === selectedTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    audioService.playClick();
                    setSelectedTopicId(topic.id);
                  }}
                  className={`p-4 rounded-3xl border text-left transition-all ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="text-2xl mb-1.5">{topic.icon}</div>
                  <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                    {topic.badge}
                  </div>
                  <div className="font-extrabold text-xs sm:text-sm text-stone-900 mt-0.5 line-clamp-1">
                    {topic.title}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Topic Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            <div className="space-y-2 border-b border-stone-100 pb-5">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold">
                  {currentTopic.badge}
                </span>
                <span className="text-xs text-stone-500 font-semibold">Ôn tập trọng tâm thi học kì 1</span>
              </div>
              <h2 className="text-2xl font-black text-stone-900 flex items-center gap-2">
                <span>{currentTopic.icon}</span>
                <span>{currentTopic.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl">
                {currentTopic.summary}
              </p>
            </div>

            {/* Core Rules & Formula Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currentTopic.rules.map((rule, idx) => (
                <div
                  key={idx}
                  className="bg-stone-50/90 rounded-2xl p-5 border border-stone-200/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-black text-stone-900">
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[11px]">
                        {idx + 1}
                      </span>
                      <span>{rule.title}</span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{rule.content}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-stone-200/60">
                    <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                      <strong>Ví dụ:</strong> {rule.example}
                    </div>
                    <div className="text-[11px] font-semibold text-rose-800 bg-rose-50 p-2 rounded-xl border border-rose-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Bẫy thường gặp:</strong> {rule.trapAlert}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Exemplary Exam Problems */}
            <div className="space-y-3 pt-4 border-t border-stone-100">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Bài toán điển hình trọng tâm:</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentTopic.sampleExamProblems.map((sample, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {sample.source}
                      </span>
                      <span className="text-stone-500 font-semibold">Bài mẫu chuẩn</span>
                    </div>
                    <p className="text-xs font-bold text-stone-900 leading-relaxed">{sample.problem}</p>
                    <div className="text-xs text-stone-700 bg-white p-3 rounded-xl border border-stone-200/80 leading-relaxed">
                      <strong>Lời giải:</strong> {sample.solution}
                    </div>
                    <div className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                      <span>💡 Bí kíp:</span>
                      <span>{sample.keyTakeaway}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: GÓC ĐỐ VUI & TOÁN SAO (*) (MATH RIDDLES) */}
      {/* ========================================================= */}
      {activeTab === 'riddles' && (
        <div className="space-y-4">
          {/* Mobile Quick Riddles Carousel */}
          <div className="lg:hidden bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>⭐</span>
                <span>Chọn Câu Đố Tư Duy:</span>
              </span>
            </div>
            <DragScrollContainer
              id="mobile-riddles-strip"
              fadeColorClass="from-white"
            >
              <div className="flex items-center gap-2 pb-1 px-0.5">
                {MATH_RIDDLES.map((riddle) => {
                  const isSelected = riddle.id === selectedRiddleId;
                  const isAnswered = riddleAnswers[riddle.id] !== undefined;

                  return (
                    <button
                      key={riddle.id}
                      onClick={() => {
                        audioService.playClick();
                        setSelectedRiddleId(riddle.id);
                      }}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white border-b-2 border-amber-700 shadow-sm scale-105'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                      <span className="max-w-[120px] truncate">{riddle.title}</span>
                      {isAnswered && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </DragScrollContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desktop Riddle List */}
            <div className="hidden lg:block lg:col-span-1 space-y-3">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Tuyển tập câu đố tư duy
                </span>

                <div className="space-y-2 max-h-[500px] overflow-y-auto soft-scrollbar pr-1">
                  {MATH_RIDDLES.map((riddle) => {
                    const isSelected = riddle.id === selectedRiddleId;
                    const isAnswered = riddleAnswers[riddle.id] !== undefined;

                    return (
                      <button
                        key={riddle.id}
                        onClick={() => {
                          audioService.playClick();
                          setSelectedRiddleId(riddle.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-xs'
                            : 'border-stone-100 hover:bg-stone-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                            <span className="font-extrabold text-xs text-stone-900">{riddle.title}</span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1">{riddle.sourceExam}</p>
                        </div>

                        {isAnswered && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          {/* Active Riddle Presentation */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                    {currentRiddle.badge}
                  </span>
                  <span className="text-xs font-bold text-stone-500">{currentRiddle.sourceExam}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">{currentRiddle.title}</h2>
              </div>

              {/* Story Intro */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs sm:text-sm text-stone-800 leading-relaxed flex items-start gap-3">
                <span className="text-2xl">🐜</span>
                <p className="italic font-medium">{currentRiddle.story}</p>
              </div>

              {/* Question */}
              <div className="space-y-3">
                <h4 className="font-black text-base text-stone-900">{currentRiddle.question}</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentRiddle.options.map((opt) => {
                    const isSelected = riddleAnswers[currentRiddle.id] === opt.id;
                    const hasAnswered = riddleAnswers[currentRiddle.id] !== undefined;

                    let btnStyle = 'border-stone-200 hover:bg-stone-50';
                    if (hasAnswered) {
                      if (opt.isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={hasAnswered}
                        onClick={() => {
                          setRiddleAnswers((prev) => ({ ...prev, [currentRiddle.id]: opt.id }));
                          if (opt.isCorrect) {
                            audioService.playCelebrationBurst();
                            fireGrandCelebration();
                            if (onEarnXP) onEarnXP(30);
                          } else {
                            audioService.playBoingPop();
                            audioService.playHintChime();
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-black text-sm sm:text-base transition-all flex items-center justify-between active:translate-y-1 ${btnStyle}`}
                      >
                        <span>{opt.text}</span>
                        {hasAnswered && opt.isCorrect && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {hasAnswered && isSelected && !opt.isCorrect && (
                          <X className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tip & Explanation */}
              {riddleAnswers[currentRiddle.id] !== undefined && (
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2 animate-fadeIn">
                  <div className="font-extrabold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Kiến Con giải thích cặn kẽ:</span>
                  </div>
                  <p className="text-stone-700 leading-relaxed whitespace-pre-line">
                    {currentRiddle.answerExplanation}
                  </p>
                  <div className="pt-2 border-t border-stone-200 text-amber-800 font-bold">
                    💡 Bí kíp tư duy: {currentRiddle.antTip}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )}

      {/* ========================================================= */}
      {/* TAB 4: THI ĐUA ĐẤU TRƯỜNG KIẾN (ARENA SPEED RUN) */}
      {/* ========================================================= */}
      {activeTab === 'arena' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
          {!arenaActive ? (
            <div className="text-center py-10 max-w-xl mx-auto space-y-5">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-3xl mx-auto shadow-md animate-pulse">
                ⚡
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-stone-900">Đấu Trường Toán Học Tốc Độ 60 Giây</h2>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Thử thách phản xạ nhanh với các câu hỏi trắc nghiệm rút ra từ ngân hàng câu hỏi trọng tâm HK1. Giữ chuỗi
                  thắng (streak) để nhân đôi điểm XP!
                </p>
              </div>

              <div className="flex justify-center gap-4 py-2">
                <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                  ⏱️ 60 Giây
                </div>
                <div className="px-4 py-2 rounded-2xl bg-orange-50 border border-orange-200 text-xs font-bold text-orange-900">
                  🔥 Chuỗi Thắng Combo
                </div>
                <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                  🏆 Thưởng XP Khủng
                </div>
              </div>

              <button
                onClick={handleStartArena}
                className="px-8 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-black text-sm shadow-md transition-all transform hover:scale-105"
              >
                Bắt Đầu Thi Đua Ngay!
              </button>
            </div>
          ) : (
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Arena Header: Timer & Score */}
              <div className="flex items-center justify-between bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-amber-600" />
                  <span className="font-black text-lg text-stone-900">{arenaTimeLeft}s</span>
                </div>

                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
                  <span className="font-extrabold text-sm text-orange-700">Streak: {arenaStreak}</span>
                </div>

                <div className="flex items-center gap-1.5 font-black text-lg text-emerald-700">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>{arenaScore} điểm</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(arenaTimeLeft / 60) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div className="p-6 rounded-3xl border border-stone-200 space-y-4 text-center">
                <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-[11px] font-extrabold uppercase">
                  {ARENA_QUESTIONS[arenaIndex].category}
                </span>

                <h3 className="font-black text-lg sm:text-xl text-stone-900">
                  {ARENA_QUESTIONS[arenaIndex].question}
                </h3>

                {arenaFeedback && (
                  <div
                    className={`py-2 px-4 rounded-xl text-xs font-black animate-fadeIn ${
                      arenaFeedback.correct
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {arenaFeedback.text}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {ARENA_QUESTIONS[arenaIndex].options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleArenaAnswer(opt.isCorrect)}
                      className="p-4 rounded-2xl border border-stone-200 hover:border-amber-500 hover:bg-amber-50 text-sm font-bold text-stone-800 transition-all flex items-center justify-center"
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: KỂ CHUYỆN TOÁN HỌC (MATH STORIES) */}
      {/* ========================================================= */}
      {activeTab === 'stories' && (
        <div className="space-y-4">
          {/* Mobile Quick Stories Carousel */}
          <div className="lg:hidden bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-black text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>🐜</span>
                <span>Chọn Truyện Toán:</span>
              </span>
            </div>
            <DragScrollContainer
              id="mobile-stories-strip"
              fadeColorClass="from-white"
            >
              <div className="flex items-center gap-2 pb-1 px-0.5">
                {MATH_STORIES.map((story) => {
                  const isSelected = story.id === selectedStoryId;
                  const isDone = storyAnswers[story.id] !== undefined;

                  return (
                    <button
                      key={story.id}
                      onClick={() => {
                        audioService.playClick();
                        setSelectedStoryId(story.id);
                      }}
                      className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500 text-white border-b-2 border-amber-700 shadow-sm scale-105'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      <span>🐜</span>
                      <span className="max-w-[130px] truncate">{story.title}</span>
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                  );
                })}
              </div>
            </DragScrollContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Desktop Story List */}
            <div className="hidden lg:block lg:col-span-1 space-y-3">
              <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-3">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Truyện Toán Vương Quốc Kiến
                </span>

                <div className="space-y-2 max-h-[500px] overflow-y-auto soft-scrollbar pr-1">
                  {MATH_STORIES.map((story) => {
                    const isSelected = story.id === selectedStoryId;
                    const isDone = storyAnswers[story.id] !== undefined;

                    return (
                      <button
                        key={story.id}
                        onClick={() => {
                          audioService.playClick();
                          setSelectedStoryId(story.id);
                        }}
                        className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-xs'
                            : 'border-stone-100 hover:bg-stone-50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="font-extrabold text-xs text-stone-900 line-clamp-1">{story.title}</span>
                          <p className="text-[11px] text-stone-500">Nhân vật: {story.antHero}</p>
                        </div>

                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          {/* Active Story Reader */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="space-y-2 border-b border-stone-100 pb-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-extrabold uppercase">
                    {currentStory.badge}
                  </span>
                  <span className="text-xs text-stone-500 font-semibold">{currentStory.sourceExam}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-stone-900">{currentStory.title}</h2>
                <div className="text-xs font-semibold text-amber-800">
                  Nhân vật đồng hành: <strong>{currentStory.antHero}</strong> ({currentStory.antRole})
                </div>
              </div>

              {/* Story Narrative Chapters */}
              <div className="space-y-3.5 text-xs sm:text-sm text-stone-700 leading-relaxed">
                {currentStory.plot.map((paragraph, idx) => (
                  <p key={idx} className="bg-stone-50/70 p-4 rounded-2xl border border-stone-100">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Math Challenge inside story */}
              <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-4">
                <div className="font-black text-sm sm:text-base text-amber-950 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Thử thách cứu nguy Vương Quốc Kiến:</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-stone-900">
                  {currentStory.mathChallenge.question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {currentStory.mathChallenge.options.map((opt) => {
                    const isSelected = storyAnswers[currentStory.id] === opt.id;
                    const isAnswered = storyAnswers[currentStory.id] !== undefined;

                    let btnStyle = 'border-amber-200 bg-white hover:bg-amber-50';
                    if (isAnswered) {
                      if (opt.isCorrect) {
                        btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'border-rose-400 bg-rose-50 text-rose-950';
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={isAnswered}
                        onClick={() => {
                          setStoryAnswers((prev) => ({ ...prev, [currentStory.id]: opt.id }));
                          if (opt.isCorrect) {
                            audioService.playCelebrationBurst();
                            fireGrandCelebration();
                            if (onEarnXP) onEarnXP(25);
                          } else {
                            audioService.playBoingPop();
                            audioService.playHintChime();
                          }
                        }}
                        className={`p-4 rounded-2xl border-2 text-left font-black text-sm sm:text-base transition-all flex items-center justify-between active:translate-y-1 ${btnStyle}`}
                      >
                        <span>{opt.text}</span>
                        {isAnswered && opt.isCorrect && <Check className="w-5 h-5 text-emerald-600 shrink-0" />}
                        {isAnswered && isSelected && !opt.isCorrect && (
                          <X className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {storyAnswers[currentStory.id] !== undefined && (
                  <div className="mt-4 pt-4 border-t border-amber-200 text-xs space-y-2 animate-fadeIn">
                    <div className="font-bold text-amber-950">Giải pháp của {currentStory.antHero}:</div>
                    <p className="text-stone-800 leading-relaxed">{currentStory.mathChallenge.solution}</p>
                    <div className="p-3 bg-white rounded-xl border border-amber-200 font-semibold text-amber-900 mt-2">
                      🌿 Bài học cuộc sống: {currentStory.lifeLesson}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    </div>
  );
};
