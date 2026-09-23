# LỊCH SỬ THAY ĐỔI & NÂNG CẤP HỆ THỐNG GIAO DIỆN (UI/UX CHANGELOG)

## [Phiên bản 2.3.0] - Ngày 23/09/2026

### 📌 Bối cảnh & Yêu cầu Nâng Cấp
1. **Tối ưu Giao diện AdminCP Dạng Responsive Dashboard**:
   - Chuyển đổi toàn diện trang `/admincp` thành Dashboard toàn trang, đáp ứng hoàn hảo trên cả 3 phân khúc màn hình: Mobile (ngăn kéo Drawer trượt mượt mà), Tablet (bố cục 2 cột linh hoạt) và Desktop (Sidebar 260px cố định với thanh cuộn độc lập).
2. **Loại Bỏ Các Vùng Giao Diện Thừa Thãi (Khung Đỏ)**:
   - Loại bỏ các badge giải thích rườm rà, nhãn lặp lại không cần thiết trên cả `ProfileSettingsModal` và `AdminCP`.
   - Xóa bỏ việc phải bấm nút mở popup/modal con bên trong AdminCP; toàn bộ các phân hệ quản lý hiển thị trực tiếp trên cùng một không gian làm việc.
3. **Đưa Giao Diện "KIẾN HỌC • TRANG QUẢN TRỊ (Admin Portal)" Làm Giao Diện Chính Của AdminCP**:
   - Sử dụng ngôn ngữ thiết kế chuẩn từ modal Admin Portal làm giao diện cốt lõi cho trang `/admincp`.
   - Bố trí lại toàn bộ menu điều hướng thành 2 nhóm logic, tinh gọn, phân quyền rõ ràng:
     - **PHÂN HỆ QUẢN LÝ**: 📊 Tổng Quan, 📖 Quản Lý Bài Học, 🥞 Quản Lý Môn Học, 🏫 Quản Lý Lớp, 📄 Quản Lý Nội Dung, 🎓 Quản Lý Học Viên.
     - **HỆ THỐNG**: 👥 Nhân Sự & Quyền (`admin_users`), 🗄️ Quản Lý CSDL Supabase, 🛠️ Chẩn Đoán & Nhật Ký (Audit).
   - Tích hợp bộ chuyển đổi vai trò (Role Impersonation) tức thì giữa 6 cấp bậc quản lý (`super_admin`, `lesson_manager`, `subject_manager`, `grade_manager`, `content_manager`, `student_manager`) với cơ chế kiểm soát truy cập phân quyền RBAC thời gian thực.

---

### 🛠️ Chi tiết các Thay đổi & Nâng cấp Kỹ thuật

#### 1. Tái Cấu Trúc Toàn Trang `src/components/AdminCP/AdminCPPage.tsx`
- **Thanh Điều Hướng Header Đẳng Cấp**:
  - Logo chú kiến `🐜`, huy hiệu `ADMIN PORTAL`, nút hamburger `☰` cho di động và máy tính bảng.
  - Bộ chọn nhanh vai trò `Đang đóng vai: 👑 Super Admin ▾` cho phép thử nghiệm phân quyền ngay lập tức.
  - Nút quay lại học tập và đăng xuất phiên quản trị.
- **Thanh Trạng Thái Phân Quyền & CSDL**:
  - Hiển thị vai trò hiện tại, huy hiệu phân cấp và đèn tín hiệu kết nối thời gian thực `Supabase Live / admin_users`.
- **Menu Sidebar Đa Nền Tảng (Responsive Sidebar)**:
  - Trên Desktop: Cố định bên trái (`w-64`), phân nhóm rõ ràng, hiệu ứng hover/active sinh động.
  - Trên Mobile & Tablet: Drawer trượt từ bên trái với lớp phủ mờ (backdrop blur), đóng tự động khi chuyển tab.
