-- ==============================================================================
-- KIẾN HỌC (ANT UNIVERSE) - SEED DATA CHO KIẾN TRÚC MỚI 2.0
-- Nạp dữ liệu ban đầu cho: courses, topics, lessons, lesson_steps, questions, quests, users
-- ==============================================================================

-- 1. NẠP DỮ LIỆU KHÓA HỌC (COURSES)
INSERT INTO public.courses (id, grade_level, subject, title, color_theme, icon, description, sort_order)
VALUES 
  ('toan_5', 5, 'Toán học', 'Toán Học Khám Phá Lớp 5', 'amber', '📐', 'Làm chủ Phân số, Số thập phân, Hình học và Chuyển động đều theo phương pháp trực quan', 1),
  ('khoa_hoc_5', 5, 'Khoa học', 'Khoa Học Tự Nhiên & Đời Sống Lớp 5', 'emerald', '🔬', 'Khám phá thế giới tự nhiên, năng lượng, con người và sức khỏe', 2),
  ('lich_su_dia_li_5', 5, 'Lịch sử & Địa lí', 'Lịch Sử & Địa Lí Việt Nam Lớp 5', 'rose', '🧭', 'Hành trình khám phá non sông gấm vóc và các mốc son lịch sử hào hùng', 3),
  ('khtn_8', 8, 'Khoa học tự nhiên', 'Khoa Học Tự Nhiên Lớp 8 Tích Hợp', 'sky', '⚛️', 'Tích hợp Vật lí (Cơ - Nhiệt), Hóa học (Phản ứng - Định luật) và Sinh học (Cơ thể người)', 1),
  ('toan_8', 8, 'Toán học', 'Toán Học Nâng Cao Lớp 8', 'purple', '📏', 'Hình học biến hình, định lý Thales, phương trình và đa thức phân thức', 2),
  ('tieng_anh_8', 8, 'Tiếng Anh', 'Tiếng Anh Giao Tiếp & Học Thuật Lớp 8', 'teal', '🌍', 'Rèn luyện 4 kỹ năng: Nghe, Nói, Đọc, Viết và Phát âm chuẩn IPA', 3)
ON CONFLICT (id) DO UPDATE SET 
  title = EXCLUDED.title,
  color_theme = EXCLUDED.color_theme,
  icon = EXCLUDED.icon;

-- 2. NẠP DỮ LIỆU CHỦ ĐỀ (TOPICS)
INSERT INTO public.topics (id, course_id, title, order_index, description, icon)
VALUES
  ('so_thap_phan', 'toan_5', 'Số Thập Phân & Các Phép Tính', 1, 'Khái niệm, so sánh, cộng trừ nhân chia số thập phân', '🔢'),
  ('hinh_hoc_do_luong', 'toan_5', 'Hình Học & Đo Lường Thực Tế', 2, 'Diện tích tam giác, hình thang, hình tròn và thể tích', '📐'),
  ('ap_suat_co_hoc', 'khtn_8', 'Áp Suất & Lực Cơ Học', 1, 'Áp lực, áp suất chất rắn, chất lỏng và định luật Bernoulli', '💨'),
  ('phan_ung_hoa_hoc', 'khtn_8', 'Phản Ứng Hóa Học & Mol', 2, 'Hiện tượng hóa học, định luật bảo toàn khối lượng và phương trình', '🧪')
ON CONFLICT (id) DO NOTHING;

-- 3. BÀI HỌC (LESSONS)
INSERT INTO public.lessons (id, topic_id, course_id, title, subtitle, order_index, is_premium, estimated_minutes, xp_reward, mascot_ally_id)
VALUES
  ('lesson_math_5_decimals', 'so_thap_phan', 'toan_5', 'Phép Chia Số Thập Phân Cho Số Tự Nhiên', 'Chia đều thức ăn trong tổ kiến và tính toán khẩu phần chính xác', 1, false, 15, 60, 'ant_logic'),
  ('lesson_khtn_8_pressure', 'ap_suat_co_hoc', 'khtn_8', 'Áp Suất Chất Rắn & Ứng Dụng Xe Đạp Cát', 'Tại sao lốp to đi trên cát không lún còn lốp mỏng lại lún sâu?', 1, false, 18, 70, 'ant_physic')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  estimated_minutes = EXCLUDED.estimated_minutes,
  xp_reward = EXCLUDED.xp_reward;

