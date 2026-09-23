import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeLevel, UserProfile, Subject, Lesson, DailyQuest, KHTNDomain } from './types';
import { userService } from './services/userService';
import { curriculumService } from './services/curriculumService';
import { questService } from './services/questService';
import { audioService } from './services/audioService';
import { Header } from './components/Header';
import { SubjectNav } from './components/SubjectNav';
import { LessonListView } from './components/LessonListView';
import { LessonPlayer } from './components/LessonPlayer/LessonPlayer';
import { DailyQuestsModal } from './components/DailyQuestsModal';
import { AllyShowcaseModal } from './components/AllyShowcaseModal';
import { MasteryDashboardModal } from './components/MasteryDashboardModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { AuthModal } from './components/AuthModal';
import { AdminCPPage } from './components/AdminCP/AdminCPPage';
import { authService } from './services/authService';
import { Grade5MathReviewHub } from './components/Grade5MathReview/Grade5MathReviewHub';
import { DragScrollContainer } from './components/DragScrollContainer';
import { fireButtonParticleBurst, fireMiniBurst } from './utils/confettiHelper';
import { INITIAL_USER_GRADE_5, INITIAL_USER_GRADE_8 } from './data/mockData';
import { Sparkles, Compass, ShieldCheck, Heart, BookOpen, Trophy, Flame, Star, Award, Zap, UserPlus, LogIn } from 'lucide-react';

const checkIsAdminCP = () => {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  return path.includes('admincp') || hash.includes('admincp');
};