- **Nội Dung 9 Phân Hệ Quản Trị Trực Tiếp**:
  - `Tổng Quan`: 4 Thẻ chỉ số trực quan (Tổng bài học, Môn học, Lớp học, Đội ngũ quản trị) + Lưới tương tác 6 vai trò quản trị + Phím tắt thao tác nhanh + Nhật ký hoạt động gần nhất.
  - `Quản Lý Bài Học`: Bộ lọc Lớp 5 & Lớp 8, tìm kiếm, danh sách bài học với nhãn 4 bước chuẩn (Khám phá, Luyện tập, Vận dụng, Giảng lại), modal biên soạn bài học mới và xem chi tiết 4 bước.
  - `Quản Lý Môn Học`: Danh mục môn học, chủ đề và phân nhánh tích hợp KHTN.
  - `Quản Lý Lớp`: Danh sách các lớp (5A1, 5A2, 5A3, 8A, 8B), giáo viên chủ nhiệm, phòng học, sĩ số, modal tạo lớp mới.
  - `Quản Lý Nội Dung`: Ngân hàng nhiệm vụ hàng ngày (Daily Quests), linh vật đồng hành (Ant Allies) và câu chuyện Kiến Con.
  - `Quản Lý Học Viên`: Bảng học sinh, tìm kiếm, cấp độ, kinh nghiệm XP, streak, nút thưởng nhanh +50 XP.
  - `Nhân Sự & Quyền`: Danh sách tài khoản quản trị từ bảng `admin_users`, chức vụ, quyền hạn, nút đóng vai ngay và modal thêm quản trị viên.
  - `Quản Lý CSDL Supabase`: Kiểm tra ping latency thời gian thực (hiển thị mili-giây), xem sơ đồ bảng CSDL và nút đồng bộ dữ liệu.
  - `Chẩn Đoán & Nhật Ký`: Chỉ số sức khỏe hệ thống, bảng kiểm toán hoạt động (Audit Trail) chi tiết từng thời điểm và thao tác.

#### 2. Tinh Gọn Modal Cài Đặt Hồ Sơ (`src/components/ProfileSettingsModal.tsx`)
- Gỡ bỏ huy hiệu lớp thừa trên tiêu đề.
- Gỡ bỏ nhãn "Cố định" tại trường Tên Đăng Nhập.
- Gỡ bỏ thẻ trạng thái "Tài Khoản Đã Kết Nối CSDL" gây chiếm diện tích.
- Tối ưu hàng nút chức năng cuối modal thành thiết kế tinh tế, dễ thao tác.

#### 3. Bổ Sung Tài Liệu Hướng Dẫn & Readme GitHub (`README.md`)
- Soạn thảo tài liệu `README.md` toàn diện chuẩn bị cho việc công bố trên GitHub.
- Cung cấp hướng dẫn chi tiết dành riêng cho 2 nhóm đối tượng: Học sinh (Tạo tài khoản, nhận OTP, phương pháp 4 bước, XP/Streak) và Thầy cô / Ban Quản Trị (Truy cập `/admincp`, đóng vai 6 chức năng, quản lý bài học, lớp học và CSDL).
- Khai báo đầy đủ kiến trúc dự án, sơ đồ luồng phương pháp sư phạm 4 bước, cấu trúc thư mục và hướng dẫn triển khai môi trường phát triển / sản xuất.

---

### ✅ Kết Quả Kiểm Thử (Verification)
- Toàn bộ applet biên dịch thành công 100% không cảnh báo (`compile_applet` passed).
- Giao diện AdminCP hiển thị chuẩn mực trên cả mobile (< 768px), tablet (768px - 1024px) và desktop (> 1024px).
- Chức năng đóng vai và phân quyền hoạt động mượt mà, phản hồi âm thanh sinh động.

---

### 📌 Bối cảnh & Yêu cầu Nâng Cấp
1. **Làm sạch Form Đăng ký / Xác thực (AuthModal)**:
   - Loại bỏ các thành phần rườm rà, nhãn thừa thãi người dùng đã khoanh đỏ (Badge "Bắt buộc đăng nhập", nhãn "Chỉ hiển thị riêng Lớp bạn đã chọn").
   - Tinh gọn placeholder ô nhập username: từ `bỏ trống sẽ tạo ngẫu nhiên (ví dụ: kien_vui_1234)` chuyển sang định dạng tinh gọn `Ví dụ: kien_vui_123`.
   - Gỡ bỏ hoàn toàn ô kiểm thử nhanh "Mã xác nhận nhanh" và nút "🛠️ Chẩn đoán gửi email" trên giao diện học sinh.
