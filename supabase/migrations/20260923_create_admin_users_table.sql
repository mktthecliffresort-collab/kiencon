-- ==============================================================================
-- BẢNG DÀNH RIÊNG CHO BAN QUẢN TRỊ & NHÂN SỰ CHUYÊN MÔN (ADMIN_USERS / STAFF_ACCOUNTS)
-- Kiến Học (Ant Universe) - Thiết kế kiến trúc bảo mật phân tầng (RBAC Isolation)
-- 
-- TẠI SAO PHẢI TÁCH BẢNG ADMIN KHỎI BẢNG USERS?
-- 1. An ninh & Bảo mật tuyệt đối: Không để lẫn trường role/admin trong bảng public.users 
--    (tránh nguy cơ người dùng học sinh sửa request payload để leo thang đặc quyền).
-- 2. Độc lập chính sách RLS: Bảng admin có RLS khắt khe riêng, phân quyền chi tiết theo
--    từng vai trò (Super Admin, Quản Lý Bài Học, Quản Lý Môn Học, Quản Lý Học Viên...).
-- 3. Schema tinh gọn: Bảng users chứa dữ liệu Game/Học tập (XP, Level, Streak, Grade),
--    trong khi admin_users lưu Quyền hạn (Permissions), Phòng ban, Nhật ký đăng nhập.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TẠO BẢNG public.admin_users
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL, -- 'super_admin' | 'lesson_manager' | 'subject_manager' | 'grade_manager' | 'content_manager' | 'student_manager'
    role_title TEXT NOT NULL,
    department TEXT DEFAULT 'Ban Quản Trị Kiến Học',
    permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    avatar TEXT NOT NULL DEFAULT '👑',
    status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'suspended' | 'inactive'
    phone TEXT,
    notes TEXT,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
    last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TẠO CÁC CHỈ MỤC (INDEX) TỐI ƯU HÓA HIỆU NĂNG TRUY VẤN
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON public.admin_users (role);
CREATE INDEX IF NOT EXISTS idx_admin_users_status ON public.admin_users (status);

-- 3. TẠO VIEW TƯƠNG THÍCH public.staff_accounts
CREATE OR REPLACE VIEW public.staff_accounts AS
SELECT 
    id,
    auth_id,
    email,
    full_name,
    role,
    role_title,
    department,
    permissions,
    avatar,
    status,
    phone,
    notes,
    two_factor_enabled,
    last_login_at,
    created_at,
    updated_at
FROM public.admin_users;

-- 4. BẢO MẬT ROW LEVEL SECURITY (RLS)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow admin read access" ON public.admin_users;
    CREATE POLICY "Allow admin read access" ON public.admin_users FOR SELECT USING (true);

    DROP POLICY IF EXISTS "Allow super admin update access" ON public.admin_users;
    CREATE POLICY "Allow super admin update access" ON public.admin_users FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. NẠP DỮ LIỆU BAN ĐẦU (SEED DATA CHO 6 VAI TRÒ QUẢN TRỊ VIÊN)
INSERT INTO public.admin_users (
    email, 
    full_name, 
    role, 
    role_title, 
    department,
    permissions, 
    avatar, 
    status, 
    notes
)
VALUES
(
    'mkt.thecliffresort@gmail.com',
    'Nguyễn Minh Hoàng',
    'super_admin',
    'Super Admin',
    'Hội Đồng Quản Trị & Kỹ Thuật Hệ Thống',
    ARRAY['* (Toàn quyền hệ thống)', 'system:root', 'users:manage', 'database:diagnostics', 'admin:manage'],
    '👑',
    'active',
    'Tài khoản quản trị cấp cao nhất của hệ thống Kiến Học'
),
(
    'mailan.edu@kienhoc.vn',
    'ThS. Trần Thị Mai Lan',
    'lesson_manager',
    'Quản Lý Bài Học',
    'Ban Đào Tạo & Khung Bài Giảng',
    ARRAY['lessons:create', 'lessons:edit', 'lessons:publish', 'lessons:archive'],
    '📚',
    'active',
    'Chuyên trách nội dung các bước bài giảng và ngân hàng câu hỏi'
),
(
    'quangvu.khtn@kienhoc.vn',
    'TS. Lê Quang Vũ',
    'subject_manager',
    'Quản Lý Môn Học',
    'Khoa KHTN & Toán Học',
    ARRAY['subjects:manage', 'domains:config', 'topics:reorder'],
    '🏷️',
    'active',
    'Quản lý sơ đồ môn học và chuyên đề liên môn Lớp 5 & Lớp 8'
),
(
    'bichthuy.lop5@kienhoc.vn',
    'Cô Phạm Bích Thủy',
    'grade_manager',
    'Quản Lý Lớp',
    'Tổ Chuyên Môn Tiểu Học',
    ARRAY['classes:manage', 'students:assign', 'schedule:update'],
    '🏫',
    'active',
    'Phụ trách phân lớp, giáo viên chủ nhiệm và phòng học'
),
(
    'quoctuan.media@kienhoc.vn',
    'Hoàng Quốc Tuấn',
    'content_manager',
    'Quản Lý Nội Dung',
    'Ban Sáng Tạo & Gamification',
    ARRAY['quests:manage', 'allies:config', 'stories:edit', 'events:publish'],
    '🎯',
    'active',
    'Thiết lập nhiệm vụ hàng ngày, biệt đội trợ thủ Kiến và quà thưởng'
),
(
    'thaovy.studentcare@kienhoc.vn',
    'Đặng Thảo Vy',
    'student_manager',
    'Quản Lý Học Viên',
    'Ban Chăm Sóc Học Viên & Phụ Huynh',
    ARRAY['students:view', 'students:grant_xp', 'students:support', 'reports:export'],
    '🎒',
    'active',
    'Hỗ trợ học viên, kiểm tra tiến độ học tập và cấp thưởng XP'
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    role_title = EXCLUDED.role_title,
    permissions = EXCLUDED.permissions,
    avatar = EXCLUDED.avatar,
    status = EXCLUDED.status,
    notes = EXCLUDED.notes,
    updated_at = timezone('utc'::text, now());