export default function App() {
  const [isAdminCP, setIsAdminCP] = useState<boolean>(checkIsAdminCP);
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(5);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('toan_5');
  const [selectedDomain, setSelectedDomain] = useState<KHTNDomain>('vat_li');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Grade 5 Math Sub-View: 'exam_hub' or 'lessons'
  const [grade5MathView, setGrade5MathView] = useState<'lessons' | 'exam_hub'>('lessons');
  const [mathHubTab, setMathHubTab] = useState<'arena' | 'stories' | 'riddles' | 'review'>('arena');

  // Modals
  const [questsModalOpen, setQuestsModalOpen] = useState<boolean>(false);
  const [alliesModalOpen, setAlliesModalOpen] = useState<boolean>(false);
  const [masteryModalOpen, setMasteryModalOpen] = useState<boolean>(false);
  const [leaderboardModalOpen, setLeaderboardModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [debugModalOpen, setDebugModalOpen] = useState<boolean>(false);

  // Account Authentication Modal & Toast - Bắt buộc đăng ký/đăng nhập mới được sử dụng ứng dụng
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(() => !authService.isAuthenticated());
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'verification_pending' | 'signout_confirm'>('signup');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(authService.isAuthenticated());
  const [authNotificationToast, setAuthNotificationToast] = useState<string | null>(() =>
    authService.isAuthenticated() ? null : 'Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.'
  );

  // Sync /admincp route
  useEffect(() => {
    const handleUrlChange = () => {
      setIsAdminCP(checkIsAdminCP());
    };
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  // Listen to session changes
  useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      const authed = !!session;
      setIsAuthenticated(authed);
      if (!authed) {
        setAuthModalOpen(true);
      }
    });
    return () => unsubscribe();
  }, []);

  // ============================================================================
  // MỖI LẦN ỨNG DỤNG RELOAD: Kiểm tra và load thông tin user từ Supabase (ưu tiên Supabase)
  // ============================================================================
  // MỖI LẦN ỨNG DỤNG RELOAD / MỞ LINK EMAIL:
  // 1. Kiểm tra tham số ?verify_email=...&code=... để tự động xác thực và đăng nhập ngay
  // 2. Kiểm tra và load thông tin user từ Supabase (ưu tiên Supabase)
  // ============================================================================
  useEffect(() => {
    let isMounted = true;

    async function handleInitAndVerification() {
      // 1. Kiểm tra tham số xác thực email từ liên kết trong email
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const verifyEmailParam = urlParams.get('verify_email');
        const verifyCodeParam = urlParams.get('code');

        if (verifyEmailParam && verifyCodeParam) {
          const verifyResult = await authService.verifyEmail(verifyEmailParam, verifyCodeParam);
          if (verifyResult.success && verifyResult.user && isMounted) {
            handleAuthSuccess(
              verifyResult.user,
              `🎉 Kích hoạt tài khoản thành công qua liên kết email! Chào mừng ${verifyResult.user.nickname || verifyResult.user.name} (+250 XP)!`
            );
            // Làm sạch URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } else if (verifyResult.alreadyVerified && verifyResult.user && isMounted) {
            setUser(verifyResult.user);
            setIsAuthenticated(true);
            setAuthNotificationToast('ℹ️ Tài khoản của bạn đã được xác minh trước đó rồi! Chào mừng bạn quay lại.');
            window.history.replaceState({}, document.title, window.location.pathname);
            return;
          } else if (isMounted) {
            // Mở modal xác thực trực tiếp để học sinh kiểm tra và bấm xác nhận
            setAuthModalMode('verification_pending');
            setAuthModalOpen(true);
          }
        }
      } catch (linkErr) {
        console.warn('Lỗi xử lý liên kết xác thực email:', linkErr);
      }

      // 2. Nếu không có link xác thực, kiểm tra phiên đăng nhập từ Supabase
      try {
        const syncedUser = await authService.fetchCurrentUserFromSupabase();
        if (syncedUser && isMounted) {
          setUser(syncedUser);
          setIsAuthenticated(true);
          setAuthNotificationToast(null);
          if (syncedUser.grade) {
            setCurrentGrade(syncedUser.grade);
          }
        } else if (isMounted && !authService.isAuthenticated()) {
          setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
        }
      } catch (err) {
        console.warn('Lỗi kiểm tra user từ Supabase khi reload:', err);
        if (isMounted && !authService.isAuthenticated()) {
          setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
        }
      }
    }

    handleInitAndVerification();

    return () => {
      isMounted = false;
    };
  }, []);

  // Lắng nghe thay đổi trạng thái phiên đăng nhập (đồng bộ thời gian thực đa tab / Cross-tab Sync)
  useEffect(() => {
    const unsubscribe = authService.subscribe((session) => {
      if (!session) {
        // Tab khác hoặc tab này vừa đăng xuất: lập tức đăng xuất đồng thời
        setIsAuthenticated(false);
        setAuthModalMode('signup');
        setAuthModalOpen(true);
        setProfileModalOpen(false);
        setAdminModalOpen(false);
        setActiveLesson(null);
        setLeaderboardModalOpen(false);
        setMasteryModalOpen(false);
        setAlliesModalOpen(false);
        setQuestsModalOpen(false);
        setAuthNotificationToast('Tài khoản đã đăng xuất. Vui lòng đăng ký / đăng nhập để tiếp tục.');
        const defaultUser = currentGrade === 8 ? { ...INITIAL_USER_GRADE_8 } : { ...INITIAL_USER_GRADE_5 };
        setUser(defaultUser);
      } else {
        // Đồng bộ trạng thái đăng nhập từ tab khác
        setIsAuthenticated(true);
        if (session.grade && session.grade !== currentGrade) {
          setCurrentGrade(session.grade);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentGrade]);

  const handleOpenAuth = (mode: 'signin' | 'signup' | 'signout_confirm' = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleAuthSuccess = (authUser: UserProfile, message?: string) => {
    setUser(authUser);
    setIsAuthenticated(true);
    if (authUser.grade && authUser.grade !== currentGrade) {
      setCurrentGrade(authUser.grade);
    }
    // Notification animation announcing welcome message with +250 XP
    setAuthNotificationToast(message || `Chào mừng ${authUser.name} đến với Kiến Học! +250 XP khởi đầu! 🎉`);
    audioService.playCelebrationBurst();
    fireMiniBurst();

    setTimeout(() => {
      setAuthNotificationToast(null);
    }, 5000);
  };

  const handleSignOutSuccess = (defaultUser: UserProfile) => {
    setUser(defaultUser);
    setIsAuthenticated(false);
    setProfileModalOpen(false);
    setAdminModalOpen(false);
    setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
  };

  // Streak & Mastery celebration triggers
  const [isStreakTriggered, setIsStreakTriggered] = useState<boolean>(false);
  const [recentlyCompletedSubjectId, setRecentlyCompletedSubjectId] = useState<string | null>(null);

  // Quests
  const [quests, setQuests] = useState<DailyQuest[]>([]);

  // Periodic 5s attention wiggle state for Ant Universe action buttons
  const [wiggleActive, setWiggleActive] = useState<boolean>(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setWiggleActive(true);
      const timeout = setTimeout(() => {
        setWiggleActive(false);
      }, 750);
      return () => clearTimeout(timeout);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Load user, subjects and quests on grade switch
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      const [profileData, subjectsData, questsData] = await Promise.all([
        userService.getProfile(currentGrade),
        curriculumService.getSubjects(currentGrade),
        questService.getQuests(currentGrade),
      ]);

      if (!isMounted) return;

      setUser(profileData);
      setSubjects(subjectsData);
      setQuests(questsData);

      // Default selected subject
      const defaultSubject = currentGrade === 5 ? 'toan_5' : 'khtn_8';
      setSelectedSubjectId(defaultSubject);
      setSelectedDomain('vat_li');
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentGrade]);

  // Load lessons whenever subject or grade changes
  useEffect(() => {
    let isMounted = true;

    async function loadLessons() {
      const lessonData = await curriculumService.getLessons(currentGrade, selectedSubjectId);
      if (isMounted) {
        setLessons(lessonData);
      }
    }

    if (selectedSubjectId) {
      loadLessons();
    }

    return () => {
      isMounted = false;
    };
  }, [currentGrade, selectedSubjectId]);

  const handleSwitchGrade = (newGrade: GradeLevel) => {
    // Khi đã đăng nhập, hệ thống chỉ hiển thị ra Lớp học đã chọn, các lớp khác cần được ẩn đi
    if (isAuthenticated && user?.grade && newGrade !== user.grade) {
      return;
    }
    if (newGrade === currentGrade) return;
    setCurrentGrade(newGrade);
  };

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleSelectDomain = (domain: KHTNDomain) => {
    setSelectedDomain(domain);
  };

  const handleStartLesson = (lesson: Lesson) => {
    if (!isAuthenticated) {
      audioService.playClick();
      setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
      handleOpenAuth('signup');
      return;
    }
    setActiveLesson(lesson);
  };

  const handleCloseLesson = () => {
    setActiveLesson(null);
  };

  // Called when student finishes all 4 stages of a lesson
  const handleLessonComplete = async (
    lessonId: string,
    subjectId: string,
    xpEarned: number,
    masteryDelta: number
  ) => {
    // Record completion in repository & add XP & update streak
    await userService.recordLessonCompletion(currentGrade, lessonId, subjectId, masteryDelta);
    const updatedUser = await userService.addXP(currentGrade, xpEarned);
    setUser(updatedUser);

    // Advance daily quest
    const targetQuestId = currentGrade === 5 ? 'q_lesson_1' : 'q_physics_8';
    await questService.advanceQuest(currentGrade, targetQuestId, 1);
    const updatedQuests = await questService.getQuests(currentGrade);
    setQuests(updatedQuests);

    // Trigger Daily Streak Fire Animation
    setIsStreakTriggered(true);
    setTimeout(() => {
      setIsStreakTriggered(false);
    }, 3500);

    // Set recently completed subject to trigger sparkle & smooth progress animation
    setRecentlyCompletedSubjectId(subjectId);

    setActiveLesson(null);

    // Open Mastery Dashboard with the smooth fill and sparkle effect!
    setTimeout(() => {
      setMasteryModalOpen(true);
    }, 400);
  };

  const handleEarnExamXP = async (xpEarned: number) => {
    if (user && xpEarned > 0) {
      const updatedUser = await userService.addXP(currentGrade, xpEarned);
      setUser(updatedUser);
      const targetQuestId = currentGrade === 5 ? 'q_lesson_1' : 'q_physics_8';
      await questService.advanceQuest(currentGrade, targetQuestId, 1);
      const updatedQuests = await questService.getQuests(currentGrade);
      setQuests(updatedQuests);
      setIsStreakTriggered(true);
      setTimeout(() => setIsStreakTriggered(false), 3500);
    }
  };

  const handleClaimQuest = async (questId: string) => {
    const claimRes = await questService.claimReward(currentGrade, questId);
    if (claimRes && user) {
      const updatedUser = await userService.addXP(currentGrade, claimRes.xpReward);
      setUser(updatedUser);
      const updatedQuests = await questService.getQuests(currentGrade);
      setQuests(updatedQuests);
      audioService.playSuccess();
    }
  };

  const handleSaveProfile = async (updatedProfile: UserProfile) => {
    await userService.updateProfile(updatedProfile);
    setUser(updatedProfile);
    if (updatedProfile.themeSettings) {
      audioService.setMuted(!updatedProfile.themeSettings.soundEnabled);
      audioService.setVolume(updatedProfile.themeSettings.soundVolume);
    }
  };

  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || null;
  const unclaimedQuestsCount = quests.filter((q) => q.isCompleted && !q.isClaimed).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl animate-bounce mx-auto">
            🐜
          </div>
          <div className="text-sm font-bold text-stone-700">Đang khởi động Kiến Học...</div>
        </div>
      </div>
    );
  }

  if (isAdminCP) {
    return (
      <AdminCPPage
        onBackToApp={() => {
          window.history.pushState({}, '', '/');
          setIsAdminCP(false);
        }}
        lessons={lessons}
        subjects={subjects}
        quests={quests}
        currentUser={user}
        onUpdateLessons={(updated) => setLessons(updated)}
        onUpdateSubjects={(updated) => setSubjects(updated)}
        onUpdateQuests={(updated) => setQuests(updated)}
      />
    );
  }

  const themeMode = user.themeSettings?.mode || 'light';
  const themeBgClass =
    themeMode === 'soft'
      ? 'bg-[#f4f8f5] text-stone-900'
      : themeMode === 'warm'
      ? 'bg-[#faf6f0] text-stone-900'
      : 'bg-stone-50/70 text-stone-900';

  return (
    <div className={`min-h-screen flex flex-col font-sans relative transition-colors duration-300 ${themeBgClass}`}>
      {/* Playful & Soft Decorative Background Doodle Accents (Low opacity, non-distracting) */}
      <div className="fixed inset-0 pointer-events-none select-none overflow-hidden z-0 opacity-15">
        <span className="absolute top-28 left-6 text-3xl">📐</span>
        <span className="absolute top-72 right-10 text-2xl">✨</span>
        <span className="absolute top-1/2 left-3 text-2xl">🐾</span>
        <span className="absolute top-2/3 right-6 text-3xl">🔬</span>
        <span className="absolute bottom-20 left-12 text-2xl">📖</span>
        <span className="absolute bottom-40 right-16 text-2xl">💡</span>
        <span className="absolute top-96 right-1/4 text-xl">🌱</span>
        <span className="absolute top-44 left-1/3 text-xl">➕</span>
        <span className="absolute bottom-72 left-1/4 text-xl">✖️</span>
      </div>

      {/* Sticky App Header */}
      <Header
        user={user}
        onSwitchGrade={handleSwitchGrade}
        onOpenQuests={() => setQuestsModalOpen(true)}
        onOpenAllies={() => setAlliesModalOpen(true)}
        onOpenMastery={() => setMasteryModalOpen(true)}
        onOpenLeaderboard={() => setLeaderboardModalOpen(true)}
        onOpenProfile={() => {
          if (!isAuthenticated) {
            setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
            handleOpenAuth('signup');
            return;
          }
          setProfileModalOpen(true);
        }}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => {
          if (!isAuthenticated) {
            setAuthNotificationToast('Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập.');
            handleOpenAuth('signup');
            return;
          }
          setAdminModalOpen(true);
        }}
        isAuthenticated={isAuthenticated}
        unclaimedQuestsCount={unclaimedQuestsCount}
        isStreakTriggered={isStreakTriggered}
      />

      {/* Main Learning Hub */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Thông báo nhắc nhở tạo tài khoản dành cho người dùng chưa là thành viên */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-4 sm:p-5 border-4 border-amber-300 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in relative overflow-hidden">
            <div className="flex items-center gap-3.5 text-center md:text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shrink-0 shadow-inner border border-white/30">
                🐜
              </div>
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/40 text-amber-200 text-[11px] font-black uppercase tracking-wider">
                  <span>Thông Báo Thành Viên</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-yellow-100">
                  Chào mừng bạn đến với Vương Quốc Kiến Học!
                </h3>
                <p className="text-xs sm:text-sm text-white/95 font-bold leading-relaxed">
                  Người dùng cần đăng ký tạo tài khoản để bắt đầu học tập và lưu trữ toàn bộ tiến độ bài học.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0 justify-end">
              <button
                onClick={() => {
                  audioService.playBoingPop();
                  handleOpenAuth('signup');
                }}
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-2xl bg-white text-amber-950 font-black text-xs sm:text-sm shadow-md hover:bg-amber-50 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-amber-700" />
                <span>Đăng ký</span>
              </button>
              <button
                onClick={() => {
                  audioService.playBoingPop();
                  handleOpenAuth('signin');
                }}
                className="px-4 py-2.5 rounded-2xl bg-black/25 hover:bg-black/35 text-white font-black text-xs sm:text-sm border border-white/30 active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>
        )}

        {/* Ant Universe Greeting & Adaptive Tone Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-300 to-amber-200 rounded-3xl p-5 sm:p-7 border-4 border-amber-300 shadow-lg relative overflow-hidden text-stone-900">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 lg:gap-6 relative z-10">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="shrink-0 text-xs font-black uppercase tracking-wider text-amber-950 bg-white/95 px-3 py-1 rounded-full shadow-xs border border-amber-300">
                  {currentGrade === 5 ? '🎒 Kiến Con Tinh Anh' : '🔬 Kiến Con Khám Phá'}
                </span>
                <span className="shrink-0 text-sm font-black text-amber-950">
                  Chào {user.nickname ? (user.name && user.nickname !== user.name ? `${user.nickname} (${user.name})` : user.nickname) : user.name || 'Bạn Kiến'}! 🌟
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-stone-950 tracking-tight leading-tight">
                {currentGrade === 5
                  ? 'Vương Quốc Kiến: Vui Học Mỗi Ngày! 🐜🎉'
                  : 'Phòng Thí Nghiệm & Tư Duy Khám Phá! 🧪⚡'}
              </h1>
              <p className="text-sm sm:text-base font-bold text-amber-950/85 max-w-3xl leading-snug">
                {currentGrade === 5
                  ? 'Giải đố cùng Kiến Con, rinh thật nhiều XP và thăng hạng vinh quang!'
                  : 'Làm chủ hiện tượng khoa học, thực hành phản biện và bứt phá điểm số.'}
              </p>
            </div>

            {/* Action buttons: Mobile has structured responsive grid; Tablet (sm to xl) has balanced 3-col grid; Desktop (xl+) has a clean flex row */}
            {/* 1. Mobile View (< sm): 2 prominent primary action cards + 1 secondary mastery pill, zero truncation */}
            <div className="block sm:hidden w-full">
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <button
                  id="hero-btn-leaderboard-mobile"
                  onClick={(e) => {
                    audioService.playTinhTong();
                    fireButtonParticleBurst(e);
                    setLeaderboardModalOpen(true);
                  }}
                  className={`w-full py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-black bg-white hover:bg-amber-50 text-amber-950 border-b-4 border-amber-500 shadow-md flex items-center justify-center gap-1.5 active:translate-y-1 active:border-b-0 transition-all whitespace-nowrap btn-hero-wiggle ${
                    wiggleActive ? 'animate-btn-wiggle-active' : ''
                  }`}
                  style={{ animationDelay: '0s' }}
                  title="Bảng Xếp Hạng Học Sinh"
                >
                  <Trophy className="w-4 h-4 text-amber-600 fill-amber-500 animate-wiggle shrink-0" />
                  <span>Đua Top Kiến</span>
                </button>

                <button
                  id="hero-btn-allies-mobile"
                  onClick={(e) => {
                    audioService.playTinhTong();
                    fireButtonParticleBurst(e);
                    setAlliesModalOpen(true);
                  }}
                  className={`w-full py-2.5 px-2 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-4 border-emerald-700 shadow-md flex items-center justify-center gap-1.5 active:translate-y-1 active:border-b-0 transition-all hover:brightness-105 whitespace-nowrap btn-hero-wiggle ${
                    wiggleActive ? 'animate-btn-wiggle-active' : ''
                  }`}
                  style={{ animationDelay: '0.3s' }}
                  title="Biệt Đội Kiến Đồng Hành"
                >
                  <span className="text-base shrink-0">🐜</span>
                  <span>Biệt Đội Kiến</span>
                </button>

                <button
                  id="hero-btn-mastery-mobile"
                  onClick={(e) => {
                    audioService.playTinhTong();
                    fireButtonParticleBurst(e);
                    setMasteryModalOpen(true);
                  }}
                  className={`col-span-2 py-2 px-3 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-b-3 border-purple-800 shadow-sm flex items-center justify-center gap-1.5 active:translate-y-0.5 active:border-b-0 transition-all hover:brightness-105 whitespace-nowrap btn-hero-wiggle ${
                    wiggleActive ? 'animate-btn-wiggle-active' : ''
                  }`}
                  style={{ animationDelay: '0.6s' }}
                  title="Sức Mạnh Của Kiến"
                >
                  <span className="shrink-0 text-sm">⚡</span>
                  <span>Bảng Năng Lực & Kỹ Năng Của Kiến</span>
                </button>
              </div>
            </div>

            {/* 2. Tablet & Desktop View (sm+): Balanced 3-col grid on tablet, sleek horizontal cluster on desktop */}
            <div className="hidden sm:grid sm:grid-cols-3 xl:flex xl:items-center gap-2.5 lg:gap-3.5 w-full xl:w-auto shrink-0">
              <button
                id="hero-btn-leaderboard"
                onClick={(e) => {
                  audioService.playTinhTong();
                  fireButtonParticleBurst(e);
                  setLeaderboardModalOpen(true);
                }}
                className={`px-4 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm lg:text-base font-black bg-white hover:bg-amber-50 text-amber-950 border-b-4 border-amber-500 shadow-md flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all whitespace-nowrap btn-hero-wiggle ${
                  wiggleActive ? 'animate-btn-wiggle-active' : ''
                }`}
                style={{ animationDelay: '0s' }}
                title="Bảng Xếp Hạng Học Sinh"
              >
                <Trophy className="w-5 h-5 text-amber-600 fill-amber-500 animate-wiggle shrink-0" />
                <span>Đua Top Kiến</span>
              </button>

              <button
                id="hero-btn-allies"
                onClick={(e) => {
                  audioService.playTinhTong();
                  fireButtonParticleBurst(e);
                  setAlliesModalOpen(true);
                }}
                className={`px-4 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm lg:text-base font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-b-4 border-emerald-700 shadow-md flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all hover:brightness-105 whitespace-nowrap btn-hero-wiggle ${
                  wiggleActive ? 'animate-btn-wiggle-active' : ''
                }`}
                style={{ animationDelay: '0.3s' }}
                title="Biệt Đội Kiến Đồng Hành"
              >
                <span className="text-lg shrink-0">🐜</span>
                <span>Biệt Đội Kiến</span>
              </button>

              <button
                id="hero-btn-mastery"
                onClick={(e) => {
                  audioService.playTinhTong();
                  fireButtonParticleBurst(e);
                  setMasteryModalOpen(true);
                }}
                className={`px-4 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm lg:text-base font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-b-4 border-purple-800 shadow-md flex items-center justify-center gap-2 active:translate-y-1 active:border-b-0 transition-all hover:brightness-105 whitespace-nowrap btn-hero-wiggle ${
                  wiggleActive ? 'animate-btn-wiggle-active' : ''
                }`}
                style={{ animationDelay: '0.6s' }}
                title="Sức Mạnh Của Kiến"
              >
                <span className="shrink-0">⚡</span>
                <span>Sức Mạnh Của Kiến</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subject Navigation */}
        <SubjectNav
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          onSelectSubject={(subjId) => {
            handleSelectSubject(subjId);
            // Reset view to lessons if switching away from toan_5
            if (subjId !== 'toan_5') {
              setGrade5MathView('lessons');
            }
          }}
          selectedDomain={selectedDomain}
          onSelectDomain={handleSelectDomain}
          grade={currentGrade}
          subjectMastery={user.subjectMastery}
        />

        {/* Structured Learning Path Menu */}
        {currentGrade === 5 && selectedSubjectId === 'toan_5' && (
          <div className="bg-gradient-to-r from-amber-50/90 via-orange-50/80 to-amber-50/90 rounded-3xl p-3 sm:p-4 border-2 border-amber-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-base">🐜</span>
                <span className="text-xs sm:text-sm font-black text-amber-950 uppercase tracking-wide">
                  Kiến học giỏi Toán
                </span>
              </div>
              <span className="text-[11px] font-bold text-amber-800/80 hidden sm:inline">
                Chọn chế độ học rèn luyện tư duy!
              </span>
            </div>

            {/* Mobile View (< sm): DragScrollContainer */}
            <div className="block sm:hidden">
              <DragScrollContainer
                id="math-mode-selector-scroll"
                fadeColorClass="from-amber-50"
                className="w-full"
              >
                <div className="flex items-center gap-2.5 pb-1 px-1 pr-8">
                  {/* 1. Khởi động */}
                  <button
                    id="mode-selector-lessons-mobile"
                    onClick={() => {
                      audioService.playBoingPop();
                      setGrade5MathView('lessons');
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                      grade5MathView === 'lessons'
                        ? 'bg-amber-600 text-white shadow-md border-b-3 border-amber-800 scale-102'
                        : 'bg-white text-stone-700 hover:bg-amber-50/50 border-2 border-amber-200/80'
                    }`}
                  >
                    <span className="text-base">🚀</span>
                    <span>Khởi động</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${grade5MathView === 'lessons' ? 'bg-white/20' : 'bg-amber-100 text-amber-900'}`}>Theo bài 📖</span>
                  </button>

                  {/* 2. Đấu trường 60s */}
                  <button
                    id="mode-selector-arena-mobile"
                    onClick={() => {
                      audioService.playBoingPop();
                      setGrade5MathView('exam_hub');
                      setMathHubTab('arena');
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                      grade5MathView === 'exam_hub' && mathHubTab === 'arena'
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-b-3 border-orange-700 scale-102'
                        : 'bg-white text-stone-700 hover:bg-orange-50/50 border-2 border-orange-200/80'
                    }`}
                  >
                    <Flame className={`w-4 h-4 ${grade5MathView === 'exam_hub' && mathHubTab === 'arena' ? 'text-yellow-200 fill-yellow-300' : 'text-orange-500 fill-orange-400'}`} />
                    <span>Đấu trường 60s</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${grade5MathView === 'exam_hub' && mathHubTab === 'arena' ? 'bg-white/20' : 'bg-orange-100 text-orange-800'}`}>Tốc độ ⚡</span>
                  </button>

                  {/* 3. Kiến kể chuyện */}
                  <button
                    id="mode-selector-stories-mobile"
                    onClick={() => {
                      audioService.playBoingPop();
                      setGrade5MathView('exam_hub');
                      setMathHubTab('stories');
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                      grade5MathView === 'exam_hub' && mathHubTab === 'stories'
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md border-b-3 border-amber-700 scale-102'
                        : 'bg-white text-stone-700 hover:bg-amber-50/50 border-2 border-amber-200/80'
                    }`}
                  >
                    <span className="text-base">🐜</span>
                    <span>Kiến kể chuyện</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${grade5MathView === 'exam_hub' && mathHubTab === 'stories' ? 'bg-white/30 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>Ghi nhớ 💡</span>
                  </button>

                  {/* 4. Kiến đố vui */}
                  <button
                    id="mode-selector-riddles-mobile"
                    onClick={() => {
                      audioService.playBoingPop();
                      setGrade5MathView('exam_hub');
                      setMathHubTab('riddles');
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                      grade5MathView === 'exam_hub' && mathHubTab === 'riddles'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-b-3 border-amber-700 scale-102'
                        : 'bg-white text-stone-700 hover:bg-yellow-50/50 border-2 border-yellow-200/80'
                    }`}
                  >
                    <Star className={`w-4 h-4 ${grade5MathView === 'exam_hub' && mathHubTab === 'riddles' ? 'text-yellow-200 fill-yellow-200' : 'text-amber-500 fill-amber-400'}`} />
                    <span>Kiến đố vui</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${grade5MathView === 'exam_hub' && mathHubTab === 'riddles' ? 'bg-white/20' : 'bg-yellow-100 text-amber-900'}`}>Sao tinh anh ⭐</span>
                  </button>

                  {/* 5. Kiến luyện võ */}
                  <button
                    id="mode-selector-review-mobile"
                    onClick={() => {
                      audioService.playBoingPop();
                      setGrade5MathView('exam_hub');
                      setMathHubTab('review');
                    }}
                    className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap ${
                      grade5MathView === 'exam_hub' && mathHubTab === 'review'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border-b-3 border-emerald-800 scale-102'
                        : 'bg-white text-stone-700 hover:bg-emerald-50/50 border-2 border-emerald-200/80'
                    }`}
                  >
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Kiến luyện võ</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${grade5MathView === 'exam_hub' && mathHubTab === 'review' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>Bí kíp 🥋</span>
                  </button>
                </div>
              </DragScrollContainer>
            </div>

            {/* Tablet & Desktop View (sm+): Balanced, non-scrolling responsive grid */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5 w-full">
              {/* 1. Khởi động */}
              <button
                id="mode-selector-lessons"
                onClick={() => {
                  audioService.playBoingPop();
                  setGrade5MathView('lessons');
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  grade5MathView === 'lessons'
                    ? 'bg-amber-600 text-white shadow-md border-b-3 border-amber-800 scale-102'
                    : 'bg-white text-stone-700 hover:bg-amber-50/50 border-2 border-amber-200/80'
                }`}
              >
                <span className="text-base shrink-0">🚀</span>
                <span className="whitespace-nowrap">Khởi động</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${grade5MathView === 'lessons' ? 'bg-white/20' : 'bg-amber-100 text-amber-900'}`}>Theo bài 📖</span>
              </button>

              {/* 2. Đấu trường 60s */}
              <button
                id="mode-selector-arena"
                onClick={() => {
                  audioService.playBoingPop();
                  setGrade5MathView('exam_hub');
                  setMathHubTab('arena');
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  grade5MathView === 'exam_hub' && mathHubTab === 'arena'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md border-b-3 border-orange-700 scale-102'
                    : 'bg-white text-stone-700 hover:bg-orange-50/50 border-2 border-orange-200/80'
                }`}
              >
                <Flame className={`w-4 h-4 shrink-0 ${grade5MathView === 'exam_hub' && mathHubTab === 'arena' ? 'text-yellow-200 fill-yellow-300' : 'text-orange-500 fill-orange-400'}`} />
                <span className="whitespace-nowrap">Đấu trường 60s</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${grade5MathView === 'exam_hub' && mathHubTab === 'arena' ? 'bg-white/20' : 'bg-orange-100 text-orange-800'}`}>Tốc độ ⚡</span>
              </button>

              {/* 3. Kiến kể chuyện */}
              <button
                id="mode-selector-stories"
                onClick={() => {
                  audioService.playBoingPop();
                  setGrade5MathView('exam_hub');
                  setMathHubTab('stories');
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  grade5MathView === 'exam_hub' && mathHubTab === 'stories'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-amber-950 shadow-md border-b-3 border-amber-700 scale-102'
                    : 'bg-white text-stone-700 hover:bg-amber-50/50 border-2 border-amber-200/80'
                }`}
              >
                <span className="text-base shrink-0">🐜</span>
                <span className="whitespace-nowrap">Kiến kể chuyện</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${grade5MathView === 'exam_hub' && mathHubTab === 'stories' ? 'bg-white/30 text-amber-950' : 'bg-amber-100 text-amber-800'}`}>Ghi nhớ 💡</span>
              </button>

              {/* 4. Kiến đố vui */}
              <button
                id="mode-selector-riddles"
                onClick={() => {
                  audioService.playBoingPop();
                  setGrade5MathView('exam_hub');
                  setMathHubTab('riddles');
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  grade5MathView === 'exam_hub' && mathHubTab === 'riddles'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md border-b-3 border-amber-700 scale-102'
                    : 'bg-white text-stone-700 hover:bg-yellow-50/50 border-2 border-yellow-200/80'
                }`}
              >
                <Star className={`w-4 h-4 shrink-0 ${grade5MathView === 'exam_hub' && mathHubTab === 'riddles' ? 'text-yellow-200 fill-yellow-200' : 'text-amber-500 fill-amber-400'}`} />
                <span className="whitespace-nowrap">Kiến đố vui</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${grade5MathView === 'exam_hub' && mathHubTab === 'riddles' ? 'bg-white/20' : 'bg-yellow-100 text-amber-900'}`}>Sao tinh anh ⭐</span>
              </button>

              {/* 5. Kiến luyện võ */}
              <button
                id="mode-selector-review"
                onClick={() => {
                  audioService.playBoingPop();
                  setGrade5MathView('exam_hub');
                  setMathHubTab('review');
                }}
                className={`w-full px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  grade5MathView === 'exam_hub' && mathHubTab === 'review'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border-b-3 border-emerald-800 scale-102'
                    : 'bg-white text-stone-700 hover:bg-emerald-50/50 border-2 border-emerald-200/80'
                }`}
              >
                <Award className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="whitespace-nowrap">Kiến luyện võ</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${grade5MathView === 'exam_hub' && mathHubTab === 'review' ? 'bg-white/20' : 'bg-emerald-100 text-emerald-800'}`}>Bí kíp 🥋</span>
              </button>
            </div>
          </div>
        )}

        {/* Render either the Grade 5 Math Exam Hub OR Lesson List View */}
        {currentGrade === 5 && selectedSubjectId === 'toan_5' && grade5MathView === 'exam_hub' ? (
          <Grade5MathReviewHub
            initialTab={mathHubTab}
            onEarnXP={handleEarnExamXP}
            onBackToRoadmap={() => setGrade5MathView('lessons')}
          />
        ) : (
          <LessonListView
            lessons={lessons}
            subject={currentSubject}
            selectedDomain={selectedDomain}
            user={user}
            onStartLesson={handleStartLesson}
            onOpenRiddles={() => {
              setGrade5MathView('exam_hub');
              setMathHubTab('riddles');
            }}
            onOpenArena={() => {
              setGrade5MathView('exam_hub');
              setMathHubTab('arena');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white/80 py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-black text-stone-700">
            <span>🐜 VƯƠNG QUỐC KIẾN HỌC</span>
          </div>
          <a
            href="/admincp"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/admincp');
              setIsAdminCP(true);
            }}
            className="text-stone-400 hover:text-amber-700 font-mono text-[11px] transition-colors flex items-center gap-1.5"
            title="Đến trang quản trị hệ thống"
          >
            <span>🔐</span>
            <span>Cổng Quản Trị Hệ Thống (/admincp)</span>
          </a>
        </div>
      </footer>

      {/* Lesson Player Modal (Immersive 4-Stage Experience) */}
      {activeLesson && currentSubject && (
        <LessonPlayer
          lesson={activeLesson}
          subject={currentSubject}
          user={user}
          onClose={handleCloseLesson}
          onLessonComplete={handleLessonComplete}
        />
      )}

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={questsModalOpen}
        onClose={() => setQuestsModalOpen(false)}
        quests={quests}
        grade={currentGrade}
        onClaimQuest={handleClaimQuest}
      />

      {/* Ally Showcase Modal */}
      <AllyShowcaseModal
        isOpen={alliesModalOpen}
        onClose={() => setAlliesModalOpen(false)}
        grade={currentGrade}
      />

      {/* Mastery Dashboard Modal */}
      <MasteryDashboardModal
        isOpen={masteryModalOpen}
        onClose={() => {
          setMasteryModalOpen(false);
          setRecentlyCompletedSubjectId(null);
        }}
        user={user}
        subjects={subjects}
        recentlyCompletedSubjectId={recentlyCompletedSubjectId}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={leaderboardModalOpen}
        onClose={() => setLeaderboardModalOpen(false)}
        user={user}
        currentGrade={currentGrade}
        onSelectGrade={handleSwitchGrade}
      />

      {/* User Profile & Themes/Sound Settings Modal (Chỉ mở khi đã đăng nhập/đăng ký) */}
      {isAuthenticated && (
        <ProfileSettingsModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          user={user}
          onSaveProfile={handleSaveProfile}
          onOpenAuth={handleOpenAuth}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Account Authentication & Email Verification Modal (Bắt buộc đăng nhập/đăng ký để sử dụng) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => {
          if (isAuthenticated) {
            setAuthModalOpen(false);
          }
        }}
        onAuthSuccess={handleAuthSuccess}
        onSignOutSuccess={handleSignOutSuccess}
        currentUser={user}
        currentGrade={currentGrade}
        onSwitchGrade={handleSwitchGrade}
        isMandatory={!isAuthenticated}
      />

      {/* Welcome & XP Bonus Notification Toast */}
      <AnimatePresence>
        {authNotificationToast && (
          <motion.aside
            aria-label="Thông báo thành viên"
            initial={{ opacity: 0, y: -40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[90%] sm:w-auto shadow-2xl rounded-2xl bg-stone-900/95 text-white p-3.5 sm:px-5 sm:py-4 border-2 border-amber-400 flex items-center gap-3.5 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-xl shrink-0 shadow-md">
              {!isAuthenticated ? '🐜' : '🍯'}
            </div>
            <div className="flex-1 pr-1">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                {!isAuthenticated ? 'Thông Báo Thành Viên' : 'Thành Công'}
              </div>
              <div className="text-xs sm:text-sm font-black text-amber-50 leading-snug">
                {authNotificationToast}
              </div>
            </div>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  audioService.playBoingPop();
                  handleOpenAuth('signup');
                  setAuthNotificationToast(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black shrink-0 transition-transform active:scale-95 shadow-xs"
              >
                Đăng ký ngay
              </button>
            )}
            <button
              onClick={() => setAuthNotificationToast(null)}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-white text-xs font-bold transition-all shrink-0"
              title="Đóng thông báo"
            >
              ✕
            </button>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
}