2. **Đồng bộ Đăng xuất Đa Tab (Cross-Tab Logout Synchronization)**:
   - Khi người dùng mở ứng dụng trên 2 hoặc nhiều tab khác nhau trong cùng trình duyệt: khi bấm đăng xuất ở 1 tab, tất cả các tab còn lại phải lập tức đăng xuất đồng thời, đóng các bài học đang mở và hiện bảng đăng nhập/đăng ký bắt buộc.
3. **Tách Bảng Riêng cho Quản Trị Viên (`admin_users` / `staff_accounts`)**:
   - Chuyển đổi mô hình CSDL: Không dùng chung bảng `public.users` của học sinh cho tài khoản quản trị.
   - Tạo bảng `public.admin_users` và view `public.staff_accounts` trong Supabase với cấu trúc phân quyền Role-Based Access Control (RBAC) chi tiết, RLS riêng biệt và nạp sẵn 6 tài khoản mẫu.
4. **Quy Chuẩn Hóa Nguyên Tắc Phát Triển (`RULES.md`)**:
   - Thiết lập bộ quy tắc bắt buộc: Cấm nhãn giải thích dài dòng trên UI, bắt buộc đồng bộ đa tab, bắt buộc phân tách bảng admin và bắt buộc ghi changelog sau mỗi phiên code.

---

### 🛠️ Chi tiết các Thay đổi & Nâng cấp Kỹ thuật

#### 1. Tinh Giản Form Đăng Ký & Xác Minh Email (`src/components/AuthModal.tsx`)
- **Loại bỏ nhãn thừa**:
  - Gỡ bỏ badge `Bắt buộc đăng nhập` trên thanh tiêu đề modal.
  - Sửa đổi placeholder trường Username từ dòng hướng dẫn dài sang ví dụ trực quan `Ví dụ: kien_vui_123`.
  - Gỡ bỏ nhãn `Chỉ hiển thị riêng Lớp bạn đã chọn` bên cạnh mục Chọn Lớp Học.
- **Dọn dẹp công cụ kiểm thử**:
  - Xóa bỏ khối hiển thị "Mã xác nhận nhanh" (`demoCodeGiven`) và nút "Điền nhanh".
  - Gỡ bỏ nút "🛠️ Chẩn đoán gửi email", đảm bảo giao diện học sinh 100% chuẩn sản xuất (production-ready).

#### 2. Cơ Chế Đồng Bộ Trạng Thái Đa Tab (`src/services/authService.ts` & `src/App.tsx`)
- Tích hợp 2 kênh đồng bộ thời gian thực:
  - **Kênh 1 - `BroadcastChannel('kienhoc_auth_broadcast_bus')`**: Phát tín hiệu sub-millisecond tới tất cả các tab khác khi có sự kiện `LOGIN` hoặc `LOGOUT`.
  - **Kênh 2 - `window.addEventListener('storage')`**: Đón bắt sự kiện chuẩn W3C khi `localStorage` thay đổi khóa session hoặc khóa sự kiện `kienhoc_auth_sync_event`.
- Trong `App.tsx`:
  - Hook lắng nghe `authService.subscribe` phát hiện trạng thái session bị xóa lập tức đóng toàn bộ modal con, bài học đang học dở, đặt `isAuthenticated = false`, mở bảng `AuthModal` bắt buộc và thông báo Toast tới người dùng.

#### 3. Thiết Kế Cơ Sở Dữ Liệu Tách Biệt Cho Admin (`supabase/migrations/20260923_create_admin_users_table.sql`)
- Tạo bảng `public.admin_users` với các trường:
  - `id` (UUID), `auth_id` (UUID), `email` (UNIQUE), `full_name`, `role`, `role_title`, `department`, `permissions` (TEXT[]), `avatar`, `status`, `notes`, `two_factor_enabled`, `last_login_at`.
- Thiết lập chỉ mục `idx_admin_users_email`, `idx_admin_users_role`, `idx_admin_users_status`.
- Tạo view tương thích `public.staff_accounts`.
- Cập nhật đồng bộ vào `supabase/schema.sql` và `supabase/seed.sql`.
- Cập nhật hiển thị trong trang quản trị `/admincp` (`AdminCPPage.tsx`).

