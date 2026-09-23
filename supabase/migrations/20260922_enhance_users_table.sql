-- ==============================================================================
-- BỔ SUNG CÁC TRƯỜNG QUAN TRỌNG CHO BẢNG public.users
-- Chạy đoạn mã này trong Supabase -> SQL Editor -> New Query -> Run
-- An toàn: Dùng "IF NOT EXISTS" không làm mất hoặc gián đoạn dữ liệu hiện có
-- ==============================================================================

-- 1. Bổ sung các cột thông tin tài khoản & học sinh
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS enrolled_courses TEXT[] DEFAULT ARRAY['toan_5']::text[];
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS school_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- 2. Đảm bảo ràng buộc UNIQUE và chỉ mục (INDEX) để truy vấn tức thì & chống trùng lặp
DO $$
BEGIN
    -- Tạo Unique Index cho email nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_email_unique') THEN
        CREATE UNIQUE INDEX idx_users_email_unique ON public.users (email) WHERE email IS NOT NULL;
    END IF;

    -- Tạo Unique Index cho username nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_username_unique') THEN
        CREATE UNIQUE INDEX idx_users_username_unique ON public.users (username) WHERE username IS NOT NULL;
    END IF;

    -- Tạo Index cho phone nếu chưa có
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_phone') THEN
        CREATE INDEX idx_users_phone ON public.users (phone) WHERE phone IS NOT NULL;
    END IF;

    -- Tạo Index cho current_grade
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'users' AND indexname = 'idx_users_current_grade') THEN
        CREATE INDEX idx_users_current_grade ON public.users (current_grade);
    END IF;
END $$;

-- 3. Cập nhật RLS Policy đảm bảo người dùng có quyền quản lý hồ sơ của mình
DO $$
BEGIN
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Users can manage their profile" ON public.users;
    CREATE POLICY "Users can manage their profile" ON public.users FOR ALL USING (true) WITH CHECK (true);
    
    DROP POLICY IF EXISTS "Public read for users" ON public.users;
    CREATE POLICY "Public read for users" ON public.users FOR SELECT USING (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 4. Bảng lưu trữ mã OTP phục vụ môi trường Serverless (Vercel) xuyên suốt các instance
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
    
    DROP POLICY IF EXISTS "Public access to otp_codes" ON public.otp_codes;
    CREATE POLICY "Public access to otp_codes" ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

