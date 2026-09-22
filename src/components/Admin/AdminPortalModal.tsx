import React, { useState, useMemo } from 'react';
import {
  AdminRole,
  AdminUser,
  AdminClassInfo,
  AdminAuditLog,
  Lesson,
  Subject,
  GradeLevel,
  DailyQuest,
  UserProfile,
} from '../../types';
import { ALLIES } from '../../data/alliesData';
import {
  ShieldCheck,
  Users,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  X,
  ChevronRight,
  BarChart3,
  Award,
  Star,
  Check,
  Sparkles,
  Sliders,
  Eye,
  Clock,
  Key,
  School,
  Lock,
  ArrowUpRight,
  Sparkle,
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  lessons: Lesson[];
  subjects: Subject[];
  quests: DailyQuest[];
  onUpdateLessons?: (lessons: Lesson[]) => void;
  onUpdateSubjects?: (subjects: Subject[]) => void;
  onUpdateQuests?: (quests: DailyQuest[]) => void;
}

// Danh sách các vai trò quản trị viên
export const ADMIN_ROLES_CONFIG: Record<
  AdminRole,
  {
    role: AdminRole;
    name: string;
    shortTitle: string;
    badgeColor: string;
    icon: string;
    description: string;
    accessibleTabs: string[];
  }
> = {
  super_admin: {
    role: 'super_admin',
    name: 'Super Admin',
    shortTitle: 'Quản Trị Tối Cao',
    badgeColor: 'bg-red-100 text-red-800 border-red-300',
    icon: '👑',
    description: 'Toàn quyền điều hành hệ thống: quản trị nhân sự, phân quyền, cấu hình hệ thống, bài học, môn học, lớp học và học viên.',
    accessibleTabs: ['overview', 'lessons', 'subjects', 'classes', 'content', 'students', 'staff', 'audit'],
  },
  lesson_manager: {
    role: 'lesson_manager',
    name: 'Quản Lý Bài Học',
    shortTitle: 'Lesson Manager',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '📚',
    description: 'Biên soạn, cấu trúc 4 bước (Khám phá, Luyện tập, Vận dụng, Giảng lại), phân phối điểm XP và xuất bản bài học.',
    accessibleTabs: ['overview', 'lessons', 'content'],
  },
  subject_manager: {
    role: 'subject_manager',
    name: 'Quản Lý Môn Học',
    shortTitle: 'Subject Manager',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    icon: '🏷️',
    description: 'Thiết lập danh mục môn học, phân phối chương trình Lớp 5 & Lớp 8, quản lý phân nhánh tích hợp KHTN.',
    accessibleTabs: ['overview', 'subjects', 'classes'],
  },
  grade_manager: {
    role: 'grade_manager',
    name: 'Quản Lý Lớp',
    shortTitle: 'Grade & Class Manager',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: '🏫',
    description: 'Quản lý khối lớp (Lớp 5, Lớp 8), danh sách lớp học (5A, 5B, 8A, 8B), phân bổ học sinh và giáo viên cố vấn.',
    accessibleTabs: ['overview', 'classes', 'students'],
  },
  content_manager: {
    role: 'content_manager',
    name: 'Quản Lý Nội Dung',
    shortTitle: 'Content Manager',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: '🎯',
    description: 'Quản lý cốt truyện Kiến Con, ngân hàng nhiệm vụ hàng ngày (Quests), linh vật đồng hành và đề thi.',
    accessibleTabs: ['overview', 'content', 'lessons'],
  },
  student_manager: {
    role: 'student_manager',
    name: 'Quản Lý Học Viên',
    shortTitle: 'Student Manager',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    icon: '🎒',
    description: 'Theo dõi học bạ học sinh, chuỗi ngày streak, level, cấp phát huy hiệu và thưởng điểm XP khích lệ.',
    accessibleTabs: ['overview', 'students', 'classes'],
  },
};

// Dữ liệu quản trị viên mẫu
const INITIAL_ADMIN_STAFF: AdminUser[] = [
  {
    id: 'admin_1',
    name: 'Nguyễn Minh Hoàng',
    email: 'mkt.thecliffresort@gmail.com',
    avatar: '👑',
    role: 'super_admin',
    roleTitle: 'Super Admin - Tổng Chỉ Huy',
    permissions: ['* (Toàn quyền hệ thống)'],
    lastLogin: 'Vừa xong',
    status: 'active',
  },
  {
    id: 'admin_2',
    name: 'ThS. Trần Thị Mai Lan',
    email: 'mailan.edu@kienhoc.vn',
    avatar: '📚',
    role: 'lesson_manager',
    roleTitle: 'Trưởng Ban Biên Soạn Bài Học',
    permissions: ['lessons:create', 'lessons:edit', 'lessons:publish'],
    lastLogin: 'Hôm nay lúc 10:15',
    status: 'active',
  },
  {
    id: 'admin_3',
    name: 'TS. Lê Quang Vũ',
    email: 'quangvu.khtn@kienhoc.vn',
    avatar: '🏷️',
    role: 'subject_manager',
    roleTitle: 'Chuyên Gia Phát Triển Môn Học',
    permissions: ['subjects:manage', 'domains:config'],
    lastLogin: 'Hôm qua lúc 16:40',
    status: 'active',
  },
  {
    id: 'admin_4',
    name: 'Cô Phạm Bích Thủy',
    email: 'bichthuy.lop5@kienhoc.vn',
    avatar: '🏫',
    role: 'grade_manager',
    roleTitle: 'Cố Vấn Khối & Lớp Học',
    permissions: ['classes:manage', 'students:assign'],
    lastLogin: '3 ngày trước',
    status: 'active',
  },
  {
    id: 'admin_5',
    name: 'Hoàng Quốc Tuấn',
    email: 'quoctuan.media@kienhoc.vn',
    avatar: '🎯',
    role: 'content_manager',
    roleTitle: 'Phụ Trách Nội Dung & Cốt Truyện',
    permissions: ['quests:manage', 'allies:config', 'stories:edit'],
    lastLogin: 'Hôm nay lúc 08:20',
    status: 'active',
  },
  {
    id: 'admin_6',
    name: 'Đặng Thảo Vy',
    email: 'thaovy.studentcare@kienhoc.vn',
    avatar: '🎒',
    role: 'student_manager',
    roleTitle: 'Điều Phối & Chăm Sóc Học Viên',
    permissions: ['students:view', 'students:grant_xp', 'students:support'],
    lastLogin: 'Hôm nay lúc 11:00',
    status: 'active',
  },
];