-- 4. BÀI HỌC ĐỘNG (LESSON STEPS - 1-N RELATION)
-- Chứng minh kiến trúc linh hoạt: Bài toán 5 có 4 bước chuẩn, có thể mở rộng tùy biến
INSERT INTO public.lesson_steps (lesson_id, step_type, step_title, order_index, content, xp_reward, time_estimate_mins)
VALUES
  (
    'lesson_math_5_decimals',
    'kham_pha',
    'Khám Phá: Chia Bánh Thập Phân',
    1,
    '{"storyTitle": "Bữa Tiệc Mật Của Kiến Trưởng", "story": "Kiến Trưởng có 4.8ml mật hoa và muốn chia đều cho 4 chú kiến con...", "prompt": "Mỗi chú kiến nhận được bao nhiêu ml mật?", "keyObservation": "Chia phần nguyên trước, đặt dấu phẩy vào thương rồi tiếp tục chia phần thập phân."}'::jsonb,
    15,
    4
  ),
  (
    'lesson_math_5_decimals',
    'luyen_tap',
    'Luyện Tập: Đặt Tính & Tính Nhẩm',
    2,
    '{"type": "interactive_choice", "instructions": "Thực hiện phép tính 12.6 : 3 và chọn kết quả đúng", "hint": "12 chia 3 bằng 4, hạ dấu phẩy, 6 chia 3 bằng 2"}'::jsonb,
    15,
    5
  ),
  (
    'lesson_math_5_decimals',
    'van_dung',
    'Vận Dụng: Thử Thách Chia Đều Lương Thực',
    3,
    '{"situation": "Một đoạn đường hầm dài 15.5m cần đặt 5 trạm đèn bảo vệ cách đều nhau...", "question": "Khoảng cách giữa các trạm đèn liên tiếp là bao nhiêu mét?"}'::jsonb,
    15,
    4
  ),
  (
    'lesson_math_5_decimals',
    'giang_lai',
    'Giảng Lại (Teach-Back): Dạy Lại Cho Kiến Nhí',
    4,
    '{"promptTitle": "Giải Thích Quy Tắc Chia Cho Kiến Nhí", "helperPoints": ["Chia phần nguyên", "Đánh dấu phẩy ở thương", "Hạ phần thập phân tiếp tục chia"]}'::jsonb,
    20,
    5
  ),
  -- Bước động cho bài KHTN 8
  (
    'lesson_khtn_8_pressure',
    'kham_pha',
    'Khám Phá: Dấu Chân Trên Cát',
    1,
    '{"storyTitle": "Bí Ẩn Vết Xe Trên Đụn Cát", "prompt": "Tại sao người đi chân đất lún sâu hơn khi mang ván trượt cát?"}'::jsonb,
    15,
    4
  ),
  (
    'lesson_khtn_8_pressure',
    'mo_phong',
    'Mô Phỏng Thực Nghiệm (Sim): Chọn Lốp Xe Bãi Biển',
    2,
    '{"simType": "tire_pressure_sim", "riderWeight": 60, "tires": ["25mm đường trường", "45mm đa dụng", "100mm bánh béo"]}'::jsonb,
    25,
    8
  ),
  (
    'lesson_khtn_8_pressure',
    'van_dung',
    'Vận Dụng: Thiết Kế Móng Nhà Chống Lún',
    3,
    '{"situation": "Tổ kiến xây trên nền đất yếu cần tăng hay giảm diện tích đáy móng?"}'::jsonb,
    20,
    5
  )
ON CONFLICT (lesson_id, order_index) DO UPDATE SET
  content = EXCLUDED.content,
  step_title = EXCLUDED.step_title;