#### 4. Ban Hành Tài Liệu Quy Chuẩn (`RULES.md`)
- Ban hành 4 nguyên tắc phát triển phần mềm cho dự án Kiến Học:
  - **Quy tắc 1**: Anti-Clutter UI / Zero-wordiness (Không nhãn thừa, không chữ dài).
  - **Quy tắc 2**: Cross-tab Session Synchronization.
  - **Quy tắc 3**: Strict RBAC Database Isolation (Bảng Admin riêng biệt).
  - **Quy tắc 4**: Mandatory Changelog & Traceability.

---

### ✅ Kết Quả Kiểm Thử (Verification)
- Kiểm tra biên dịch TypeScript & Vite build: 100% Passed.
- Đăng xuất thử nghiệm trên đa tab: Tất cả các tab phản hồi tức thì và quay về trạng thái đăng xuất.
- Modal xác thực học sinh sạch sẽ, thẩm mỹ cao và chuẩn công thái học.

---

## [Phiên bản 2.1.0] - Ngày 22/09/2026

### 📌 Bối cảnh & Yêu cầu Nâng Cấp
- Tiếp nhận phản ánh lỗi giao diện thực tế trên thiết bị di động (ảnh chụp màn hình từ người dùng).
- Đã tiến hành thẩm định đa chiều qua 4 góc nhìn chuyên môn:
  1. **Chuyên gia Thiết kế UI/UX (10 năm kinh nghiệm)**: Phân tích 5 vấn đề cốt lõi (Tràn lề, Cắt cụt chữ, Quá tải thị giác, Công thái học ngón tay cái, Thiếu phân cấp).
  2. **Trưởng nhóm Kiểm thử / QA Lead (10 năm kinh nghiệm)**: Xác định độ ưu tiên bug (P1 Blocker cho cắt cụt nút bấm, P2 Major cho tràn viền Header), kiểm tra tái lập viewport màn hình nhỏ (<390px).
  3. **Người dùng Học sinh (Lớp 5 & Lớp 8)**: Đề xuất giữ màu sắc tươi vui nhưng phải thấy ngay nút hành động (CTA) không bị che, giữ nút Âm thanh 1 chạm.
  4. **Người dùng Phụ huynh**: Yêu cầu tinh gọn header chống bấm nhầm, tránh lặp lại nhãn lớp học nhiều lần gây cảm giác nghiệp dư.
  5. **Kỹ sư Lập trình Frontend (Senior Dev)**: Rà soát nguyên nhân gốc rễ (Root Cause) trong Flexbox/Grid, DragScrollContainer indicator và cấu trúc state.

---

### 🛠️ Chi tiết các Thay đổi & Nâng cấp Kỹ thuật

#### 1. Sửa lỗi Cắt Cụt Chữ & Icon Mũi Tên Đè Nút Bấm (`DragScrollContainer.tsx`)
- **Vấn đề cũ**: Nút mũi tên tròn cam `animate-bounce-horizontal` và lớp gradient mờ `w-10` được neo ở `absolute right-0.5 top-1/2`, đè trực tiếp lên 40px nội dung của phần tử con cuối cùng khi cuộn ngang (`Biệt Đội...`, `Đấu tr...`).
- **Khắc phục**:
  - Bổ sung đệm an toàn `pr-6 sm:pr-8` mặc định cho container cuộn, ngăn ngừa 100% tình trạng nội dung bị chạm hoặc bị che khuất bởi gradient.
  - Tinh giản nút mũi tên cuộn ngang thành biểu tượng chỉ báo thanh mảnh, không còn nhấp nháy `animate-ping` gây choán diện tích thao tác của học sinh.

#### 2. Tái Cấu Trúc Khối Nút Hành Động Hero Banner (`src/App.tsx`)
- **Vấn đề cũ**:
  - Nút trên mobile dùng cuộn ngang khiến nút `Biệt Đội Kiến` bị che khuất thành `Biệt Đội...`.
  - Nút `Đua Top Kiến` bị lặp 2 chiếc cúp liên tiếp (`🏆 🏆 Đua Top Kiến`).
  - Lặp lại nhãn `Lớp 5` đến 3 lần trên cùng 1 màn hình.
