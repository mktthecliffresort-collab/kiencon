# NGUYÊN TẮC PHÁT TRIỂN & QUY CHUẨN HỆ THỐNG (PROJECT RULES & STANDARDS)
**Dự án**: Kiến Học (Ant Universe) - Ứng dụng Học tập Toàn diện Lớp 5 & Lớp 8  
**Áp dụng bắt buộc**: Cho mọi phiên lập trình, nâng cấp tính năng, bảo trì cơ sở dữ liệu và tinh chỉnh giao diện.

---

## 📌 QUY TẮC 1: QUY CHUẨN GIAO DIỆN TINH GỌN (ANTI-CLUTTER & ZERO-WORDINESS UI)

### 1.1. Mục tiêu
Giao diện ứng dụng hướng đến đối tượng học sinh Tiểu học & THCS (Lớp 5 & Lớp 8) cùng các bậc phụ huynh. Yêu cầu cao nhất là **Trực quan - Sạch sẽ - Thao tác 1 chạm - Không gây nhiễu thị giác**.

### 1.2. Các điều cấm tuyệt đối
1. **Không thêm các huy hiệu / nhãn giải thích hiển nhiên hoặc dài dòng**:
   - ❌ CẤM: `"Bắt buộc đăng nhập"`, `"Hệ thống tự động đồng bộ"`, `"Chỉ hiển thị riêng Lớp bạn đã chọn"`, `"Tính năng dành cho tài khoản hợp lệ"`.
   - ✅ THAY THẾ: Thiết kế trạng thái modal chặn tương tác nền tự nhiên, không cần gắn thêm nhãn thừa.
2. **Không dùng placeholder hướng dẫn dài dòng**:
   - ❌ CẤM: `placeholder="bỏ trống sẽ tạo ngẫu nhiên (ví dụ: kien_vui_1234)"`.
   - ✅ THAY THẾ: `placeholder="Ví dụ: kien_vui_123"` hoặc văn bản ngắn gọn dưới 20 ký tự.
3. **Không để lộ mã kiểm thử hoặc công cụ kỹ thuật ra giao diện học sinh**:
   - ❌ CẤM: Mã điền nhanh OTP (`"Mã xác nhận nhanh: 543475 [Điền nhanh]"`), nút `"🛠️ Chẩn đoán gửi email"`, thông số console/telemetry.
   - ✅ THAY THẾ: Mọi công cụ chẩn đoán, test DB, kiểm tra mail phải nằm hoàn toàn trong `/admincp`.

---

## 📌 QUY TẮC 2: ĐỒNG BỘ PHIÊN ĐĂNG NHẬP / ĐĂNG XUẤT ĐA TAB (CROSS-TAB SYNC)

### 2.1. Mục tiêu
Người dùng mở ứng dụng trên nhiều tab khác nhau trong cùng một trình duyệt phải có trải nghiệm đồng nhất và an toàn.

### 2.2. Quy chuẩn kỹ thuật bắt buộc
1. **Đồng bộ Đăng Xuất (Simultaneous Logout)**:
   - Khi người dùng bấm **Thoát tài khoản (Sign Out)** ở bất kỳ tab nào:
     - Toàn bộ các tab khác trên cùng trình duyệt phải **lập tức phát hiện và đăng xuất đồng thời trong vòng dưới 100ms**.
     - Đóng ngay các modal nhạy cảm, bài học đang học dở và hiển thị hộp thoại Đăng nhập/Đăng ký bắt buộc.
2. **Cơ chế triển khai**:
   - Phối hợp đa tầng:
     1. Kênh **`BroadcastChannel('kienhoc_auth_broadcast_bus')`** cho các trình duyệt hiện đại.
     2. Sự kiện chuẩn **`window.addEventListener('storage', ...)`** với `AUTH_SESSION_KEY` và `kienhoc_auth_sync_event` để đảm bảo 100% tương thích trình duyệt.
   - Dịch vụ trung tâm: `authService.ts` chịu trách nhiệm phát sóng (`broadcastEvent`) và tiếp nhận thông điệp, sau đó gọi `notify()` tới tất cả subscribers trong ứng dụng.

---

## 📌 QUY TẮC 3: PHÂN TÁCH BẢNG CSDL QUẢN TRỊ VIÊN & HỌC SINH (RBAC ISOLATION)

### 3.1. Mục tiêu
Bảo mật cơ sở dữ liệu cấp độ doanh nghiệp, ngăn chặn triệt để nguy cơ tấn công leo thang đặc quyền (Privilege Escalation).

### 3.2. Quy chuẩn cấu trúc dữ liệu
1. **Bảng học sinh (`public.users`)**:
   - Chỉ lưu trữ thông tin học tập, Gamification: họ tên, email, phone, lớp (5/8), avatar, XP hạt đường, streak, level, tiến độ môn học.
   - Tuyệt đối **không** dùng cột `role` trong bảng `users` để cấp quyền quản trị hệ thống.
2. **Bảng quản trị riêng biệt (`public.admin_users` / view `public.staff_accounts`)**:
   - Tách riêng biệt 100% thành bảng độc lập.
   - Lưu trữ: `role` (super_admin, lesson_manager, subject_manager, grade_manager, content_manager, student_manager), `role_title`, `department`, `permissions` (mảng phân quyền chi tiết), `notes`, `two_factor_enabled`.
   - Áp dụng chính sách **Row Level Security (RLS)** nghiêm ngặt riêng.
   - Cổng truy cập quản trị phải nằm ở đường dẫn riêng `/admincp`, yêu cầu xác thực độc lập.

---

## 📌 QUY TẮC 4: BẮT BUỘC GHI NHẬT KÝ THAY ĐỔI (MANDATORY CHANGELOG & TRACEABILITY)

### 4.1. Quy định bắt buộc
Sau **MỖI PHIÊN LẬP TRÌNH HOẶC CHỈNH SỬA CODE**, lập trình viên/AI Assistant bắt buộc phải cập nhật tệp `CHANGELOG.md`.

### 4.2. Cấu trúc tiêu chuẩn cho mỗi phiên cập nhật:
```markdown
## [Phiên bản X.Y.Z] - Ngày DD/MM/YYYY

### 📌 Bối cảnh & Yêu cầu
- Mô tả yêu cầu từ người dùng và phân tích vấn đề.

### 🛠️ Chi tiết các Thay đổi & Nâng cấp Kỹ thuật
- Mục 1: ...
- Mục 2: ...

### 🗄️ Cập nhật Cơ sở Dữ liệu & Schema (nếu có)
- Migration SQL: ...
- Bảng mới: ...

### ✅ Kết Quả Kiểm Thử (Verification)
- Trạng thái biên dịch (Compile/Lint).
- Kết quả kiểm tra chức năng đa màn hình/đa tab.
```