-- 5. NGÂN HÀNG CÂU HỎI TẬP TRUNG (CENTRALIZED QUESTIONS)
INSERT INTO public.questions (
  question_type, usage_context, grade_level, difficulty, content, options, correct_answer, explanation, xp_reward
)
VALUES
  -- Câu hỏi thi & luyện tập (exam & lesson)
  (
    'multiple_choice',
    ARRAY['exam', 'lesson'],
    5,
    'easy',
    '{"question": "Kết quả của phép chia 24.8 : 4 là bao nhiêu?"}'::jsonb,
    '[{"id": "A", "text": "6.2", "isCorrect": true}, {"id": "B", "text": "62", "isCorrect": false}, {"id": "C", "text": "0.62", "isCorrect": false}, {"id": "D", "text": "6.02", "isCorrect": false}]'::jsonb,
    'A',
    'Ta chia 24 cho 4 được 6, viết dấu phẩy, rồi lấy 8 chia 4 được 2. Kết quả là 6.2.',
    10
  ),
  -- Câu hỏi đấu trường phản xạ 60s (arena)
  (
    'multiple_choice',
    ARRAY['arena', 'lesson'],
    5,
    'easy',
    '{"question": "4.5 x 2 bằng bao nhiêu?"}'::jsonb,
    '[{"id": "A", "text": "9", "isCorrect": true}, {"id": "B", "text": "8.5", "isCorrect": false}, {"id": "C", "text": "9.5", "isCorrect": false}, {"id": "D", "text": "8", "isCorrect": false}]'::jsonb,
    'A',
    '4.5 nhân 2 bằng 9.0 = 9.',
    15
  ),
  -- Câu hỏi đố vui thông minh (riddle)
  (
    'riddle',
    ARRAY['riddle'],
    5,
    'medium',
    '{"title": "Đố Vui Cân Thóc Của Kiến Vàng", "story": "Một túi thóc nặng 3.6kg. Chú kiến đem chia thành 3 phần bằng nhau để cất vào 3 kho. Mỗi kho có bao nhiêu kg thóc?"}'::jsonb,
    '[{"id": "A", "text": "1.2 kg", "isCorrect": true}, {"id": "B", "text": "12 kg", "isCorrect": false}, {"id": "C", "text": "0.12 kg", "isCorrect": false}]'::jsonb,
    'A',
    'Lấy 3.6 chia 3 được 1.2 kg.',
    20
  ),
  -- Câu hỏi KHTN 8 (exam & arena)
  (
    'multiple_choice',
    ARRAY['exam', 'arena'],
    8,
    'medium',
    '{"question": "Đơn vị chuẩn đo áp suất trong hệ SI là gì?"}'::jsonb,
    '[{"id": "A", "text": "Pascal (Pa) hoặc N/m²", "isCorrect": true}, {"id": "B", "text": "Newton (N)", "isCorrect": false}, {"id": "C", "text": "Joule (J)", "isCorrect": false}, {"id": "D", "text": "Watt (W)", "isCorrect": false}]'::jsonb,
    'A',
    '1 Pascal (Pa) = 1 N/m² là đơn vị đo áp suất chuẩn trong hệ đo lường quốc tế SI.',
    15
  );

-- 6. NHIỆM VỤ (QUESTS)
INSERT INTO public.quests (id, type, target_action, target_value, xp_reward, title, description, grade_level, icon)
VALUES
  ('quest_daily_lesson_5', 'daily', 'complete_lesson', 1, 30, 'Kiến Chăm Chỉ Lớp 5', 'Hoàn thành trọn vẹn 1 bài học bất kỳ trong ngày', 5, '🐜'),
  ('quest_daily_arena_5', 'daily', 'arena_match', 1, 25, 'Chiến Binh Đấu Trường', 'Tham gia 1 trận đấu trường 60 giây phản xạ toán học', 5, '⚡'),
  ('quest_daily_teachback_5', 'daily', 'teach_back', 1, 35, 'Thầy Giáo Kiến', 'Dạy lại bài học cho Kiến Nhí đạt từ 80 điểm trở lên', 5, '🎓'),
  ('quest_daily_lesson_8', 'daily', 'complete_lesson', 1, 35, 'Nhà Nghiên Cứu Lớp 8', 'Hoàn thành 1 bài thí nghiệm khoa học hoặc toán 8', 8, '🔬')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  xp_reward = EXCLUDED.xp_reward;

