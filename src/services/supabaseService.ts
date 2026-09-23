import { getSupabaseClient, isSupabaseConfigured, checkSupabaseConnection } from '../lib/supabase';
import {
  UserProfile,
  GradeLevel,
  Subject,
  Lesson,
  DailyQuest,
  LeaderboardEntry,
} from '../types';
import {
  SUBJECTS_GRADE_5,
  SUBJECTS_GRADE_8,
  LESSONS,
  INITIAL_USER_GRADE_5,
  INITIAL_USER_GRADE_8,
  INITIAL_QUESTS,
} from '../data/mockData';
import {
  INITIAL_LEADERBOARD_GRADE_5,
  INITIAL_LEADERBOARD_GRADE_8,
} from '../data/leaderboardData';

const USER_STORAGE_PREFIX = 'kienhoc_user_v1_';
const QUEST_STORAGE_KEY = 'kienhoc_quests_v1';

export const supabaseService = {
  // Kiểm tra kết nối Supabase
  async checkStatus() {
    return checkSupabaseConnection();
  },

  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  // ============================================================================
  // 1. KHUNG CHƯƠNG TRÌNH & MÔN HỌC (COURSES & TOPICS)
  // Tối ưu: Gom nhóm grades & subjects thành courses thống nhất
  // ============================================================================
  async getSubjects(grade: GradeLevel): Promise<Subject[]> {
    const fallbackSubjects = grade === 5 ? [...SUBJECTS_GRADE_5] : [...SUBJECTS_GRADE_8];
    const client = getSupabaseClient();
    if (!client) return fallbackSubjects;

    try {
      // Truy vấn bảng courses chuẩn hóa mới
      const { data, error } = await client
        .from('courses')
        .select('*')
        .eq('grade_level', grade)
        .order('sort_order', { ascending: true });

      if (error || !data || data.length === 0) {
        return fallbackSubjects;
      }

      return data.map((item) => {
        const fallbackMatch = fallbackSubjects.find((s) => s.id === item.id);
        return {
          id: item.id,
          name: item.title,
          code: item.id,
          grade: item.grade_level as GradeLevel,
          iconName: item.icon,
          color: item.color_theme,
          description: item.description || '',
          isIntegrated: item.id === 'khtn_8',
          domainBranches: fallbackMatch?.domainBranches,
        };
      });
    } catch {
      return fallbackSubjects;
    }
  },

  // ============================================================================
  // 2. BÀI HỌC ĐỘNG & BƯỚC HỌC 1-N (DYNAMIC LESSONS & LESSON STEPS)
  // Giải quyết triệt để hardcode 4 bước, nạp động các bước học từ lesson_steps
  // ============================================================================
  async getLessons(grade: GradeLevel, subjectId?: string): Promise<Lesson[]> {
    let fallback = LESSONS.filter((l) => l.grade === grade);
    if (subjectId) {
      fallback = fallback.filter((l) => l.subjectId === subjectId);
    }

    const client = getSupabaseClient();
    if (!client) return fallback;

    try {
      let query = client.from('lessons').select('*');
      if (subjectId) {
        query = query.eq('course_id', subjectId);
      }
      query = query.order('order_index', { ascending: true });

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return fallback;
      }

      // Nạp danh sách các bài học, kết hợp với các bước học từ lesson_steps
      const lessonList: Lesson[] = [];

      for (const d of data) {
        const fallbackMatch = fallback.find((f) => f.id === d.id) || fallback[0];
        // Truy vấn bảng lesson_steps 1-N
        const { data: stepsData } = await client
          .from('lesson_steps')
          .select('*')
          .eq('lesson_id', d.id)
          .order('order_index', { ascending: true });

        // Map cấu trúc 1-N sang đối tượng Lesson mà UI tiêu thụ
        let discover = fallbackMatch?.discover;
        let practice = fallbackMatch?.practice;
        let apply = fallbackMatch?.apply;
        let teachBack = fallbackMatch?.teachBack;

        if (stepsData && stepsData.length > 0) {
          const khamPhaStep = stepsData.find((s) => s.step_type === 'kham_pha');
          if (khamPhaStep && typeof khamPhaStep.content === 'object' && khamPhaStep.content !== null) {
            const c = khamPhaStep.content as Record<string, unknown>;
            discover = {
              storyTitle: (c.storyTitle as string) || (c.title as string) || fallbackMatch?.discover?.storyTitle || d.title,
              storyContent: (c.story as string) || (c.storyContent as string) || fallbackMatch?.discover?.storyContent || '',
              realWorldContext: (c.context as string) || (c.realWorldContext as string) || fallbackMatch?.discover?.realWorldContext || '',
              promptQuestion: (c.prompt as string) || (c.promptQuestion as string) || fallbackMatch?.discover?.promptQuestion || '',
              imageUrl: c.imageUrl as string | undefined,
              keyObservation: (c.keyObservation as string) || fallbackMatch?.discover?.keyObservation || '',
            };
          }

          const luyenTapStep = stepsData.find((s) => s.step_type === 'luyen_tap');
          if (luyenTapStep && typeof luyenTapStep.content === 'object' && luyenTapStep.content !== null) {
            const c = luyenTapStep.content as Record<string, unknown>;
            practice = {
              type: (c.type as any) || fallbackMatch?.practice?.type || 'interactive_choice',
              challengeTitle: (c.challengeTitle as string) || fallbackMatch?.practice?.challengeTitle || 'Thử Thách Luyện Tập',
              instructions: (c.instructions as string) || fallbackMatch?.practice?.instructions || 'Cùng luyện tập giải bài nhé!',
              hintStage1: (c.hint as string) || fallbackMatch?.practice?.hintStage1 || 'Hãy quan sát kỹ các số liệu',
              hintStage2: fallbackMatch?.practice?.hintStage2 || 'Áp dụng quy tắc đã học',
              genericQuestion: fallbackMatch?.practice?.genericQuestion,
              mathTasks: fallbackMatch?.practice?.mathTasks,
            };
          }

          const vanDungStep = stepsData.find((s) => s.step_type === 'van_dung');
          if (vanDungStep && typeof vanDungStep.content === 'object' && vanDungStep.content !== null) {
            const c = vanDungStep.content as Record<string, unknown>;
            apply = {
              dilemmaTitle: (c.dilemmaTitle as string) || fallbackMatch?.apply?.dilemmaTitle || 'Tình Huống Thực Tế',
              situation: (c.situation as string) || fallbackMatch?.apply?.situation || '',
              question: (c.question as string) || fallbackMatch?.apply?.question || '',
              options: fallbackMatch?.apply?.options || [],
              hintStage1: fallbackMatch?.apply?.hintStage1 || 'Đọc kỹ câu hỏi tình huống',
              hintStage2: fallbackMatch?.apply?.hintStage2 || 'Tính toán cẩn thận trước khi chọn',
            };
          }

          const giangLaiStep = stepsData.find((s) => s.step_type === 'giang_lai');
          if (giangLaiStep && typeof giangLaiStep.content === 'object' && giangLaiStep.content !== null) {
            const c = giangLaiStep.content as Record<string, unknown>;
            teachBack = {
              promptTitle: (c.promptTitle as string) || fallbackMatch?.teachBack?.promptTitle || 'Giảng lại bài học',
              guidingQuestion: (c.guidingQuestion as string) || fallbackMatch?.teachBack?.guidingQuestion || 'Bạn có thể hướng dẫn lại bài này cho bạn Kiến không?',
              helperBulletPoints: (c.helperPoints as string[]) || (c.helperBulletPoints as string[]) || fallbackMatch?.teachBack?.helperBulletPoints || [],
              sampleStarters: fallbackMatch?.teachBack?.sampleStarters || ['Để giải bài này, đầu tiên...', 'Tiếp theo chúng mình...'],
              expectedConcepts: fallbackMatch?.teachBack?.expectedConcepts || ['Quy tắc tính', 'Cách giải'],
            };
          }
        }

        lessonList.push({
          id: d.id,
          subjectId: d.course_id,
          grade,
          unit: d.topic_id || 'Chủ đề 1',
          title: d.title,
          subtitle: d.subtitle || '',
          allyId: d.mascot_ally_id || 'ant_logic',
          estimatedMinutes: d.estimated_minutes,
          xpReward: d.xp_reward,
          discover,
          practice,
          apply,
          teachBack,
        });
      }

      return lessonList;
    } catch {
      return fallback;
    }
  },

  async getLessonById(lessonId: string): Promise<Lesson | null> {
    const fallback = LESSONS.find((l) => l.id === lessonId) || null;
    const client = getSupabaseClient();
    if (!client) return fallback;

    try {
      const { data, error } = await client.from('lessons').select('*').eq('id', lessonId).single();
      if (error || !data) return fallback;

      // Nạp dynamic lesson_steps cho bài này
      const { data: stepsData } = await client
        .from('lesson_steps')
        .select('*')
        .eq('lesson_id', lessonId)
        .order('order_index', { ascending: true });

      let discover = fallback?.discover || LESSONS[0].discover;
      let practice = fallback?.practice || LESSONS[0].practice;
      let apply = fallback?.apply || LESSONS[0].apply;
      let teachBack = fallback?.teachBack || LESSONS[0].teachBack;

      if (stepsData && stepsData.length > 0) {
        const khamPhaStep = stepsData.find((s) => s.step_type === 'kham_pha');
        if (khamPhaStep && typeof khamPhaStep.content === 'object' && khamPhaStep.content !== null) {
          const c = khamPhaStep.content as Record<string, unknown>;
          discover = {
            storyTitle: (c.storyTitle as string) || (c.title as string) || discover.storyTitle,
            storyContent: (c.story as string) || (c.storyContent as string) || discover.storyContent,
            realWorldContext: (c.context as string) || (c.realWorldContext as string) || discover.realWorldContext,
            promptQuestion: (c.prompt as string) || (c.promptQuestion as string) || discover.promptQuestion,
            imageUrl: c.imageUrl as string | undefined,
            keyObservation: (c.keyObservation as string) || discover.keyObservation,
          };
        }

        const luyenTapStep = stepsData.find((s) => s.step_type === 'luyen_tap');
        if (luyenTapStep && typeof luyenTapStep.content === 'object' && luyenTapStep.content !== null) {
          const c = luyenTapStep.content as Record<string, unknown>;
          practice = {
            type: (c.type as any) || practice.type || 'interactive_choice',
            challengeTitle: (c.challengeTitle as string) || practice.challengeTitle || 'Thử Thách Luyện Tập',
            instructions: (c.instructions as string) || practice.instructions || 'Cùng luyện tập giải bài nhé!',
            hintStage1: (c.hint as string) || practice.hintStage1 || 'Hãy quan sát kỹ các số liệu',
            hintStage2: practice.hintStage2 || 'Áp dụng quy tắc đã học',
            genericQuestion: practice.genericQuestion,
            mathTasks: practice.mathTasks,
          };
        }

        const vanDungStep = stepsData.find((s) => s.step_type === 'van_dung');
        if (vanDungStep && typeof vanDungStep.content === 'object' && vanDungStep.content !== null) {
          const c = vanDungStep.content as Record<string, unknown>;
          apply = {
            dilemmaTitle: (c.dilemmaTitle as string) || apply.dilemmaTitle || 'Tình Huống Thực Tế',
            situation: (c.situation as string) || apply.situation || '',
            question: (c.question as string) || apply.question || '',
            options: apply.options || [],
            hintStage1: apply.hintStage1 || 'Đọc kỹ câu hỏi tình huống',
            hintStage2: apply.hintStage2 || 'Tính toán cẩn thận trước khi chọn',
          };
        }

        const giangLaiStep = stepsData.find((s) => s.step_type === 'giang_lai');
        if (giangLaiStep && typeof giangLaiStep.content === 'object' && giangLaiStep.content !== null) {
          const c = giangLaiStep.content as Record<string, unknown>;
          teachBack = {
            promptTitle: (c.promptTitle as string) || teachBack.promptTitle || 'Giảng lại bài học',
            guidingQuestion: (c.guidingQuestion as string) || teachBack.guidingQuestion || 'Bạn có thể hướng dẫn lại bài này cho bạn Kiến không?',
            helperBulletPoints: (c.helperPoints as string[]) || (c.helperBulletPoints as string[]) || teachBack.helperBulletPoints || [],
            sampleStarters: teachBack.sampleStarters || ['Để giải bài này, đầu tiên...', 'Tiếp theo chúng mình...'],
            expectedConcepts: teachBack.expectedConcepts || ['Quy tắc tính', 'Cách giải'],
          };
        }
      }

      return {
        id: data.id,
        subjectId: data.course_id,
        grade: (data.course_id.includes('8') ? 8 : 5) as GradeLevel,
        unit: data.topic_id,
        title: data.title,
        subtitle: data.subtitle || '',
        allyId: data.mascot_ally_id || 'ant_logic',
        estimatedMinutes: data.estimated_minutes,
        xpReward: data.xp_reward,
        discover,
        practice,
        apply,
        teachBack,
      };
    } catch {
      return fallback;
    }
  },

  // ============================================================================
  // 3. NGÂN HÀNG CÂU HỎI TẬP TRUNG (CENTRALIZED QUESTION BANK)
  // Truy vấn câu hỏi linh hoạt theo usage_context: 'exam', 'arena', 'riddle', 'lesson'
  // ============================================================================
  async getQuestionsByContext(
    usageContext: 'exam' | 'arena' | 'riddle' | 'lesson',
    grade: GradeLevel
  ) {
    const client = getSupabaseClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from('questions')
        .select('*')
        .contains('usage_context', [usageContext])
        .eq('grade_level', grade);

      if (error || !data) return [];
      return data;
    } catch {
      return [];
    }
  },

  // ============================================================================
  // 4. NGƯỜI DÙNG, TIẾN ĐỘ & OFFLINE-FIRST (USERS & USER LESSON PROGRESS)
  // Gộp thông tin profiles & settings vào bảng users chuẩn hóa mới
  // ============================================================================
  async getUserProfile(grade: GradeLevel): Promise<UserProfile> {
    const loadLocal = (): UserProfile => {
      try {
        const raw = localStorage.getItem(`${USER_STORAGE_PREFIX}${grade}`);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
      return grade === 5 ? { ...INITIAL_USER_GRADE_5 } : { ...INITIAL_USER_GRADE_8 };
    };

    const localProfile = loadLocal();
    const client = getSupabaseClient();
    if (!client) return localProfile;

    try {
      // Kiểm tra xem có phiên đăng nhập của người dùng không
      let authUserId: string | null = null;
      let authEmail: string | null = null;
      try {
        const rawSession = localStorage.getItem('kienhoc_auth_session_v2');
        if (rawSession) {
          const sess = JSON.parse(rawSession);
          authUserId = sess.id;
          authEmail = sess.email;
        }
      } catch {
        // ignore
      }

      // Nếu người dùng CHƯA đăng nhập, sử dụng hồ sơ khách cục bộ (không lấy bừa tài khoản người khác từ DB)
      if (!authUserId && !authEmail) {
        return localProfile;
      }

      // Tìm đúng người dùng đã đăng nhập theo authUserId hoặc authEmail
      let query = client.from('users').select('*');
      if (authUserId) {
        query = query.or(`id.eq.${authUserId},auth_id.eq.${authUserId}`);
      } else if (authEmail) {
        query = query.eq('email', authEmail.trim().toLowerCase());
      }

      const { data, error } = await query.maybeSingle();

      if (error || !data) {
        return localProfile;
      }

      const settings = (data.settings as Record<string, unknown>) || {};

      const mergedProfile: UserProfile = {
        id: data.id,
        name: data.full_name,
        nickname: data.nickname || data.full_name,
        username: (data as any).username || (settings.username as string) || localProfile.username,
        phone: (data as any).phone || (settings.phone as string) || localProfile.phone,
        birthDate: (data as any).birth_date || (settings.birthDate as string) || localProfile.birthDate || '2014-08-15',
        email: (data as any).email || (settings.email as string) || localProfile.email,
        grade: (data.current_grade as GradeLevel) || grade,
        avatar: data.avatar || '🐜',
        xp: data.total_xp || 0,
        level: data.level || 1,
        streakDays: data.streak_days || 1,
        lastActiveDate: new Date().toISOString().split('T')[0],
        completedLessons: localProfile.completedLessons,
        subjectMastery: localProfile.subjectMastery,
        inventory: localProfile.inventory,
        enrolledCourses: (data as any).enrolled_courses || (settings.enrolledCourses as string[]) || localProfile.enrolledCourses || (grade === 5 ? ['toan_5'] : ['khtn_8']),
        schoolName: (data as any).school_name || (settings.schoolName as string) || localProfile.schoolName,
        role: ((data as any).role as any) || (settings.role as any) || 'student',
        isVerified: (data as any).is_verified !== undefined ? (data as any).is_verified : (localProfile.isVerified ?? false),
        themeSettings: {
          mode: (settings.mode as 'light' | 'soft' | 'warm') || localProfile.themeSettings?.mode || 'light',
          accentColor: (settings.accentColor as 'amber' | 'sky' | 'emerald' | 'purple' | 'rose') || localProfile.themeSettings?.accentColor || 'amber',
          soundEnabled: settings.soundEnabled !== undefined ? Boolean(settings.soundEnabled) : true,
          soundVolume: typeof settings.soundVolume === 'number' ? settings.soundVolume : 80,
          ambientChime: settings.ambientChime !== undefined ? Boolean(settings.ambientChime) : true,
        },
      };

      // Tải thêm tiến độ đã đồng bộ từ bảng user_lesson_progress
      try {
        const { data: progressData } = await client
          .from('user_lesson_progress')
          .select('lesson_id')
          .eq('user_id', data.id);

        if (progressData && progressData.length > 0) {
          const syncedLessonIds = progressData.map((p) => p.lesson_id);
          mergedProfile.completedLessons = Array.from(new Set([...mergedProfile.completedLessons, ...syncedLessonIds]));
        }
      } catch {
        // ignore progress query error
      }

      localStorage.setItem(`${USER_STORAGE_PREFIX}${grade}`, JSON.stringify(mergedProfile));
      return mergedProfile;
    } catch {
      return localProfile;
    }
  },

  async updateUserProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      localStorage.setItem(`${USER_STORAGE_PREFIX}${profile.grade}`, JSON.stringify(profile));
    } catch (e) {
      console.warn('Lỗi lưu local storage:', e);
    }

    await this.syncProfileToSupabase(profile);
    return profile;
  },

  async syncProfileToSupabase(profile: UserProfile): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    // Không đồng bộ hồ sơ khách vãng lai đè lên database
    if (
      !profile.id ||
      profile.id.startsWith('user_guest') ||
      profile.id.startsWith('guest_') ||
      (!profile.email && profile.id.startsWith('user_'))
    ) {
      return;
    }

    try {
      // Tìm xem đã có bản ghi theo profile.id hoặc email
      let query = client.from('users').select('id');
      if (profile.id && !profile.id.startsWith('user_')) {
        query = query.or(`id.eq.${profile.id},auth_id.eq.${profile.id}`).limit(1);
      } else if (profile.email) {
        query = query.eq('email', profile.email.toLowerCase().trim()).limit(1);
      } else {
        return;
      }
      const { data: existingUser } = await query.maybeSingle();

      const baseSettings = {
        ...(profile.themeSettings
          ? {
              mode: profile.themeSettings.mode,
              accentColor: profile.themeSettings.accentColor,
              soundEnabled: profile.themeSettings.soundEnabled,
              soundVolume: profile.themeSettings.soundVolume,
              ambientChime: profile.themeSettings.ambientChime,
            }
          : {}),
        ...(profile.birthDate ? { birthDate: profile.birthDate } : {}),
        ...(profile.email ? { email: profile.email } : {}),
        ...(profile.username ? { username: profile.username } : {}),
        ...(profile.phone ? { phone: profile.phone } : {}),
        ...(profile.enrolledCourses ? { enrolledCourses: profile.enrolledCourses } : {}),
        ...(profile.schoolName ? { schoolName: profile.schoolName } : {}),
      };

      // Payload đầy đủ chứa các cột độc lập mới
      const fullPayload: any = {
        full_name: profile.name,
        nickname: profile.nickname || profile.name,
        email: profile.email ? profile.email.toLowerCase().trim() : null,
        username: profile.username ? profile.username.toLowerCase().trim() : null,
        phone: profile.phone ? profile.phone.trim() : null,
        birth_date: profile.birthDate || null,
        current_grade: profile.grade,
        enrolled_courses: profile.enrolledCourses || (profile.grade === 5 ? ['toan_5'] : ['khtn_8']),
        school_name: profile.schoolName || null,
        role: profile.role || 'student',
        is_verified: profile.isVerified !== undefined ? profile.isVerified : false,
        avatar: profile.avatar || '🐜',
        total_xp: profile.xp || 0,
        streak_days: profile.streakDays || 1,
        level: profile.level || 1,
        settings: baseSettings,
        updated_at: new Date().toISOString(),
      };

      if (existingUser?.id) {
        const { error } = await client.from('users').update(fullPayload).eq('id', existingUser.id);
        if (error) {
          // Nếu bảng trên Supabase chưa chạy migration (thiếu cột), update các cột cơ bản
          const basicPayload = {
            full_name: profile.name,
            nickname: profile.nickname || profile.name,
            current_grade: profile.grade,
            avatar: profile.avatar || '🐜',
            total_xp: profile.xp || 0,
            streak_days: profile.streakDays || 1,
            level: profile.level || 1,
            settings: baseSettings,
            updated_at: new Date().toISOString(),
          };
          await client.from('users').update(basicPayload).eq('id', existingUser.id);
        }
      } else {
        const isUuid = (str?: string | null) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
        const recordId = isUuid(profile.id)
          ? profile.id
          : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'b0000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));

        fullPayload.id = recordId;
        const { error } = await client.from('users').insert(fullPayload);
        if (error) {
          const basicPayload = {
            id: recordId,
            full_name: profile.name,
            nickname: profile.nickname || profile.name,
            current_grade: profile.grade,
            avatar: profile.avatar || '🐜',
            total_xp: profile.xp || 0,
            streak_days: profile.streakDays || 1,
            level: profile.level || 1,
            settings: baseSettings,
            updated_at: new Date().toISOString(),
          };
          await client.from('users').insert(basicPayload);
        }
      }
    } catch (e) {
      console.warn('Không thể đồng bộ hồ sơ lên Supabase users:', e);
    }
  },

  async addXP(grade: GradeLevel, amount: number): Promise<UserProfile> {
    const profile = await this.getUserProfile(grade);
    const newXP = (profile.xp || 0) + amount;
    const newLevel = Math.floor(newXP / 200) + 1;
    profile.xp = newXP;
    profile.level = newLevel;
    return this.updateUserProfile(profile);
  },

  async recordLessonCompletion(
    grade: GradeLevel,
    lessonId: string,
    subjectId: string,
    masteryDelta: number
  ): Promise<UserProfile> {
    const profile = await this.getUserProfile(grade);
    if (!profile.completedLessons.includes(lessonId)) {
      profile.completedLessons.push(lessonId);
    }

    const currentMastery = profile.subjectMastery[subjectId] || 0;
    profile.subjectMastery[subjectId] = Math.min(100, currentMastery + masteryDelta);

    // Ghi nhận vào bảng user_lesson_progress (Offline-first sync)
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data: user } = await client
          .from('users')
          .select('id')
          .eq('current_grade', grade)
          .limit(1)
          .maybeSingle();

        if (user?.id) {
          await client.from('user_lesson_progress').upsert({
            user_id: user.id,
            lesson_id: lessonId,
            total_stars: 3,
            is_completed: true,
            last_synced_at: new Date().toISOString(),
          });
        }
      } catch {
        // ignore progress upsert failure
      }
    }

    return this.updateUserProfile(profile);
  },

  async incrementStreak(grade: GradeLevel): Promise<UserProfile> {
    const profile = await this.getUserProfile(grade);
    profile.streakDays = (profile.streakDays || 0) + 1;
    profile.lastActiveDate = new Date().toISOString().split('T')[0];
    return this.updateUserProfile(profile);
  },

  // ============================================================================
  // 5. NHIỆM VỤ (QUESTS & USER_QUESTS)
  // ============================================================================
  async getQuests(grade: GradeLevel): Promise<DailyQuest[]> {
    const loadLocal = (): DailyQuest[] => {
      try {
        const raw = localStorage.getItem(QUEST_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        // ignore
      }
      return [...INITIAL_QUESTS];
    };

    const localQuests = loadLocal().filter((q) => q.grade === grade);
    const client = getSupabaseClient();
    if (!client) return localQuests;

    try {
      const { data, error } = await client.from('quests').select('*').eq('grade_level', grade);
      if (error || !data || data.length === 0) {
        return localQuests;
      }

      return data.map((d) => {
        const matchingLocal = localQuests.find((l) => l.id === d.id);
        return {
          id: d.id,
          grade: d.grade_level as GradeLevel,
          title: d.title,
          description: d.description,
          target: d.target_value,
          xpReward: d.xp_reward,
          progress: matchingLocal?.progress || 0,
          isCompleted: matchingLocal?.isCompleted || false,
          isClaimed: matchingLocal?.isClaimed || false,
        };
      });
    } catch {
      return localQuests;
    }
  },

  async updateQuestProgress(grade: GradeLevel, questId: string, delta: number): Promise<DailyQuest | null> {
    const quests = await this.getQuests(grade);
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return null;

    quest.progress = Math.min(quest.target, quest.progress + delta);
    if (quest.progress >= quest.target) {
      quest.isCompleted = true;
    }

    try {
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(quests));
    } catch {
      // ignore
    }

    return quest;
  },

  async claimQuestReward(grade: GradeLevel, questId: string): Promise<{ quest: DailyQuest; xpReward: number } | null> {
    const quests = await this.getQuests(grade);
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return null;

    quest.isClaimed = true;
    try {
      localStorage.setItem(QUEST_STORAGE_KEY, JSON.stringify(quests));
    } catch {
      // ignore
    }

    return { quest, xpReward: quest.xpReward };
  },

  // ============================================================================
  // 6. BẢNG XẾP HẠNG QUA RPC FUNCTION (GIẢI QUYẾT TRIỆT ĐỂ ROW-LOCK)
  // Gọi RPC get_weekly_leaderboard hoặc get_overall_leaderboard tổng hợp động
  // ============================================================================
  async getLeaderboard(grade: GradeLevel): Promise<LeaderboardEntry[]> {
    const fallback = (grade === 8 ? INITIAL_LEADERBOARD_GRADE_8 : INITIAL_LEADERBOARD_GRADE_5).map((e) => ({
      ...e,
      isCurrentUser: false,
    }));

    const client = getSupabaseClient();
    if (!client) {
      return fallback;
    }

    try {
      // 1. Thử gọi RPC Function get_weekly_leaderboard
      const { data: rpcData, error: rpcError } = await client.rpc('get_weekly_leaderboard', {
        grade_filter: grade,
        limit_rows: 20,
      });

      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData.map((d, index) => ({
          id: d.user_id,
          name: d.full_name,
          grade,
          avatar: d.avatar || '🐜',
          school: 'Trường Kiến Học Vươn Xa',
          className: `Lớp ${grade}A`,
          xp: d.weekly_xp || 100,
          streakDays: d.streak_days || 1,
          lessonsCompletedCount: Math.floor((d.weekly_xp || 100) / 50),
          rankChange: index < 2 ? 'up' : 'same',
          rankChangeAmount: index < 2 ? 1 : 0,
          badgeTitle: index === 0 ? 'Kiến Quán Quân' : index === 1 ? 'Kiến Á Quân' : 'Kiến Tinh Anh',
          cheersReceived: (index + 1) * 7,
          isCurrentUser: false,
        }));
      }

      // 2. Dự phòng: Truy vấn trực tiếp bảng users sắp xếp theo total_xp
      const { data: usersData, error: userError } = await client
        .from('users')
        .select('*')
        .eq('current_grade', grade)
        .order('total_xp', { ascending: false })
        .limit(20);

      if (!userError && usersData && usersData.length > 0) {
        return usersData.map((d, index) => ({
          id: d.id,
          name: d.full_name,
          grade,
          avatar: d.avatar || '🐜',
          school: 'Trường Kiến Học Vươn Xa',
          className: `Lớp ${grade}A`,
          xp: d.total_xp,
          streakDays: d.streak_days,
          lessonsCompletedCount: Math.floor(d.total_xp / 60),
          rankChange: index < 2 ? 'up' : 'same',
          rankChangeAmount: index < 2 ? 1 : 0,
          badgeTitle: index === 0 ? 'Kiến Quán Quân' : index === 1 ? 'Kiến Á Quân' : 'Kiến Tinh Anh',
          cheersReceived: (index + 1) * 5,
          isCurrentUser: false,
        }));
      }

      return fallback;
    } catch {
      return fallback;
    }
  },

  async cheerUser(_userId: string): Promise<boolean> {
    return true;
  },

  // ============================================================================
  // 7. GHI NHẬN PHIÊN HỌC & THỜI GIAN (LEARNING SESSIONS & TIME LOGS)
  // Dữ liệu gốc phục vụ bảng điều khiển phụ huynh & tổng hợp RPC leaderboard
  // ============================================================================
  async logLearningSession(
    grade: GradeLevel,
    activityType: string,
    targetId: string,
    durationSeconds: number,
    xpEarned: number
  ) {
    const client = getSupabaseClient();
    if (!client) return;

    try {
      const { data: user } = await client
        .from('users')
        .select('id')
        .eq('current_grade', grade)
        .limit(1)
        .maybeSingle();

      if (user?.id) {
        await client.from('learning_sessions').insert({
          user_id: user.id,
          activity_type: activityType,
          target_id: targetId,
          duration_seconds: durationSeconds,
          xp_earned: xpEarned,
          start_time: new Date(Date.now() - durationSeconds * 1000).toISOString(),
          end_time: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn('Lỗi ghi nhận phiên học learning_sessions:', e);
    }
  },
};