// Danh sách lớp học
const INITIAL_CLASSES: AdminClassInfo[] = [
  {
    id: 'class_5a1',
    name: 'Lớp 5A1 - Kiến Chăm Chỉ',
    grade: 5,
    academicYear: '2026 - 2027',
    studentCount: 38,
    headTeacher: 'Cô Đỗ Thu Hà',
    room: 'Phòng 201 - Nhà A',
    status: 'active',
  },
  {
    id: 'class_5a2',
    name: 'Lớp 5A2 - Kiến Khám Phá',
    grade: 5,
    academicYear: '2026 - 2027',
    studentCount: 36,
    headTeacher: 'Thầy Nguyễn Văn Đức',
    room: 'Phòng 202 - Nhà A',
    status: 'active',
  },
  {
    id: 'class_5a3',
    name: 'Lớp 5A3 - Kiến Tinh Anh',
    grade: 5,
    academicYear: '2026 - 2027',
    studentCount: 35,
    headTeacher: 'Cô Lê Bích Ngọc',
    room: 'Phòng 203 - Nhà A',
    status: 'active',
  },
  {
    id: 'class_8a',
    name: 'Lớp 8A - Kiến Thám Hiểm KHTN',
    grade: 8,
    academicYear: '2026 - 2027',
    studentCount: 42,
    headTeacher: 'Thầy Hoàng Trọng Tín',
    room: 'Phòng Lab 401 - Nhà B',
    status: 'active',
  },
  {
    id: 'class_8b',
    name: 'Lớp 8B - Kiến Năng Lượng',
    grade: 8,
    academicYear: '2026 - 2027',
    studentCount: 40,
    headTeacher: 'Cô Vũ Hải Yến',
    room: 'Phòng Lab 402 - Nhà B',
    status: 'active',
  },
];

// Học sinh quản lý mẫu
interface ManagedStudent {
  id: string;
  name: string;
  nickname: string;
  email: string;
  grade: GradeLevel;
  className: string;
  xp: number;
  level: number;
  streakDays: number;
  completedCount: number;
  avatar: string;
  status: 'active' | 'suspended';
}

const INITIAL_STUDENTS: ManagedStudent[] = [
  {
    id: 'stu_1',
    name: 'Tín Phạm',
    nickname: 'Kiến Siêu Đẳng',
    email: 'tinpham.ant@gmail.com',
    grade: 5,
    className: 'Lớp 5A1',
    xp: 250,
    level: 2,
    streakDays: 4,
    completedCount: 2,
    avatar: '🐜',
    status: 'active',
  },
  {
    id: 'stu_2',
    name: 'Minh Khôi',
    nickname: 'Khôi Nguyên',
    email: 'minhkhoi@gmail.com',
    grade: 5,
    className: 'Lớp 5A1',
    xp: 680,
    level: 4,
    streakDays: 7,
    completedCount: 5,
    avatar: '⚡',
    status: 'active',
  },
  {
    id: 'stu_3',
    name: 'Bảo Trâm',
    nickname: 'Trâm Kiến Nhỏ',
    email: 'baotram@gmail.com',
    grade: 5,
    className: 'Lớp 5A2',
    xp: 520,
    level: 3,
    streakDays: 5,
    completedCount: 4,
    avatar: '🐝',
    status: 'active',
  },
  {
    id: 'stu_4',
    name: 'Hoàng Nam',
    nickname: 'Nam Vật Lí',
    email: 'hoangnam.khtn@gmail.com',
    grade: 8,
    className: 'Lớp 8A',
    xp: 890,
    level: 5,
    streakDays: 9,
    completedCount: 7,
    avatar: '💥',
    status: 'active',
  },
  {
    id: 'stu_5',
    name: 'Phương Linh',
    nickname: 'Linh Hóa Học',
    email: 'phuonglinh8b@gmail.com',
    grade: 8,
    className: 'Lớp 8B',
    xp: 740,
    level: 4,
    streakDays: 6,
    completedCount: 6,
    avatar: '🌿',
    status: 'active',
  },
];