-- 7. NGƯỜI DÙNG MẪU (USERS CHO BẢNG XẾP HẠNG & DEMO)
INSERT INTO public.users (id, full_name, nickname, current_grade, avatar, total_xp, streak_days, level)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Nguyễn Minh Anh', 'Kiến Thần Tốc', 5, '🐜', 3420, 14, 12),
  ('00000000-0000-0000-0000-000000000002', 'Trần Bảo Long', 'Kiến Quán Quân', 5, '🐝', 3150, 11, 11),
  ('00000000-0000-0000-0000-000000000003', 'Lê Quỳnh Chi', 'Kiến Tỉ Mỉ', 5, '🦗', 2890, 9, 10),
  ('00000000-0000-0000-0000-000000000004', 'Phạm Gia Huy', 'Kiến Bền Bỉ', 5, '🐞', 2640, 7, 9),
  ('00000000-0000-0000-0000-000000000005', 'Vũ Hoàng Nam', 'Kiến Khoa Học', 8, '🔬', 4120, 18, 15),
  ('00000000-0000-0000-0000-000000000006', 'Đỗ Mai Phương', 'Kiến Đột Phá', 8, '⚡', 3890, 15, 14)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  total_xp = EXCLUDED.total_xp,
  streak_days = EXCLUDED.streak_days;

-- 8. TÀI KHOẢN QUẢN TRỊ VIÊN & NHÂN SỰ CHUYÊN MÔN (ADMIN_USERS / STAFF_ACCOUNTS)
INSERT INTO public.admin_users (email, full_name, role, role_title, department, permissions, avatar, status)
VALUES
  ('mkt.thecliffresort@gmail.com', 'Nguyễn Minh Hoàng', 'super_admin', 'Super Admin', 'Hội Đồng Quản Trị & Kỹ Thuật Hệ Thống', ARRAY['* (Toàn quyền hệ thống)'], '👑', 'active'),
  ('mailan.edu@kienhoc.vn', 'ThS. Trần Thị Mai Lan', 'lesson_manager', 'Quản Lý Bài Học', 'Ban Đào Tạo & Khung Bài Giảng', ARRAY['lessons:create', 'lessons:edit', 'lessons:publish'], '📚', 'active'),
  ('quangvu.khtn@kienhoc.vn', 'TS. Lê Quang Vũ', 'subject_manager', 'Quản Lý Môn Học', 'Khoa KHTN & Toán Học', ARRAY['subjects:manage', 'domains:config'], '🏷️', 'active'),
  ('bichthuy.lop5@kienhoc.vn', 'Cô Phạm Bích Thủy', 'grade_manager', 'Quản Lý Lớp', 'Tổ Chuyên Môn Tiểu Học', ARRAY['classes:manage', 'students:assign'], '🏫', 'active'),
  ('quoctuan.media@kienhoc.vn', 'Hoàng Quốc Tuấn', 'content_manager', 'Quản Lý Nội Dung', 'Ban Sáng Tạo & Gamification', ARRAY['quests:manage', 'allies:config', 'stories:edit'], '🎯', 'active'),
  ('thaovy.studentcare@kienhoc.vn', 'Đặng Thảo Vy', 'student_manager', 'Quản Lý Học Viên', 'Ban Chăm Sóc Học Viên & Phụ Huynh', ARRAY['students:view', 'students:grant_xp', 'students:support'], '🎒', 'active')
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  role_title = EXCLUDED.role_title,
  department = EXCLUDED.department,
  permissions = EXCLUDED.permissions,
  avatar = EXCLUDED.avatar,
  status = EXCLUDED.status;

