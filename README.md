# 🐜 KIẾN HỌC • Nền Tảng Học Tập Thích Ứng GDPT 2018

> **Hệ thống học tập thích ứng, trò chơi hóa (Gamification) chuẩn chương trình Giáo dục Phổ thông 2018 dành cho học sinh Lớp 5 & Lớp 8 cùng linh vật Chú Kiến thông thái.**

[![React 19](https://img.shields.io/badge/React-19.0.1-blue.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/TailwindCSS-v4.1-38bdf8.svg?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e.svg?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg?logo=google)](https://ai.google.dev/)
[![GDPT 2018](https://img.shields.io/badge/Curriculum-GDPT%202018-emerald.svg)](https://moet.gov.vn/)

---

## 📖 MỤC LỤC
1. [Giới Thiệu Tổng Quan](#-giới-thiệu-tổng-quan)
2. [Các Tính Năng Nổi Bật](#-các-tính-năng-nổi-bật)
3. [Phương Pháp Sư Phạm 4 Bước](#-phương-pháp-sư-phạm-4-bước)
4. [Hướng Dẫn Sử Dụng Cho Người Dùng Mới](#-hướng-dẫn-sử-dụng-cho-người-dùng-mới)
   - [Dành cho Học Sinh](#1-dành-cho-học-sinh)
   - [Dành cho Thầy Cô & Quản Trị Viên (/admincp)](#2-dành-cho-thầy-cô--quản-trị-viên-admincp)
5. [Cấu Trúc Hệ Thống & Cơ Sở Dữ Liệu](#-cấu-trúc-hệ-thống--cơ-sở-dữ-liệu)
6. [Cấu Trúc Thư Mục Dự Án](#-cấu-trúc-thư-mục-dự-án)
7. [Hướng Dẫn Cài Đặt & Phát Triển](#-hướng-dẫn-cài-đặt--phát-triển)
8. [Quy Chuẩn Dự Án & Lịch Sử Nâng Cấp](#-quy-chuẩn-dự-án--lịch-sử-nâng-cấp)

---

## 🌟 GIỚI THIỆU TỔNG QUAN

**Kiến Học** là giải pháp công nghệ giáo dục (EdTech) tiên tiến, áp dụng mô hình vi học tập (Micro-learning) kết hợp cơ chế trò chơi hóa (Gamification) và Trí tuệ Nhân tạo đàm thoại (Socratic AI) nhằm truyền cảm hứng tự học môn **Toán học** và **Khoa học Tự nhiên (KHTN - Vật lí, Hóa học, Sinh học)** cho học sinh khối **Lớp 5** (chuyển cấp tiểu học) và **Lớp 8** (trọng tâm THCS).

Được xây dựng bám sát chuẩn kiến thức & năng lực của **Chương trình Giáo dục Phổ thông 2018 (Bộ GD&ĐT)**, ứng dụng đồng hành cùng học sinh thông qua cốt truyện Vương Quốc Kiến với các linh vật gần gũi: *Kiến Con, Kiến Khám, Kiến Nổ, Kiến Chăm, Kiến Cần*.

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT

### 1. Trải Nghiệm Học Sinh (Student Experience)
- **Chu trình Sư phạm 4 bước khép kín**: Khám phá kiến thức ➔ Luyện tập phản xạ ➔ Vận dụng thực tế ➔ Giảng lại (Teach-back).
- **Hệ thống Gamification cuốn hút**: Điểm kinh nghiệm (XP), cấp độ (Level), chuỗi ngày chuyên cần (Streak), Bộ sưu tập đồng minh kiến (Ant Allies) và Bảng Vàng danh dự.
- **Nhiệm vụ hàng ngày (Daily Quests)**: Thử thách mới mỗi ngày với phần thưởng hấp dẫn giúp xây dựng thói quen tự học bền vững.
- **Tập trung & Trực quan**: Hỗ trợ hiệu ứng âm thanh tương tác sinh động, giao diện tối ưu chống xao nhãng.

### 2. Bảo Mật & Xác Thực Người Dùng Chuẩn Production
- **Bắt buộc Đăng nhập / Đăng ký**: Bảo vệ tiến độ học tập liên tục giữa các thiết bị.
- **Xác thực OTP Email bảo mật**: Gửi mã xác thực qua Email thông qua máy chủ Node/Nodemailer bảo mật.
- **Đồng bộ Đăng xuất Đa Tab tức thì (Cross-Tab Logout Synchronization)**: Kết hợp công nghệ `BroadcastChannel` và W3C `Storage Event`. Khi người dùng đăng xuất trên 1 tab, tất cả các tab khác trên cùng trình duyệt sẽ tự động đăng xuất đồng thời ngay lập tức.

### 3. Cổng Điều Hành Quản Trị `/admincp` (Responsive Admin Dashboard)
- **Thiết kế Responsive 100%**: Hoạt động tối ưu trên mọi kích thước màn hình từ Điện thoại di động (Mobile Drawer trượt), Máy tính bảng (Tablet 2 cột) đến Máy tính bàn (Desktop Sidebar cố định).
- **Cơ chế Phân quyền RBAC 6 Cấp Bậc**:
  1. 👑 **Super Admin (Quản Trị Tối Cao)**: Toàn quyền điều hành mọi phân hệ và nhân sự.
  2. 📚 **Quản Lý Bài Học (Lesson Manager)**: Biên soạn và kiểm duyệt bài học 4 bước.
  3. 🥞 **Quản Lý Môn Học (Subject Manager)**: Quản lý danh mục môn, phân môn KHTN.
  4. 🏫 **Quản Lý Lớp (Grade & Class Manager)**: Quản lý khối lớp, danh sách lớp học và giáo viên phụ trách.
  5. 📄 **Quản Lý Nội Dung (Content Manager)**: Quản trị ngân hàng nhiệm vụ và linh vật Kiến.
  6. 🎓 **Quản Lý Học Viên (Student Manager)**: Theo dõi tiến độ, cấp độ, tặng thưởng điểm XP khích lệ học sinh.
- **Quản lý CSDL Supabase Trực tiếp**: Giám sát độ trễ (Ping Latency ms), kiểm tra sơ đồ bảng và đồng bộ dữ liệu.
- **Kiểm toán Hoạt động (Audit Trail)**: Ghi lại từng thao tác, thời điểm và quản trị viên thực hiện.

---

## 🧩 PHƯƠNG PHÁP SƯ PHẠM 4 BƯỚC

Mỗi bài học trong **Kiến Học** được thiết kế theo chu trình nhận thức chuẩn:

```
┌─────────────────┐       ┌─────────────────┐
│   1. KHÁM PHÁ   │ ────> │  2. LUYỆN TẬP   │
│  Tình huống thực│       │ Câu hỏi phản xạ │
└─────────────────┘       └─────────────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ 4. GIẢNG LẠI    │ <──── │  3. VẬN DỤNG    │
│    (Teach-back) │       │ Thử thách đời   │
└─────────────────┘       └─────────────────┘
```

1. **Bước 1 - Khám Phá**: Đặt học sinh vào câu chuyện thực tế hoặc nghịch lý tư duy trực quan, giúp các em tự suy đoán khái niệm trước khi tiếp nhận công thức.
2. **Bước 2 - Luyện Tập**: Các câu hỏi tương tác nhanh có giải thích chi tiết tức thì giúp củng cố kiến thức nền tảng.
3. **Bước 3 - Vận Dụng**: Tình huống đời sống thực tế đòi hỏi học sinh áp dụng kiến thức để giải quyết bài toán cụ thể.
4. **Bước 4 - Giảng Lại (Teach-back)**: Học sinh đóng vai trò "người thầy", tự tổng hợp và giải thích lại bài học bằng ngôn từ của mình (kỹ thuật Feynman), nhận phản hồi hướng dẫn từ Socratic AI.

---

## 🚀 HƯỚNG DẪN SỬ DỤNG CHO NGƯỜI DÙNG MỚI

### 1. Dành cho Học Sinh

#### Bước 1: Khởi động & Tạo Tài Khoản
1. Truy cập vào ứng dụng trên trình duyệt web.
2. Khi bảng **Đăng Ký Tài Khoản** xuất hiện:
   - **Tên hiển thị (Họ và tên)**: Nhập tên của bạn (Ví dụ: `Minh Khang`).
   - **Chọn Khối Lớp**: Chọn **Lớp 5** hoặc **Lớp 8** tùy theo chương trình học của bạn.
   - **Tên Đăng Nhập (Username)**: Tùy chỉnh tên đăng nhập yêu thích (Ví dụ: `kien_sao_4019`).
   - **Email Học Tập**: Nhập địa chỉ email hợp lệ để nhận mã xác minh.
   - **Mật khẩu**: Tạo mật khẩu bảo mật (tối thiểu 6 ký tự).
3. Bấm **Tiếp Tục Nhận Mã OTP** ➔ Kiểm tra hòm thư Email (hoặc thư mục Spam) để lấy mã xác thực 6 chữ số ➔ Nhập mã để hoàn tất đăng ký và nhận ngay **+250 XP** thưởng khởi động!

#### Bước 2: Khám phá Giao diện Học tập
- **Bản Đồ Bài Học**: Hiển thị các chặng học tập theo từng chương. Bấm vào bài học đang mở để bắt đầu.
- **Thanh Công Cụ Trên Cùng**:
  - 🏆 **Bảng Vàng**: Xem xếp hạng điểm XP trong tuần của toàn bộ học sinh cùng khối lớp.
  - 🎯 **Nhiệm Vụ (Quests)**: Kiểm tra các nhiệm vụ cần hoàn thành trong ngày (ví dụ: *Hoàn thành 1 bài học*, *Đạt chuỗi streak*, *Học liên tục 15 phút*).
  - 🐜 **Đồng Minh Kiến**: Mở khóa các chú kiến trợ thủ tài năng khi tích lũy đủ XP.
  - 👤 **Hồ Sơ Cá Nhân**: Đổi avatar linh vật, cập nhật thông tin cá nhân và quản lý tài khoản.

#### Bước 3: Tham gia Bài học
- Làm lần lượt qua 4 bước: **Khám phá** ➔ **Luyện tập** ➔ **Vận dụng** ➔ **Giảng lại**.
- Thu thập điểm thưởng **XP**, duy trì ngọn lửa **Streak** học đều đặn mỗi ngày!

---

### 2. Dành cho Thầy Cô & Quản Trị Viên (`/admincp`)

Trang quản trị độc lập nằm tại đường dẫn:
```
https://<domain_cua_ban>/admincp
```

#### Bước 1: Đăng Nhập Quản Trị Viên
- Bạn có thể nhập email quản trị viên được cấp phát, hoặc **chọn nhanh 1 trong 6 tài khoản mẫu** (Demo Accounts) trên giao diện để đóng vai:
  - `admin@kienhoc.edu.vn` (Super Admin - Toàn quyền)
  - `lesson.manager@kienhoc.edu.vn` (Quản Lý Bài Học)
  - `subject.manager@kienhoc.edu.vn` (Quản Lý Môn Học)
  - `grade.manager@kienhoc.edu.vn` (Quản Lý Lớp & Khối)
  - `content.manager@kienhoc.edu.vn` (Quản Lý Nội Dung)
  - `student.manager@kienhoc.edu.vn` (Quản Lý Học Viên)

#### Bước 2: Sử Dụng Các Phân Hệ Quản Trị
1. **📊 Tổng Quan (Overview)**: Nắm bắt nhanh tổng số bài học, môn học, lớp học, học viên và chuyển đổi vai trò linh hoạt.
2. **📖 Quản Lý Bài Học (Lessons)**: Lọc bài theo khối lớp, xem trước cấu trúc 4 bước hoặc bấm **+ Thêm Bài Học Mới** để biên soạn nội dung mới.
3. **🥞 Quản Lý Môn Học (Subjects)**: Cấu hình môn học Lớp 5 & Lớp 8, quản lý phân nhánh tích hợp môn Khoa Học Tự Nhiên.
4. **🏫 Quản Lý Lớp (Classes)**: Quản lý danh sách lớp (5A1, 5A2, 8A, 8B...), phân công giáo viên chủ nhiệm và phòng học.
5. **📄 Quản Lý Nội Dung (Content)**: Điều chỉnh ngân hàng nhiệm vụ hàng ngày, cốt truyện và linh vật Kiến đồng hành.
6. **🎓 Quản Lý Học Viên (Students)**: Tìm kiếm học sinh, xem chuỗi ngày học streak, cấp độ level và bấm nút **+50 XP** để tặng thưởng khích lệ thành tích.
7. **👥 Nhân Sự & Quyền (Staff & RBAC)**: Quản lý danh sách ban quản trị trong bảng riêng `admin_users`, cấp quyền hoặc thu hồi đặc quyền.
8. **🗄️ Quản Lý CSDL Supabase**: Đo tốc độ truy vấn ping thời gian thực, xem lược đồ bảng và chạy lệnh đồng bộ dữ liệu an toàn.
9. **🛠️ Chẩn Đoán & Nhật Ký (Audit Trail)**: Giám sát toàn bộ lịch sử thao tác của các quản trị viên để bảo đảm tính minh bạch, an toàn dữ liệu.

---

## 🗄️ CẤU TRÚC HỆ THỐNG & CƠ SỞ DỮ LIỆU

Nhằm đảm bảo an toàn thông tin theo chuẩn bảo mật phân cấp (RBAC), hệ thống phân tách cơ sở dữ liệu thành **2 bảng độc lập hoàn toàn**:

| Tên Bảng / View | Mục Đích Sử Dụng | Quyền Hạn & Bảo Mật |
|---|---|---|
| `public.users` | Lưu hồ sơ học sinh: tên, nickname, lớp, điểm XP, streak, avatar | Row Level Security (RLS) cho từng học sinh |
| `public.admin_users` | Lưu danh sách Ban Quản Trị, cán bộ chuyên trách, phân quyền RBAC | Tách biệt tuyệt đối, chống leo thang đặc quyền |
| `public.staff_accounts` | View hiển thị tương thích cho bảng quản trị viên | Chỉ cấp quyền truy cập cho Super Admin |

---

## 📂 CẤU TRÚC THƯ MỤC DỰ ÁN

```text
kien-hoc/
├── .env.example              # Mẫu biến môi trường (Supabase, Gemini API, Mailer)
├── CHANGELOG.md              # Nhật ký nâng cấp & lịch sử phiên bản chi tiết
├── RULES.md                  # Bộ quy chuẩn phát triển (Dev Standards & Guidelines)
├── README.md                 # Tài liệu hướng dẫn dự án (File này)
├── metadata.json             # Khai báo cấu hình nền tảng AI Studio
├── package.json              # Khai báo phụ thuộc npm & scripts
├── server.ts                 # Server Express hỗ trợ Proxy API & gửi mail OTP
├── supabase/
│   ├── schema.sql            # Lược đồ cơ sở dữ liệu PostgreSQL chuẩn
│   ├── seed.sql              # Dữ liệu mẫu (Admin demo, bài học mẫu)
│   └── migrations/           # Các bản migration theo thời gian
└── src/
    ├── App.tsx               # Khởi tạo ứng dụng & đồng bộ đa tab
    ├── main.tsx              # Điểm gắn kết React DOM
    ├── components/
    │   ├── AdminCP/          # Trang Dashboard Quản Trị Toàn Diện (/admincp)
    │   │   └── AdminCPPage.tsx
    │   ├── AuthModal.tsx     # Bảng Đăng ký & Đăng nhập bắt buộc + OTP
    │   ├── Navbar.tsx        # Thanh điều hướng phía trên của học sinh
    │   ├── LessonCard.tsx    # Thẻ hiển thị chặng bài học
    │   ├── LessonModal.tsx   # Modal học tập 4 bước chuẩn sư phạm
    │   ├── LeaderboardModal.tsx # Bảng vàng vinh danh học sinh
    │   ├── QuestsModal.tsx   # Danh sách nhiệm vụ hàng ngày
    │   ├── AlliesModal.tsx   # Bộ sưu tập linh vật Kiến đồng minh
    │   ├── ProfileSettingsModal.tsx # Cài đặt hồ sơ học viên
    │   └── SocraticTutorModal.tsx # Trợ lý AI hỏi đáp Socratic thông minh
    ├── data/
    │   ├── mockData.ts       # Dữ liệu bài học, môn học Lớp 5 & Lớp 8
    │   └── alliesData.ts     # Thông tin hệ thống linh vật Kiến Con
    ├── services/
    │   ├── adminService.ts   # Quản lý tài khoản quản trị & đóng vai RBAC
    │   ├── authService.ts    # Quản lý phiên, xác thực OTP & đồng bộ đa tab
    │   ├── audioService.ts   # Hiệu ứng âm thanh tương tác Web Audio API
    │   ├── supabaseService.ts# Kết nối & đồng bộ dữ liệu đám mây Supabase
    │   └── emailService.ts   # Dịch vụ gửi email mã OTP xác thực
    └── types/
        └── index.ts          # Định nghĩa kiểu dữ liệu TypeScript toàn hệ thống
```

---

## 💻 HƯỚNG DẪN CÀI ĐẶT & PHÁT TRIỂN

### 1. Yêu Cầu Môi Trường
- **Node.js**: Phiên bản `>= 18.x` hoặc `>= 20.x`
- **Trình quản lý gói**: `npm` hoặc `pnpm` / `yarn`

### 2. Các Bước Cài Đặt

```bash
# 1. Clone repository từ GitHub
git clone https://github.com/your-username/kien-hoc.git
cd kien-hoc

# 2. Cài đặt các gói phụ thuộc
npm install

# 3. Tạo file cấu hình môi trường từ mẫu
cp .env.example .env
```

### 3. Cấu Hình Biến Môi Trường (`.env`)
Chỉnh sửa file `.env` với các khóa của bạn (nếu có):
```env
# Cổng ứng dụng
PORT=3000

# Cấu hình Supabase (Tùy chọn - nếu để trống app sẽ chạy Local Storage an toàn)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Cấu hình Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Cấu hình Gửi Email OTP qua SMTP (Tùy chọn)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 4. Khởi Chạy Ứng Dụng
```bash
# Chạy môi trường phát triển (Development Server trên cổng 3000)
npm run dev

# Kiểm tra lỗi cú pháp và kiểu dữ liệu (Lint / Type-check)
npm run lint

# Đóng gói ứng dụng cho môi trường sản xuất (Production Build)
npm run build

# Khởi chạy bản build sản xuất
npm run start
```

Mở trình duyệt tại: `http://localhost:3000` (Giao diện học sinh) hoặc `http://localhost:3000/admincp` (Trang quản trị).

---

## 📜 QUY CHUẨN DỰ ÁN & LỊCH SỬ NÂNG CẤP

- **Quy chuẩn phát triển**: Xem tài liệu chuẩn hóa tại [`RULES.md`](./RULES.md) (Tuân thủ nguyên tắc Clean UI, Đồng bộ đa tab tức thì, và Tách biệt CSDL RBAC).
- **Lịch sử cập nhật**: Xem toàn bộ các phiên bản và thay đổi chi tiết tại [`CHANGELOG.md`](./CHANGELOG.md).

---

<p align="center">
  Được phát triển với tinh thần cống hiến vì nền giáo dục đổi mới Việt Nam 🇻🇳<br>
  <strong>Kiến Học — Học thông minh, hiểu bản chất, vững tương lai!</strong>
</p>
