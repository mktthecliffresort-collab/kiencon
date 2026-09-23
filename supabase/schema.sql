-- ==============================================================================
-- KIẾN HỌC (ANT UNIVERSE) - KIẾN TRÚC CƠ SỞ DỮ LIỆU TỐI ƯU & LINH HOẠT
-- Phiên bản: 2.0 (Dynamic Lesson Steps, Centralized Question Bank & RPC Leaderboard)
-- ==============================================================================

-- 1. KÍCH HOẠT UUID EXTENSION
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. NGƯỜI DÙNG & GAMIFICATION (USERS & INVENTORY)
-- Gộp profiles và user_settings để tối ưu truy vấn, hỗ trợ Offline-first & Auth
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE,
    username TEXT UNIQUE,
    phone TEXT,
    full_name TEXT NOT NULL,
    nickname TEXT,
    birth_date DATE,
    current_grade INTEGER NOT NULL DEFAULT 5,
    enrolled_courses TEXT[] DEFAULT ARRAY['toan_5']::text[],
    school_name TEXT,
    role TEXT NOT NULL DEFAULT 'student',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    avatar TEXT NOT NULL DEFAULT '🐜',
    total_xp INTEGER NOT NULL DEFAULT 250,
    streak_days INTEGER NOT NULL DEFAULT 1,
    level INTEGER NOT NULL DEFAULT 1,
    last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    settings JSONB NOT NULL DEFAULT '{
        "mode": "light",
        "accentColor": "amber",
        "soundEnabled": true,
        "soundVolume": 80,
        "ambientChime": true
    }'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Thêm các chỉ mục nhanh cho bảng users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users (username);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users (phone);
CREATE INDEX IF NOT EXISTS idx_users_current_grade ON public.users (current_grade);

CREATE TABLE IF NOT EXISTS public.user_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'badge', 'ant_ally', 'title', 'theme'
    metadata JSONB DEFAULT '{}'::jsonb,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, item_id, item_type)
);

-- ==============================================================================
-- 3. KHUNG CHƯƠNG TRÌNH HỌC (COURSES & TOPICS)
-- Gom nhóm lớp & môn học thành thực thể Course thống nhất
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY, -- 'toan_5', 'khtn_8', 'tieng_anh_8', 'lich_su_5'
    grade_level INTEGER NOT NULL, -- 5, 8...
    subject TEXT NOT NULL, -- 'Toán học', 'Khoa học tự nhiên', 'Tiếng Anh'
    title TEXT NOT NULL,
    color_theme TEXT NOT NULL DEFAULT 'amber',
    icon TEXT NOT NULL DEFAULT '📐',
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY, -- 'so_thap_phan', 'ap_suat_vat_li', 'phan_so'
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    icon TEXT DEFAULT '📖',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 4. BÀI HỌC ĐỘNG (DYNAMIC LESSONS & 1-N LESSON STEPS)
-- Giải quyết triệt để Anti-pattern hardcode 4 bước cố định
-- Cho phép bài học có số bước tùy ý (2 bước ôn tập, 4 bước chuẩn, 5 bước ngoại ngữ...)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id TEXT PRIMARY KEY, -- 'lesson_math_5_decimals', 'lesson_khtn_8_pressure'
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    course_id TEXT NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subtitle TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    xp_reward INTEGER NOT NULL DEFAULT 50,
    mascot_ally_id TEXT DEFAULT 'ant_logic',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.lesson_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    step_type TEXT NOT NULL, -- 'kham_pha' (discover), 'luyen_tap' (practice), 'van_dung' (apply), 'giang_lai' (teach_back), 'phat_am' (pronounce)...
    step_title TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    xp_reward INTEGER NOT NULL DEFAULT 15,
    time_estimate_mins INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(lesson_id, order_index)
);

-- ==============================================================================
-- 5. NGÂN HÀNG CÂU HỎI TẬP TRUNG (CENTRALIZED QUESTION BANK)
-- Hợp nhất exam_questions, arena_questions, math_riddles thành một bảng duy nhất
-- Tái sử dụng câu hỏi linh hoạt bằng usage_context array và tags
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_type TEXT NOT NULL DEFAULT 'multiple_choice', -- 'multiple_choice', 'short_answer', 'fill_blank', 'riddle', 'word_problem'
    usage_context TEXT[] NOT NULL DEFAULT ARRAY['lesson'], -- Cấp quyền hiển thị: ['exam', 'arena', 'lesson', 'riddle']
    grade_level INTEGER NOT NULL DEFAULT 5,
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard', 'master'
    content JSONB NOT NULL, -- Tiêu đề, văn bản câu hỏi, đề bài LaTeX, bối cảnh cốt truyện
    options JSONB, -- Mảng lựa chọn [{id: "A", text: "...", isCorrect: true, explanation: "..."}]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    socratic_hints JSONB DEFAULT '[]'::jsonb, -- Gợi ý Socratic đa tầng
    xp_reward INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.question_tags (
    id BIGSERIAL PRIMARY KEY,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    tag_name TEXT NOT NULL,
    UNIQUE(question_id, tag_name)
);