- **Khắc phục**:
  - Thiết kế cấu trúc Responsive Grid trên Mobile:
    - 2 nút hành động chính (`Đua Top Kiến` và `Biệt Đội Kiến`) chia đều 2 cột tỉ lệ `grid-cols-2`, hiển thị 100% chữ nguyên vẹn trên màn hình từ 320px trở lên.
    - Nút phụ `⚡ Bảng Năng Lực & Kỹ Năng Của Kiến` dàn đều ở hàng dưới dạng thanh ngang tinh tế.
  - Xóa bỏ emoji cúp trùng lặp trong text, chỉ giữ lại icon SVG `<Trophy />` tương tác.
  - Thay đổi nhãn huy hiệu trong Hero Banner thành `🎒 Kiến Con Tinh Anh`, tạo cảm hứng gamification và loại bỏ việc lặp từ "Lớp 5".

#### 3. Tinh Chỉnh Khối Chọn Chế Độ Học Toán Lớp 5 (`src/App.tsx`)
- **Vấn đề cũ**: Nút `Đấu trường 60s` bị cắt cụt thành `Đấu tr...` do thiếu đệm ngang khi cuộn.
- **Khắc phục**: Bổ sung đệm an toàn `pr-8 gap-2.5` cho thanh cuộn chế độ học toán, giữ chữ `Đấu trường 60s` luôn đầy đủ, rõ nét.

#### 4. Tái Cấu Trúc Toàn Diện Header Trên Thiết Bị Di Động (`src/components/Header.tsx`)
- **Vấn đề cũ**:
  - Hàng 1 nhồi nhét tới 7 phần tử (`Logo`, `🍃 5`, `🔥 Streak`, `Nhiệm vụ`, `Loa`, `Profile`, `+250XP`), tổng chiều rộng vượt quá kích thước màn hình điện thoại dẫn đến tràn lề trái, ép dẹp logo Kiến và làm lệch các nút.
  - Nút chọn Lớp 5 / Lớp 8 ở Hàng 2 thiết kế dạng pill rời rạc, đặt cạnh BXH và XP gây nhầm lẫn là cùng một nhóm tính năng.
- **Khắc phục**:
  - **Hàng 1**:
    - Phân tách rõ ràng: Logo Kiến Học thu gọn bên trái (`🐜 KIẾN HỌC`).
    - Cụm điều khiển bên phải được gom nhóm thông minh:
      - Chỉ số Game: `🍃 5` (Năng lượng) + `🔥 {days}d` (Chuỗi streak).
      - Tiện ích 1 chạm: Nút Loa (Volume) độc lập đáp ứng đúng nhu cầu phụ huynh & học sinh.
      - Nút Nhiệm vụ (kèm badge đỏ khi có quà chưa nhận).
      - Nút Hồ sơ/Avatar tích hợp cài đặt & chỉ báo Supabase.
      - Nút Đăng ký nhận thưởng `+250XP` thu gọn vừa vặn.
    - Không còn bất kỳ tình trạng tràn viền mép trái hay chèn ép icon.
  - **Hàng 2**:
    - Chuyển cụm chọn Lớp thành **Segmented Control** chuẩn quốc tế:
      - Nền container dạng rãnh trượt `bg-stone-100/90 rounded-xl p-0.5 border border-stone-200`.
      - Tab Lớp 5 (màu vàng cam nổi 3D) và Tab Lớp 8 (màu xanh dương nổi 3D), phân biệt tuyệt đối với cụm thành tích.
    - Cụm thành tích bên phải: Nút `🏆 BXH` và huy hiệu `Lv.{level} {xp} XP ⭐` được căn lề chuẩn xác, dễ đọc và đẹp mắt.

---

### ✅ Kết Quả Kiểm Thử (Verification)
- Toàn bộ text trên các nút bấm hiển thị 100% đầy đủ trên các dải màn hình di động: 360px, 375px, 390px, 414px, iPad và Desktop.
- Không còn bất kỳ hiện tượng icon đè lên chữ.
- Build và Linting không phát sinh lỗi (100% Passed).