export const AdminPortalModal: React.FC<AdminPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lessons: initialLessons,
  subjects: initialSubjects,
  quests: initialQuests,
  onUpdateLessons,
  onUpdateSubjects,
  onUpdateQuests,
}) => {
  // Quản lý vai trò hiện tại (cho phép chuyển đổi nhanh để test và trải nghiệm quyền hạn)
  const [currentRole, setCurrentRole] = useState<AdminRole>('super_admin');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<'all' | 5 | 8>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dữ liệu quản lý nội bộ
  const [adminStaffList, setAdminStaffList] = useState<AdminUser[]>(INITIAL_ADMIN_STAFF);
  const [classesList, setClassesList] = useState<AdminClassInfo[]>(INITIAL_CLASSES);
  const [studentsList, setStudentsList] = useState<ManagedStudent[]>(INITIAL_STUDENTS);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log_1',
      timestamp: '11:20:15 - Hôm nay',
      adminName: 'Nguyễn Minh Hoàng',
      role: 'super_admin',
      action: 'Khởi tạo phiên quản trị hệ thống',
      target: 'Toàn bộ hệ thống Kiến Học',
      details: 'Đồng bộ cơ sở dữ liệu Supabase & thiết lập vai trò phân quyền',
    },
    {
      id: 'log_2',
      timestamp: '10:45:00 - Hôm nay',
      adminName: 'Trần Thị Mai Lan',
      role: 'lesson_manager',
      action: 'Cập nhật cấu trúc bài học',
      target: 'Phép Chia Số Thập Phân Cho Số Tự Nhiên',
      details: 'Hiệu chỉnh 4 bước: Khám phá, Luyện tập, Vận dụng, Giảng lại',
    },
  ]);

  // Toast thông báo thao tác
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    audioService.playSuccess();
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Thêm audit log
  const addAuditLog = (action: string, target: string, details: string) => {
    const roleConfig = ADMIN_ROLES_CONFIG[currentRole];
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - Vừa xong',
      adminName: roleConfig.name,
      role: currentRole,
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // Modal trạng thái xem / sửa chi tiết
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLessonModalOpen, setNewLessonModalOpen] = useState(false);
  const [newClassModalOpen, setNewClassModalOpen] = useState(false);
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);

  // Form thêm lớp mới
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>(5);
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newClassRoom, setNewClassRoom] = useState('');

  // Form thêm admin mới
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('lesson_manager');

  const currentRoleConfig = ADMIN_ROLES_CONFIG[currentRole];

  // Kiểm tra quyền truy cập tab
  const canAccessTab = (tabKey: string) => {
    if (currentRole === 'super_admin') return true;
    return currentRoleConfig.accessibleTabs.includes(tabKey);
  };

  // Lọc bài học
  const filteredLessons = useMemo(() => {
    return initialLessons.filter((lesson) => {
      const matchGrade = selectedGradeFilter === 'all' || lesson.grade === selectedGradeFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.unit.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchSearch;
    });
  }, [initialLessons, selectedGradeFilter, searchQuery]);

  // Lọc học sinh
  const filteredStudents = useMemo(() => {
    return studentsList.filter((stu) => {
      const matchGrade = selectedGradeFilter === 'all' || stu.grade === selectedGradeFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        stu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stu.className.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGrade && matchSearch;
    });
  }, [studentsList, selectedGradeFilter, searchQuery]);

  // Thưởng XP cho học sinh
  const handleRewardXP = (studentId: string, amount: number) => {
    setStudentsList((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const newXp = s.xp + amount;
          const newLevel = Math.floor(newXp / 200) + 1;
          return { ...s, xp: newXp, level: newLevel };
        }
        return s;
      })
    );
    const stu = studentsList.find((s) => s.id === studentId);
    addAuditLog('Thưởng điểm XP khích lệ', `Học viên: ${stu?.name || studentId}`, `Cộng +${amount} XP khích lệ học tập.`);
    showNotification(`Đã cộng +${amount} XP cho học viên ${stu?.name || ''}!`);
  };

  // Tạo lớp học mới
  const handleCreateClass = () => {
    if (!newClassName.trim() || !newClassTeacher.trim()) {
      alert('Vui lòng nhập tên lớp và tên giáo viên!');
      return;
    }
    const newClass: AdminClassInfo = {
      id: `class_${Date.now()}`,
      name: newClassName.trim(),
      grade: newClassGrade,
      academicYear: '2026 - 2027',
      studentCount: 0,
      headTeacher: newClassTeacher.trim(),
      room: newClassRoom.trim() || 'Phòng học trực tuyến',
      status: 'active',
    };
    setClassesList((prev) => [...prev, newClass]);
    addAuditLog('Tạo mới lớp học', newClass.name, `Khối Lớp ${newClass.grade}, GV: ${newClass.headTeacher}`);
    showNotification(`Đã tạo lớp "${newClass.name}" thành công!`);
    setNewClassName('');
    setNewClassTeacher('');
    setNewClassRoom('');
    setNewClassModalOpen(false);
  };

  // Tạo admin mới
  const handleCreateAdmin = () => {
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      alert('Vui lòng nhập đầy đủ họ tên và email quản trị viên!');
      return;
    }
    const roleConf = ADMIN_ROLES_CONFIG[newAdminRole];
    const newAdmin: AdminUser = {
      id: `admin_${Date.now()}`,
      name: newAdminName.trim(),
      email: newAdminEmail.trim(),
      avatar: roleConf.icon,
      role: newAdminRole,
      roleTitle: roleConf.name,
      permissions: [roleConf.description],
      lastLogin: 'Chưa đăng nhập',
      status: 'active',
    };
    setAdminStaffList((prev) => [...prev, newAdmin]);
    addAuditLog('Thêm tài khoản quản trị', newAdmin.name, `Gán vai trò: ${roleConf.name} (${newAdmin.email})`);
    showNotification(`Đã phân quyền cho quản trị viên ${newAdmin.name}!`);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminModalOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-fadeIn overflow-hidden">
      <div className="bg-white rounded-3xl w-full max-w-6xl h-[94vh] max-h-[900px] border border-stone-200 shadow-2xl flex flex-col overflow-hidden relative">
        {/* Top Notification Toast */}
        {notification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 animate-bounce-short text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header Admin Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 px-4 sm:px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 border-b border-stone-700 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md border border-amber-300/40">
              🐜
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-lg sm:text-xl tracking-tight text-amber-300">
                  KIẾN HỌC • TRANG QUẢN TRỊ
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-stone-300 hidden sm:block">
                Hệ thống quản lý toàn diện: Bài học, Môn học, Lớp học, Nội dung & Học viên
              </p>
            </div>
          </div>

          {/* Quick Role Switcher (Chuyển đổi vai trò quản lý trực tiếp) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-800/90 border border-stone-700 rounded-2xl px-2.5 py-1 text-xs">
              <span className="text-stone-400 mr-2 text-[11px] hidden md:inline">Đang đóng vai:</span>
              <select
                value={currentRole}
                onChange={(e) => {
                  const role = e.target.value as AdminRole;
                  setCurrentRole(role);
                  audioService.playClick();
                  showNotification(`Đã chuyển vai trò sang: ${ADMIN_ROLES_CONFIG[role].name}`, 'info');
                }}
                className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
              >
                {Object.values(ADMIN_ROLES_CONFIG).map((r) => (
                  <option key={r.role} value={r.role} className="bg-stone-900 text-white font-medium">
                    {r.icon} {r.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                onClose();
              }}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors border border-stone-700"
              title="Đóng trang quản trị"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Role Banner / Active Role Indicator */}
        <div className="bg-stone-100 px-4 sm:px-6 py-2.5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">{currentRoleConfig.icon}</span>
            <div>
              <span className="font-black text-stone-900 mr-1.5">{currentRoleConfig.name}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${currentRoleConfig.badgeColor}`}>
                {currentRoleConfig.shortTitle}
              </span>
              <span className="text-stone-500 ml-2 hidden lg:inline">
                {currentRoleConfig.description}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px]">Phiên quản trị an toàn (Supabase Live)</span>
          </div>
        </div>

        {/* Main Content Layout: Sidebar + Working View */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-60 bg-stone-50 border-r border-stone-200 flex md:flex-col overflow-x-auto md:overflow-y-auto shrink-0 p-2 sm:p-3 gap-1">
            <div className="hidden md:block px-3 py-1.5 text-[11px] font-black text-stone-400 uppercase tracking-wider">
              Phân Hệ Quản Lý
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('overview');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'hover:bg-stone-200/70 text-stone-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Tổng Quan</span>
            </button>

            <button
              onClick={() => {
                if (canAccessTab('lessons')) {
                  audioService.playClick();
                  setActiveTab('lessons');
                } else {
                  showNotification('Vai trò hiện tại không có quyền truy cập Quản Lý Bài Học', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'lessons'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('lessons')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 shrink-0" />
                <span>Quản Lý Bài Học</span>
              </div>
              {!canAccessTab('lessons') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <button
              onClick={() => {
                if (canAccessTab('subjects')) {
                  audioService.playClick();
                  setActiveTab('subjects');
                } else {
                  showNotification('Vai trò hiện tại không có quyền truy cập Quản Lý Môn Học', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'subjects'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('subjects')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 shrink-0" />
                <span>Quản Lý Môn Học</span>
              </div>
              {!canAccessTab('subjects') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <button
              onClick={() => {
                if (canAccessTab('classes')) {
                  audioService.playClick();
                  setActiveTab('classes');
                } else {
                  showNotification('Vai trò hiện tại không có quyền truy cập Quản Lý Lớp', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'classes'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('classes')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <School className="w-4 h-4 shrink-0" />
                <span>Quản Lý Lớp</span>
              </div>
              {!canAccessTab('classes') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <button
              onClick={() => {
                if (canAccessTab('content')) {
                  audioService.playClick();
                  setActiveTab('content');
                } else {
                  showNotification('Vai trò hiện tại không có quyền truy cập Quản Lý Nội Dung', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'content'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('content')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 shrink-0" />
                <span>Quản Lý Nội Dung</span>
              </div>
              {!canAccessTab('content') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <button
              onClick={() => {
                if (canAccessTab('students')) {
                  audioService.playClick();
                  setActiveTab('students');
                } else {
                  showNotification('Vai trò hiện tại không có quyền truy cập Quản Lý Học Viên', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'students'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('students')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-4 h-4 shrink-0" />
                <span>Quản Lý Học Viên</span>
              </div>
              {!canAccessTab('students') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <div className="hidden md:block my-2 border-t border-stone-200" />
            <div className="hidden md:block px-3 py-1 text-[11px] font-black text-stone-400 uppercase tracking-wider">
              Hệ Thống
            </div>

            <button
              onClick={() => {
                if (canAccessTab('staff')) {
                  audioService.playClick();
                  setActiveTab('staff');
                } else {
                  showNotification('Chỉ Super Admin mới có quyền quản lý nhân sự & phân quyền', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('staff')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>Nhân Sự & Quyền</span>
              </div>
              {!canAccessTab('staff') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>

            <button
              onClick={() => {
                if (canAccessTab('audit')) {
                  audioService.playClick();
                  setActiveTab('audit');
                } else {
                  showNotification('Chỉ Super Admin mới có quyền xem Nhật ký thao tác', 'info');
                }
              }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-black text-xs transition-all text-left shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : canAccessTab('audit')
                  ? 'hover:bg-stone-200/70 text-stone-700'
                  : 'opacity-40 hover:bg-transparent text-stone-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Nhật Ký (Audit)</span>
              </div>
              {!canAccessTab('audit') && <Lock className="w-3.5 h-3.5 text-stone-400" />}
            </button>
          </div>

          {/* Main Working Panel */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-white space-y-6">
            {/* TAB 1: TỔNG QUAN (OVERVIEW) */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight">
                    Tổng Quan Hệ Thống Kiến Học
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500">
                    Báo cáo tổng hợp số liệu thực tế về bài học, môn học, lớp học và học viên.
                  </p>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                    <div className="flex items-center justify-between text-amber-700 mb-2">
                      <span className="text-xs font-bold">Tổng Bài Học</span>
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-950">
                      {initialLessons.length}
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1 font-medium">
                      Lớp 5: {initialLessons.filter((l) => l.grade === 5).length} bài • Lớp 8: {initialLessons.filter((l) => l.grade === 8).length} bài
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200">
                    <div className="flex items-center justify-between text-blue-700 mb-2">
                      <span className="text-xs font-bold">Môn Học Hoạt Động</span>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-blue-950">
                      {initialSubjects.length}
                    </div>
                    <p className="text-[11px] text-blue-700 mt-1 font-medium">
                      Toán học, KHTN (Lí, Hóa, Sinh)
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                    <div className="flex items-center justify-between text-emerald-700 mb-2">
                      <span className="text-xs font-bold">Lớp Học Vận Hành</span>
                      <School className="w-4 h-4" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-950">
                      {classesList.length}
                    </div>
                    <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                      Tổng {classesList.reduce((acc, c) => acc + c.studentCount, 0)} học sinh theo lớp
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200">
                    <div className="flex items-center justify-between text-purple-700 mb-2">
                      <span className="text-xs font-bold">Đội Ngũ Quản Trị</span>
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-purple-950">
                      {adminStaffList.length}
                    </div>
                    <p className="text-[11px] text-purple-700 mt-1 font-medium">
                      6 chức danh quản trị phân quyền
                    </p>
                  </div>
                </div>

                {/* Phân bố các loại user quản lý (Admin Roles Breakdown) */}
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-600" />
                      <span>Cơ Cấu Phân Quyền Quản Lý (Admin Roles)</span>
                    </h4>
                    <span className="text-xs text-stone-500">Nhấp để xem hoặc chuyển đổi quyền</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(ADMIN_ROLES_CONFIG).map((roleItem) => {
                      const isCurrent = currentRole === roleItem.role;
                      return (
                        <div
                          key={roleItem.role}
                          onClick={() => {
                            setCurrentRole(roleItem.role);
                            audioService.playClick();
                            showNotification(`Đã chuyển vai trò: ${roleItem.name}`, 'info');
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-50/90 border-amber-400 shadow-sm ring-2 ring-amber-400/40'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{roleItem.icon}</span>
                              <span className="font-black text-xs sm:text-sm text-stone-900">
                                {roleItem.name}
                              </span>
                            </div>
                            {isCurrent && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500 text-white">
                                Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                            {roleItem.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hoạt động gần đây */}
                <div className="p-4 rounded-2xl bg-white border border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-black text-xs uppercase text-stone-800 tracking-wider">
                      Nhật Ký Thao Tác Gần Đây
                    </h4>
                    <button
                      onClick={() => setActiveTab('audit')}
                      className="text-xs text-amber-600 font-bold hover:underline"
                    >
                      Xem toàn bộ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {auditLogs.slice(0, 3).map((log) => (
                      <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/70 text-xs flex items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-stone-900">{log.action}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                              {log.adminName}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">{log.details}</p>
                        </div>
                        <span className="text-[10px] text-stone-400 shrink-0">{log.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: QUẢN LÝ BÀI HỌC (LESSONS) */}
            {activeTab === 'lessons' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Quản Lý Bài Học
                    </h3>
                    <p className="text-xs text-stone-500">
                      Chỉnh sửa cấu trúc 4 bước: Khám phá, Luyện tập, Vận dụng và Giảng lại cho bạn.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Grade Filter */}
                    <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                      <button
                        onClick={() => setSelectedGradeFilter('all')}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          selectedGradeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                        }`}
                      >
                        Tất cả
                      </button>
                      <button
                        onClick={() => setSelectedGradeFilter(5)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          selectedGradeFilter === 5 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                        }`}
                      >
                        Lớp 5
                      </button>
                      <button
                        onClick={() => setSelectedGradeFilter(8)}
                        className={`px-3 py-1 rounded-lg transition-all ${
                          selectedGradeFilter === 8 ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500'
                        }`}
                      >
                        Lớp 8
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        audioService.playClick();
                        setNewLessonModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Bài Học Mới</span>
                    </button>
                  </div>
                </div>

                {/* Search box */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm bài học theo tiêu đề, chủ đề hoặc mã bài..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-amber-500 bg-stone-50/50"
                  />
                </div>

                {/* Lessons List Table */}
                <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Bài Học</th>
                        <th className="p-3">Khối Lớp</th>
                        <th className="p-3">Đồng Minh Kiến</th>
                        <th className="p-3">Thời Lượng</th>
                        <th className="p-3">Thưởng XP</th>
                        <th className="p-3">4 Chặng Học Tập</th>
                        <th className="p-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredLessons.map((lesson) => {
                        const ally = ALLIES[lesson.allyId] || ALLIES.kien;
                        return (
                          <tr key={lesson.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="p-3">
                              <div className="font-black text-stone-900">{lesson.title}</div>
                              <div className="text-[11px] text-stone-500">{lesson.unit}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px]">
                                Lớp {lesson.grade}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <span>{ally.icon}</span>
                                <span className="font-bold text-stone-700">{ally.name}</span>
                              </div>
                            </td>
                            <td className="p-3 font-semibold text-stone-600">
                              {lesson.estimatedMinutes} phút
                            </td>
                            <td className="p-3">
                              <span className="font-black text-amber-600">+{lesson.xpReward} XP</span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-[10px] font-bold">
                                <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800" title="Khám phá">KP</span>
                                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800" title="Luyện tập">LT</span>
                                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" title="Vận dụng">VD</span>
                                <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800" title="Giảng lại">GL</span>
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  audioService.playClick();
                                  setEditingLesson(lesson);
                                }}
                                className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs inline-flex items-center gap-1 transition-colors"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Xem & Sửa</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: QUẢN LÝ MÔN HỌC (SUBJECTS) */}
            {activeTab === 'subjects' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Quản Lý Môn Học
                    </h3>
                    <p className="text-xs text-stone-500">
                      Cấu hình môn học Khối 5 và Khối 8, các phân nhánh liên môn Khoa học tự nhiên.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {initialSubjects.map((sub) => (
                    <div key={sub.id} className="p-4 rounded-2xl border border-stone-200 bg-white shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${sub.color || 'bg-amber-100 text-amber-800'}`}>
                            {sub.grade === 5 ? '📐' : '🔬'}
                          </div>
                          <div>
                            <h4 className="font-black text-sm text-stone-900">{sub.name}</h4>
                            <span className="text-[10px] font-black px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                              Mã: {sub.code} • Lớp {sub.grade}
                            </span>
                          </div>
                        </div>
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                          Đang hoạt động
                        </span>
                      </div>

                      <p className="text-xs text-stone-600">{sub.description}</p>

                      {sub.domainBranches && (
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/70 space-y-2">
                          <div className="text-[11px] font-black text-stone-700 uppercase">
                            Các phân nhánh liên môn tích hợp:
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                            {sub.domainBranches.map((branch) => (
                              <div key={branch.id} className="p-2 rounded-lg bg-white border border-stone-200">
                                <div>{branch.icon}</div>
                                <div className="text-[11px] mt-0.5">{branch.name}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                        <button
                          onClick={() => showNotification(`Đang cấu hình môn ${sub.name}...`)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-100 text-xs font-bold text-stone-700"
                        >
                          Cấu Hình Môn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: QUẢN LÝ LỚP HỌC (CLASSES) */}
            {activeTab === 'classes' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Quản Lý Lớp & Khối
                    </h3>
                    <p className="text-xs text-stone-500">
                      Danh sách lớp học, phân công giáo viên chủ nhiệm kiến, phòng học và sĩ số.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setNewClassModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo Lớp Học Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {classesList.map((cls) => (
                    <div key={cls.id} className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-amber-300 transition-all shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-stone-900">{cls.name}</span>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Khối {cls.grade}
                        </span>
                      </div>

                      <div className="text-xs space-y-1 text-stone-600">
                        <div>
                          <span className="font-semibold text-stone-700">GV Chủ nhiệm:</span> {cls.headTeacher}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-700">Phòng học:</span> {cls.room}
                        </div>
                        <div>
                          <span className="font-semibold text-stone-700">Niên khóa:</span> {cls.academicYear}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs">
                        <span className="font-black text-emerald-700">{cls.studentCount} Học Sinh</span>
                        <button
                          onClick={() => {
                            setActiveTab('students');
                            setSearchQuery(cls.name.split(' - ')[0]);
                          }}
                          className="text-amber-600 hover:underline font-bold"
                        >
                          Xem danh sách
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: QUẢN LÝ NỘI DUNG (CONTENT & QUESTS) */}
            {activeTab === 'content' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Quản Lý Nội Dung & Nhiệm Vụ
                    </h3>
                    <p className="text-xs text-stone-500">
                      Nhiệm vụ hàng ngày (Quests), ngân hàng linh vật đồng hành và đề thi ôn tập.
                    </p>
                  </div>
                </div>

                {/* Quests list */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      <span>Nhiệm Vụ Hàng Ngày (Daily Quests)</span>
                    </h4>
                    <span className="text-xs font-bold text-stone-500">{initialQuests.length} Nhiệm vụ</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {initialQuests.map((q) => (
                      <div key={q.id} className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-stone-900">{q.title}</span>
                          <span className="font-black text-amber-600">+{q.xpReward} XP</span>
                        </div>
                        <p className="text-[11px] text-stone-600">{q.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                          <span>Mục tiêu: {q.target} lần</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">Lớp {q.grade}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allies Showcase Management */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                  <h4 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Linh Vật Kiến Đồng Hành (Ant Allies)</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {Object.values(ALLIES).map((ally) => (
                      <div key={ally.id} className="p-3 rounded-xl bg-white border border-stone-200 text-xs space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ally.icon}</span>
                          <div>
                            <div className="font-black text-stone-900">{ally.name}</div>
                            <div className="text-[10px] font-bold text-stone-500">{ally.role}</div>
                          </div>
                        </div>
                        <p className="text-[11px] text-stone-600 italic">"{ally.quote}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: QUẢN LÝ HỌC VIÊN (STUDENTS) */}
            {activeTab === 'students' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Quản Lý Học Viên
                    </h3>
                    <p className="text-xs text-stone-500">
                      Theo dõi tiến độ, cấp độ (Level), chuỗi ngày streak và thưởng điểm XP khích lệ.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm học viên theo tên, email, lớp..."
                        className="pl-8 pr-3 py-1.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Học Viên</th>
                        <th className="p-3">Lớp & Khối</th>
                        <th className="p-3">Điểm XP</th>
                        <th className="p-3">Cấp Độ (Level)</th>
                        <th className="p-3">Chuỗi Ngày</th>
                        <th className="p-3">Bài Hoàn Thành</th>
                        <th className="p-3 text-right">Khích Lệ XP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {filteredStudents.map((stu) => (
                        <tr key={stu.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{stu.avatar}</span>
                              <div>
                                <div className="font-black text-stone-900">{stu.name}</div>
                                <div className="text-[10px] text-stone-500">{stu.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-stone-700">{stu.className}</span>
                            <span className="text-[10px] text-stone-500 ml-1">(Khối {stu.grade})</span>
                          </td>
                          <td className="p-3">
                            <span className="font-black text-amber-600">{stu.xp} XP</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px]">
                              Cấp {stu.level}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-bold text-orange-600 flex items-center gap-1">
                              🔥 {stu.streakDays} ngày
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-stone-600">
                            {stu.completedCount} bài học
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRewardXP(stu.id, 50)}
                                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-black text-[10px] transition-colors"
                                title="Cộng 50 XP khích lệ"
                              >
                                +50 XP
                              </button>
                              <button
                                onClick={() => handleRewardXP(stu.id, 100)}
                                className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-black text-[10px] transition-colors"
                                title="Cộng 100 XP khích lệ"
                              >
                                +100 XP
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 7: NHÂN SỰ & PHÂN QUYỀN (STAFF & ROLES) */}
            {activeTab === 'staff' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Nhân Sự & Phân Quyền Quản Trị
                    </h3>
                    <p className="text-xs text-stone-500">
                      Quản lý tài khoản quản trị viên: Super Admin, Quản lý bài học, Quản lý môn học, Quản lý lớp, Quản lý nội dung và Quản lý học viên.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      setNewAdminModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Quản Trị Viên</span>
                  </button>
                </div>

                <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 font-bold border-b border-stone-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Quản Trị Viên</th>
                        <th className="p-3">Vai Trò Quản Trị</th>
                        <th className="p-3">Quyền Hạn Chi Tiết</th>
                        <th className="p-3">Đăng Nhập Gần Nhất</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {adminStaffList.map((adm) => {
                        const roleConf = ADMIN_ROLES_CONFIG[adm.role];
                        return (
                          <tr key={adm.id} className="hover:bg-stone-50/80 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xl">{adm.avatar}</span>
                                <div>
                                  <div className="font-black text-stone-900">{adm.name}</div>
                                  <div className="text-[10px] text-stone-500">{adm.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-md font-bold text-[10px] border ${roleConf.badgeColor}`}>
                                {roleConf.name}
                              </span>
                            </td>
                            <td className="p-3 text-[11px] text-stone-600">
                              {adm.permissions.join(', ')}
                            </td>
                            <td className="p-3 text-stone-500 text-[11px]">
                              {adm.lastLogin}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                Hoạt động
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <button
                                onClick={() => {
                                  setCurrentRole(adm.role);
                                  showNotification(`Đã chuyển quyền thử nghiệm sang ${adm.name}`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[10px] transition-colors"
                              >
                                Đóng Vai
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 8: NHẬT KÝ THAO TÁC (AUDIT LOGS) */}
            {activeTab === 'audit' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-stone-900 tracking-tight">
                      Nhật Ký Thao Tác (Audit Logs)
                    </h3>
                    <p className="text-xs text-stone-500">
                      Ghi nhận mọi hành động thay đổi dữ liệu của đội ngũ quản trị viên theo thời gian thực.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      audioService.playClick();
                      showNotification('Đã làm mới nhật ký kiểm toán!');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 text-xs font-bold text-stone-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Làm Mới</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl border border-stone-200 bg-stone-50/70 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-stone-900">{log.action}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                            {log.adminName} ({log.role})
                          </span>
                        </div>
                        <span className="text-stone-400 text-[10px]">{log.timestamp}</span>
                      </div>
                      <div className="text-stone-700 font-medium">Đối tượng: {log.target}</div>
                      <div className="text-stone-500 text-[11px]">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MODAL THÊM BÀI HỌC MỚI */}
        {newLessonModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-lg text-stone-900">Thêm Bài Học Mới</h4>
                <button
                  onClick={() => setNewLessonModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tên bài học</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Phép Nhân Số Thập Phân"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Khối lớp</label>
                    <select className="w-full p-2.5 rounded-xl border border-stone-200 bg-white">
                      <option value="5">Lớp 5 (Tiểu học)</option>
                      <option value="8">Lớp 8 (THCS)</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-stone-700 block mb-1">Điểm thưởng XP</label>
                    <input
                      type="number"
                      defaultValue={150}
                      className="w-full p-2.5 rounded-xl border border-stone-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Thời lượng dự kiến (phút)</label>
                  <input
                    type="number"
                    defaultValue={15}
                    className="w-full p-2.5 rounded-xl border border-stone-200"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => setNewLessonModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    addAuditLog('Tạo bài học mới', 'Phép Nhân Số Thập Phân', 'Đã lưu cấu trúc 4 bước');
                    showNotification('Đã tạo bài học mới thành công!');
                    setNewLessonModalOpen(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md"
                >
                  Lưu Bài Học
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL TẠO LỚP HỌC MỚI */}
        {newClassModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-lg text-stone-900">Tạo Lớp Học Mới</h4>
                <button
                  onClick={() => setNewClassModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tên lớp học</label>
                  <input
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="Ví dụ: Lớp 5A4 - Kiến Năng Động"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Khối lớp</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white"
                  >
                    <option value={5}>Lớp 5 (Tiểu học)</option>
                    <option value={8}>Lớp 8 (THCS)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Giáo viên phụ trách</label>
                  <input
                    type="text"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                    placeholder="Ví dụ: Cô Trần Thu Thảo"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Phòng học</label>
                  <input
                    type="text"
                    value={newClassRoom}
                    onChange={(e) => setNewClassRoom(e.target.value)}
                    placeholder="Ví dụ: Phòng 204 - Nhà A"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => setNewClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateClass}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md"
                >
                  Tạo Lớp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL THÊM QUẢN TRỊ VIÊN MỚI */}
        {newAdminModalOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-md w-full border border-stone-200 shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-lg text-stone-900">Thêm Quản Trị Viên Mới</h4>
                <button
                  onClick={() => setNewAdminModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Ví dụ: Lê Văn An"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Email quản trị</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="Ví dụ: levanan@kienhoc.vn"
                    className="w-full p-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Loại User & Vai trò Quản Lý</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                    className="w-full p-2.5 rounded-xl border border-stone-200 bg-white font-bold"
                  >
                    <option value="super_admin">👑 Super Admin (Toàn quyền)</option>
                    <option value="lesson_manager">📚 Quản lý bài học</option>
                    <option value="subject_manager">🏷️ Quản lý môn học</option>
                    <option value="grade_manager">🏫 Quản lý lớp</option>
                    <option value="content_manager">🎯 Quản lý nội dung</option>
                    <option value="student_manager">🎒 Quản lý học viên</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  onClick={() => setNewAdminModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAdmin}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md"
                >
                  Phân Quyền
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XEM & SỬA BÀI HỌC (CHI TIẾT 4 BƯỚC) */}
        {editingLesson && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl p-5 sm:p-6 space-y-4 my-auto max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div>
                  <h4 className="font-black text-lg text-stone-900">{editingLesson.title}</h4>
                  <p className="text-xs text-stone-500">{editingLesson.unit} • Khối Lớp {editingLesson.grade}</p>
                </div>
                <button
                  onClick={() => setEditingLesson(null)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                {/* Chặng 1: Khám phá */}
                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <div className="font-black text-blue-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Chặng 1: Khám Phá (Cốt Truyện Thực Tế)</span>
                  </div>
                  <div className="text-stone-700 font-semibold">{editingLesson.discover.storyTitle}</div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{editingLesson.discover.storyContent}</p>
                </div>

                {/* Chặng 2: Luyện tập */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                  <div className="font-black text-emerald-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Chặng 2: Luyện Tập Tương Tác</span>
                  </div>
                  <div className="text-stone-700 font-semibold">{editingLesson.practice.challengeTitle}</div>
                  <p className="text-stone-600 text-[11px]">{editingLesson.practice.instructions}</p>
                </div>

                {/* Chặng 3: Vận dụng */}
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <div className="font-black text-amber-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Chặng 3: Vận Dụng Tình Huống</span>
                  </div>
                  <div className="text-stone-700 font-semibold">{editingLesson.apply.dilemmaTitle}</div>
                  <p className="text-stone-600 text-[11px]">{editingLesson.apply.situation}</p>
                </div>

                {/* Chặng 4: Giảng lại */}
                <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                  <div className="font-black text-purple-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Chặng 4: Giảng Lại Cho Bạn (Socratic AI)</span>
                  </div>
                  <div className="text-stone-700 font-semibold">{editingLesson.teachBack.promptTitle}</div>
                  <p className="text-stone-600 text-[11px]">{editingLesson.teachBack.guidingQuestion}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                <span className="text-[11px] text-stone-500">
                  Dữ liệu được đồng bộ trực tiếp với Supabase
                </span>
                <button
                  onClick={() => {
                    addAuditLog('Cập nhật bài học', editingLesson.title, 'Đã xác nhận cấu trúc 4 bước.');
                    showNotification(`Đã lưu cập nhật bài "${editingLesson.title}"!`);
                    setEditingLesson(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md"
                >
                  Xác Nhận & Lưu
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