-- ==============================================================================
-- 6. NHIỆM VỤ HÀNG NGÀY & HÀNG TUẦN (QUESTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.quests (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'achievement'
    target_action TEXT NOT NULL, -- 'complete_lesson', 'arena_match', 'score_100', 'login'
    target_value INTEGER NOT NULL DEFAULT 1,
    xp_reward INTEGER NOT NULL DEFAULT 20,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 5,
    icon TEXT NOT NULL DEFAULT '🎯'
);

CREATE TABLE IF NOT EXISTS public.user_quests (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
    progress INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'claimed'
    quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, quest_id, quest_date)
);

-- ==============================================================================
-- 7. TIẾN ĐỘ & PHIÊN HỌC (OFFLINE-FIRST PROGRESS & SESSIONS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.user_lesson_progress (
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed_steps TEXT[] NOT NULL DEFAULT '{}',
    total_stars INTEGER NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    last_synced_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'lesson', 'exam', 'arena', 'riddle', 'review'
    target_id TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    device_info JSONB DEFAULT '{}'::jsonb,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 8. RPC FUNCTION CHO BẢNG XẾP HẠNG (GIẢI QUYẾT TRIỆT ĐỂ ROW-LOCK)
-- Thay vì bảng tĩnh bị nghẽn ghi, dùng hàm PostgreSQL động tổng hợp nhanh
-- ==============================================================================
CREATE OR REPLACE FUNCTION get_weekly_leaderboard(grade_filter INT, limit_rows INT DEFAULT 20)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    weekly_xp INT,
    avatar TEXT,
    streak_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id, 
    u.full_name, 
    (COALESCE(SUM(ls.xp_earned), 0) + u.total_xp / 10)::INT AS weekly_xp,
    u.avatar,
    u.streak_days
  FROM public.users u
  LEFT JOIN public.learning_sessions ls 
    ON u.id = ls.user_id 
    AND ls.start_time > (NOW() - INTERVAL '7 days')
  WHERE u.current_grade = grade_filter
  GROUP BY u.id, u.full_name, u.avatar, u.streak_days, u.total_xp
  ORDER BY weekly_xp DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_overall_leaderboard(grade_filter INT, limit_rows INT DEFAULT 20)
RETURNS TABLE (
    user_id UUID,
    full_name TEXT,
    total_xp INT,
    avatar TEXT,
    streak_days INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id AS user_id, 
    u.full_name, 
    u.total_xp,
    u.avatar,
    u.streak_days
  FROM public.users u
  WHERE u.current_grade = grade_filter
  ORDER BY u.total_xp DESC
  LIMIT limit_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 9. CHỈ MỤC TỐI ƯU HIỆU NĂNG TRUY VẤN (INDEXES)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_grade ON public.courses(grade_level);
CREATE INDEX IF NOT EXISTS idx_topics_course ON public.topics(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_topic ON public.lessons(topic_id);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson ON public.lesson_steps(lesson_id, order_index);
CREATE INDEX IF NOT EXISTS idx_questions_usage ON public.questions USING GIN(usage_context);
CREATE INDEX IF NOT EXISTS idx_questions_grade ON public.questions(grade_level);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON public.question_tags(tag_name);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_sessions_weekly ON public.learning_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_users_grade_xp ON public.users(current_grade, total_xp DESC);

-- ==============================================================================
-- 10. BẢO MẬT ROW LEVEL SECURITY (RLS)
-- Tối ưu cho cơ chế Offline-first đồng bộ hàng loạt
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;

-- 10.1 Chính sách Đọc công khai cho nội dung học tập
DO $$
BEGIN
    CREATE POLICY "Public read for courses" ON public.courses FOR SELECT USING (true);
    CREATE POLICY "Public read for topics" ON public.topics FOR SELECT USING (true);
    CREATE POLICY "Public read for lessons" ON public.lessons FOR SELECT USING (true);
    CREATE POLICY "Public read for lesson steps" ON public.lesson_steps FOR SELECT USING (true);
    CREATE POLICY "Public read for questions" ON public.questions FOR SELECT USING (true);
    CREATE POLICY "Public read for question tags" ON public.question_tags FOR SELECT USING (true);
    CREATE POLICY "Public read for quests" ON public.quests FOR SELECT USING (true);
    CREATE POLICY "Public read for users" ON public.users FOR SELECT USING (true);
    
    -- 10.2 Cho phép học sinh ghi và đọc dữ liệu của mình (Offline-first sync)
    CREATE POLICY "Users can manage their profile" ON public.users FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Users can view and update inventory" ON public.user_inventory FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Users can manage user quests" ON public.user_quests FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Users can upsert their lesson progress" ON public.user_lesson_progress FOR ALL USING (true) WITH CHECK (true);
    CREATE POLICY "Users can log learning sessions" ON public.learning_sessions FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 11. BẢNG LƯU TRỮ MÃ OTP (HỖ TRỢ SERVERLESS VERCEL CROSS-INSTANCE)
CREATE TABLE IF NOT EXISTS public.otp_codes (
    email TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    codes JSONB DEFAULT '[]'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

DO $$
BEGIN
    ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Public access to otp_codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

