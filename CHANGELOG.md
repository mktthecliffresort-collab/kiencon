# LỊCH SỬ THAY ĐỔI & NÂNG CẤP HỆ THỐNG GIAO DIỆN (UI/UX CHANGELOG)

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
