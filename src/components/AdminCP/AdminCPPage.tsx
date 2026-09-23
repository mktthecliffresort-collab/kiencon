import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  Wrench,
  Users,
  LogOut,
  ArrowLeft,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  LogIn,
  Key,
  Layers,
  BookOpen,
  Activity,
  FileCode,
  Check,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  Plus,
  Search,
  Filter,
  School,
  GraduationCap,
  FileText,
  Award,
  Flame,
  Clock,
  ArrowUpRight,
  Server,
  Zap,
  Edit2,
  Trash2,
  Star,
  Sliders,
  EyeOff,
  Bot,
} from 'lucide-react';
import {
  AdminUser,
  AdminRole,
  AdminClassInfo,
  AdminAuditLog,
  Lesson,
  Subject,
  GradeLevel,
  DailyQuest,
  UserProfile,
  KHTNDomain,
  AIConfig,
} from '../../types';
import { adminService, DEMO_ADMINS } from '../../services/adminService';
import { supabaseService } from '../../services/supabaseService';
import { audioService } from '../../services/audioService';
import { ALLIES } from '../../data/alliesData';

interface AdminCPPageProps {
  onBackToApp: () => void;
  lessons: Lesson[];
  subjects: Subject[];
  quests: DailyQuest[];
  currentUser: UserProfile;
  onUpdateLessons?: (lessons: Lesson[]) => void;
  onUpdateSubjects?: (subjects: Subject[]) => void;
  onUpdateQuests?: (quests: DailyQuest[]) => void;
}

// 6 Admin Roles Configuration with RBAC Permissions
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
    accessibleTabs: ['overview', 'lessons', 'subjects', 'classes', 'content', 'students', 'staff', 'database', 'production', 'ai_config'],
  },
  lesson_manager: {
    role: 'lesson_manager',
    name: 'Quản Lý Bài Học',
    shortTitle: 'Lesson Manager',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    icon: '📚',
    description: 'Biên soạn, cấu trúc 4 bước (Khám phá, Luyện tập, Vận dụng, Giảng lại), phân phối điểm XP và xuất bản bài học.',
    accessibleTabs: ['overview', 'lessons', 'content', 'ai_config'],
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
    accessibleTabs: ['overview', 'content', 'lessons', 'ai_config'],
  },
  student_manager: {
    role: 'student_manager',
    name: 'Quản Lý Học Viên',
    shortTitle: 'Student Manager',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    icon: '🎒',
    description: 'Quản trị hồ sơ học viên, theo dõi tiến độ học tập, khích lệ streak ngày và khen thưởng điểm kinh nghiệm XP.',
    accessibleTabs: ['overview', 'students'],
  },
};

interface ManagedStudent {
  id: string;
  name: string;
  nickname: string;
  grade: GradeLevel;
  className: string;
  school: string;
  xp: number;
  streak: number;
  level: number;
  lastActive: string;
}

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

const INITIAL_STUDENTS: ManagedStudent[] = [
  {
    id: 'stu_1',
    name: 'Minh Khang',
    nickname: 'Kiến Siêu Trí Tuệ',
    grade: 5,
    className: '5A1',
    school: 'Tiểu học Dịch Vọng A',
    xp: 2850,
    streak: 12,
    level: 7,
    lastActive: '10 phút trước',
  },
  {
    id: 'stu_2',
    name: 'Bảo Anh',
    nickname: 'Kiến Nhanh Nhẹn',
    grade: 5,
    className: '5A2',
    school: 'Tiểu học Thực Nghiệm',
    xp: 2420,
    streak: 9,
    level: 6,
    lastActive: 'Hôm nay 09:15',
  },
  {
    id: 'stu_3',
    name: 'Tuấn Kiệt',
    nickname: 'Nhà Bác Học Nhí',
    grade: 8,
    className: '8A',
    school: 'THCS Cầu Giấy',
    xp: 4200,
    streak: 15,
    level: 10,
    lastActive: '15 phút trước',
  },
  {
    id: 'stu_4',
    name: 'Hà Linh',
    nickname: 'Kiến Vui Vẻ',
    grade: 8,
    className: '8B',
    school: 'THCS Giảng Võ',
    xp: 3890,
    streak: 8,
    level: 9,
    lastActive: 'Hôm qua 18:20',
  },
  {
    id: 'stu_5',
    name: 'Gia Huy',
    nickname: 'Kiến Khám Phá',
    grade: 5,
    className: '5A3',
    school: 'Tiểu học Nghĩa Tân',
    xp: 1950,
    streak: 5,
    level: 5,
    lastActive: '2 ngày trước',
  },
];

export const AdminCPPage: React.FC<AdminCPPageProps> = ({
  onBackToApp,
  lessons: initialLessons,
  subjects: initialSubjects,
  quests: initialQuests,
  currentUser,
  onUpdateLessons,
  onUpdateSubjects,
  onUpdateQuests,
}) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => adminService.getCurrentAdmin());

  // Active navigation tab: mapped directly to requirements
  const [activeTab, setActiveTab] = useState<
    'overview' | 'lessons' | 'subjects' | 'classes' | 'content' | 'students' | 'staff' | 'database' | 'production' | 'ai_config'
  >('overview');

  // AI Configuration State
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => adminService.getAIConfig());
  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [testingAI, setTestingAI] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    reply?: string;
    model?: string;
    message?: string;
  } | null>(null);
  const [aiSavedSuccess, setAiSavedSuccess] = useState<boolean>(false);
  const [showApiKey, setShowApiKey] = useState<boolean>(false);

  // Mobile drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filter & Search
  const [gradeFilter, setGradeFilter] = useState<'all' | 5 | 8>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Local state for managed entities
  const [managedLessons, setManagedLessons] = useState<Lesson[]>(initialLessons);
  const [managedSubjects, setManagedSubjects] = useState<Subject[]>(initialSubjects);
  const [managedQuests, setManagedQuests] = useState<DailyQuest[]>(initialQuests);
  const [classesList, setClassesList] = useState<AdminClassInfo[]>(INITIAL_CLASSES);
  const [studentsList, setStudentsList] = useState<ManagedStudent[]>(INITIAL_STUDENTS);
  const [staffList, setStaffList] = useState<AdminUser[]>(DEMO_ADMINS);

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([
    {
      id: 'log_1',
      timestamp: '11:20:15 - Hôm nay',
      adminName: 'Nguyễn Minh Hoàng',
      role: 'super_admin',
      action: 'Khởi tạo phiên quản trị hệ thống',
      target: 'Toàn bộ hệ thống Kiến Học',
      details: 'Đồng bộ cơ sở dữ liệu Supabase & cấu hình bảng riêng admin_users',
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
    {
      id: 'log_3',
      timestamp: '09:30:12 - Hôm nay',
      adminName: 'TS. Lê Quang Vũ',
      role: 'subject_manager',
      action: 'Đồng bộ chương trình môn học',
      target: 'Môn KHTN Lớp 8',
      details: 'Phân định 3 phân môn: Vật Lí, Hóa Học, Sinh Học',
    },
  ]);

  // Notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Database Tab state
  const [dbTesting, setDbTesting] = useState(false);
  const [dbSyncing, setDbSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: false,
    connected: supabaseService.isConfigured(),
    message: supabaseService.isConfigured()
      ? 'Đã kết nối máy chủ Supabase sẵn sàng.'
      : 'Đang hoạt động ở chế độ Local Data an toàn.',
  });
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Modals inside AdminCP
  const [newLessonModalOpen, setNewLessonModalOpen] = useState(false);
  const [newClassModalOpen, setNewClassModalOpen] = useState(false);
  const [newAdminModalOpen, setNewAdminModalOpen] = useState(false);
  const [selectedLessonForStepView, setSelectedLessonForStepView] = useState<Lesson | null>(null);

  // Form states for modals
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonGrade, setNewLessonGrade] = useState<GradeLevel>(5);
  const [newLessonSubject, setNewLessonSubject] = useState('toan_5');
  const [newLessonUnit, setNewLessonUnit] = useState('Chương 1: Ôn Tập & Bổ Sung');
  const [newLessonXP, setNewLessonXP] = useState(120);

  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState<GradeLevel>(5);
  const [newClassTeacher, setNewClassTeacher] = useState('');
  const [newClassRoom, setNewClassRoom] = useState('');

  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>('lesson_manager');

  useEffect(() => {
    const unsub = adminService.subscribe((admin) => {
      setCurrentAdmin(admin);
    });
    return unsub;
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    audioService.playSuccess();
    setTimeout(() => setToastMessage(null), 3500);
  };

  const addAudit = (action: string, target: string, details: string) => {
    const roleName = currentAdmin ? ADMIN_ROLES_CONFIG[currentAdmin.role]?.name : 'Admin';
    const newLog: AdminAuditLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' - Vừa xong',
      adminName: roleName,
      role: currentAdmin?.role || 'super_admin',
      action,
      target,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    audioService.playClick();

    if (!loginEmail.trim()) {
      setLoginError('Vui lòng nhập email quản trị viên.');
      return;
    }

    const res = adminService.loginWithEmail(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Email quản trị viên không chính xác!');
    } else {
      showToast(`Đăng nhập thành công với vai trò: ${res.admin?.roleTitle}`);
    }
  };

  const handleImpersonate = (adminId: string) => {
    audioService.playSuccess();
    const admin = adminService.impersonate(adminId);
    if (admin) {
      setCurrentAdmin(admin);
      showToast(`Đã chuyển vai trò sang: ${admin.roleTitle} (${admin.name})`);
      addAudit('Chuyển vai trò quản trị', admin.roleTitle, `Đóng vai tài khoản ${admin.name} (${admin.email})`);
    }
  };

  const handleLogout = () => {
    audioService.playClick();
    adminService.logout();
    setCurrentAdmin(null);
  };

  const handleTestDatabase = async () => {
    audioService.playClick();
    setDbTesting(true);
    const start = performance.now();
    try {
      const res = await supabaseService.checkStatus();
      const latency = res.latencyMs ?? Math.round(performance.now() - start);
      setDbStatus({
        tested: true,
        connected: res.connected,
        message: res.message,
        latencyMs: latency,
      });
      if (res.connected) {
        audioService.playSuccess();
        showToast(`Kết nối Supabase ổn định (${latency}ms)`);
        addAudit('Kiểm tra máy chủ CSDL', 'Supabase PostgreSQL', `Trạng thái: Hoạt động (${latency}ms)`);
      }
    } catch {
      setDbStatus({
        tested: true,
        connected: false,
        message: 'Không thể kết nối đến máy chủ Supabase.',
      });
    } finally {
      setDbTesting(false);
    }
  };

  const handleSyncDatabase = async () => {
    audioService.playClick();
    setDbSyncing(true);
    setSyncMessage(null);
    try {
      await supabaseService.syncProfileToSupabase(currentUser);
      setSyncMessage('Đã đồng bộ dữ liệu người dùng và tiến độ học tập lên Supabase thành công! 🚀');
      showToast('Đồng bộ CSDL Supabase hoàn tất!');
      addAudit('Đồng bộ dữ liệu CSDL', 'public.users', 'Cập nhật hồ sơ học viên & tiến độ lên đám mây');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncMessage(`Lỗi đồng bộ: ${msg}`);
    } finally {
      setDbSyncing(false);
    }
  };

  // RBAC Tab access check
  const activeRoleConfig = currentAdmin ? ADMIN_ROLES_CONFIG[currentAdmin.role] : ADMIN_ROLES_CONFIG.super_admin;
  const canAccessTab = (tabKey: string) => {
    if (!currentAdmin || currentAdmin.role === 'super_admin') return true;
    return activeRoleConfig.accessibleTabs.includes(tabKey);
  };

  // Award XP to student
  const handleAwardXP = (studentId: string, amount: number) => {
    audioService.playSuccess();
    setStudentsList((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, xp: s.xp + amount, level: Math.floor((s.xp + amount) / 400) + 1 } : s))
    );
    const stu = studentsList.find((s) => s.id === studentId);
    showToast(`Đã cộng +${amount} XP khích lệ cho học viên ${stu?.name || ''}`);
    addAudit('Thưởng điểm XP khích lệ', `Học viên: ${stu?.name || studentId}`, `Cộng +${amount} XP`);
  };

  // Create new class
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
    showToast(`Đã tạo mới lớp "${newClass.name}" thành công!`);
    addAudit('Tạo mới lớp học', newClass.name, `Khối Lớp ${newClass.grade}, GV: ${newClass.headTeacher}`);
    setNewClassName('');
    setNewClassTeacher('');
    setNewClassRoom('');
    setNewClassModalOpen(false);
  };

  // Create new lesson
  const handleCreateLesson = () => {
    if (!newLessonTitle.trim()) {
      alert('Vui lòng nhập tiêu đề bài học!');
      return;
    }
    const newL: Lesson = {
      id: `lesson_custom_${Date.now()}`,
      title: newLessonTitle.trim(),
      subtitle: 'Bài học biên soạn từ AdminCP',
      grade: newLessonGrade,
      subjectId: newLessonSubject,
      unit: newLessonUnit,
      allyId: 'kien_con',
      estimatedMinutes: 15,
      xpReward: newLessonXP,
      discover: {
        conceptHeadline: `Khám phá bài học: ${newLessonTitle}`,
        scenarioStory: 'Câu chuyện tình huống khám phá kiến thức mới.',
        visualAidType: 'diagram',
        interactivePrompt: 'Quan sát và trả lời câu hỏi khởi động:',
        initialQuestion: 'Em nhận xét gì về bài toán trên?',
        choices: [
          { text: 'Lựa chọn A (Đúng)', isCorrect: true, feedback: 'Chính xác!' },
          { text: 'Lựa chọn B', isCorrect: false, feedback: 'Thử lại nhé!' },
        ],
      },
      practice: {
        totalSteps: 2,
        questions: [
          {
            id: 'q1',
            prompt: 'Câu hỏi thực hành bước 1',
            options: ['Đáp án 1', 'Đáp án 2'],
            correctIndex: 0,
            explanation: 'Giải thích chi tiết',
          },
        ],
      },
      apply: {
        challengeTitle: 'Thử thách vận dụng thực tế',
        realWorldScenario: 'Áp dụng vào cuộc sống hàng ngày',
        choices: [
          {
            choiceText: 'Giải pháp tối ưu',
            isOptimal: true,
            scientificReason: 'Lí do khoa học chuẩn xác',
          },
        ],
        hintStage1: 'Gợi ý bước 1',
        hintStage2: 'Gợi ý bước 2',
      },
      teachBack: {
        promptTitle: 'Giảng lại bài học cho bạn bè',
        guidingQuestion: 'Em hãy tóm tắt nội dung trọng tâm bằng lời của mình:',
        helperBulletPoints: ['Ý chính 1', 'Ý chính 2'],
        sampleStarters: ['Theo em hiểu...', 'Bước đầu tiên là...'],
        expectedConcepts: ['khái niệm', 'phương pháp'],
      },
    };
    const updated = [newL, ...managedLessons];
    setManagedLessons(updated);
    if (onUpdateLessons) onUpdateLessons(updated);
    showToast(`Đã xuất bản bài học "${newL.title}" thành công!`);
    addAudit('Biên soạn bài học mới', newL.title, `Khối Lớp ${newL.grade}, XP: +${newL.xpReward}`);
    setNewLessonTitle('');
    setNewLessonModalOpen(false);
  };

  // Create new admin
  const handleCreateAdmin = () => {
    if (!newAdminName.trim() || !newAdminEmail.trim()) {
      alert('Vui lòng nhập họ tên và email quản trị viên!');
      return;
    }
    const roleConf = ADMIN_ROLES_CONFIG[newAdminRole];
    const newAdminUser: AdminUser = {
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
    setStaffList((prev) => [...prev, newAdminUser]);
    showToast(`Đã cấp quyền cho quản trị viên ${newAdminUser.name}!`);
    addAudit('Tạo tài khoản quản trị', newAdminUser.name, `Vai trò: ${roleConf.name} (${newAdminUser.email})`);
    setNewAdminName('');
    setNewAdminEmail('');
    setNewAdminModalOpen(false);
  };

  // --------------------------------------------------------------------------
  // VIEW 1: ADMIN LOGIN GATE (Nếu chưa đăng nhập)
  // --------------------------------------------------------------------------
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto w-full pt-4">
          {/* Top Back bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => {
                audioService.playClick();
                onBackToApp();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-xs sm:text-sm font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang học sinh Kiến Học</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>/admincp</span>
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-stone-800/90 border border-stone-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center max-w-xl mx-auto mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-3xl shadow-lg mx-auto mb-3 border border-amber-300/40">
                🛡️
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1.5">
                CỔNG ĐIỀU HÀNH KIẾN HỌC • ADMINCP
              </h1>
              <p className="text-xs sm:text-sm text-stone-400">
                Khu vực dành cho Ban Giám Hiệu, Trưởng Bộ Môn & Quản Trị Viên. Vui lòng đăng nhập hoặc chọn 1 tài khoản quản trị demo bên dưới.
              </p>
            </div>

            {/* Email login form */}
            <form onSubmit={handleLogin} className="max-w-md mx-auto mb-8 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email Quản Trị Viên
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="mkt.thecliffresort@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 focus:border-amber-500 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Mật Khẩu Quản Trị
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-900 border border-stone-700 focus:border-amber-500 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
                  />
                </div>
              </div>

              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Ban Quản Trị</span>
              </button>
            </form>

            {/* Quick Demo 1-Click Select */}
            <div className="border-t border-stone-700 pt-6">
              <h3 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span>👑</span>
                <span>Tài Khoản Quản Lý Mẫu (1-Click Đóng Vai Nhanh):</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {DEMO_ADMINS.map((admin) => (
                  <button
                    key={admin.id}
                    onClick={() => handleImpersonate(admin.id)}
                    className="p-3 rounded-2xl bg-stone-900/80 hover:bg-stone-700/80 border border-stone-700 text-left transition-all hover:scale-102 flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-stone-800 flex items-center justify-center text-xl shrink-0 group-hover:bg-amber-500/20">
                      {admin.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-black text-white truncate">{admin.name}</div>
                      <div className="text-[11px] text-amber-400 font-semibold truncate">{admin.roleTitle}</div>
                      <div className="text-[10px] text-stone-400 truncate">{admin.email}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center text-[11px] text-stone-500 pt-6">
          Kiến Học AdminCP • Bảo Mật RBAC Chuẩn Bảng Riêng admin_users & Supabase
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW 2: FULL RESPONSIVE DASHBOARD (ADMIN PORTAL DIRECTLY)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-2xl shadow-xl border border-stone-700 text-xs sm:text-sm font-bold animate-bounce-short">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER: Clean, crisp, professional (Matching Image 5) */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 shadow-md">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Left: Mobile hamburger + Logo & Portal Title */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger button visible on mobile & tablet */}
            <button
              onClick={() => {
                audioService.playClick();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="lg:hidden p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200"
              title="Menu Phân Hệ"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md border border-amber-300/40 shrink-0">
              🐜
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-base sm:text-lg lg:text-xl tracking-tight text-white whitespace-nowrap">
                  KIẾN HỌC • TRANG QUẢN TRỊ
                </h1>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider shrink-0">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-stone-400 hidden md:block truncate">
                Hệ thống quản lý toàn diện: Bài học, Môn học, Lớp học, Nội dung & Học viên
              </p>
            </div>
          </div>

          {/* Right: Role Switcher & Navigation actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Role dropdown switcher */}
            <div className="flex items-center bg-stone-800/90 border border-stone-700 rounded-2xl px-2.5 py-1 text-xs">
              <span className="text-stone-400 mr-1.5 text-[11px] hidden sm:inline">Đang đóng vai:</span>
              <select
                value={currentAdmin.role}
                onChange={(e) => {
                  const role = e.target.value as AdminRole;
                  const targetAdmin = DEMO_ADMINS.find((a) => a.role === role);
                  if (targetAdmin) {
                    handleImpersonate(targetAdmin.id);
                  }
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

            {/* Back to App */}
            <button
              onClick={() => {
                audioService.playClick();
                onBackToApp();
              }}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors flex items-center gap-1.5"
              title="Về ứng dụng học tập học sinh"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">Về Học Sinh</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition-colors flex items-center gap-1"
              title="Đăng xuất quản trị"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Thoát</span>
            </button>
          </div>
        </div>

        {/* SUBHEADER: Active role indicator & Realtime status (Image 5) */}
        <div className="bg-stone-950 px-4 sm:px-6 lg:px-8 py-2 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">{activeRoleConfig.icon}</span>
            <span className="font-black text-white">{currentAdmin.name}</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${activeRoleConfig.badgeColor}`}>
              {activeRoleConfig.shortTitle}
            </span>
          </div>

          <div className="flex items-center gap-2 text-stone-400 text-[11px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="hidden sm:inline">Phiên quản trị an toàn (Supabase Live / admin_users)</span>
            <span className="sm:hidden">Supabase Live</span>
          </div>
        </div>
      </header>

      {/* DASHBOARD BODY CONTAINER: Responsive Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* MOBILE SIDEBAR DRAWER OVERLAY */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR NAVIGATION: Responsive (Desktop fixed / Mobile Drawer) */}
        <aside
          className={`fixed lg:static top-0 bottom-0 left-0 z-50 lg:z-10 w-64 bg-stone-900 border-r border-stone-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          {/* Mobile drawer header */}
          <div className="p-4 border-b border-stone-800 flex lg:hidden items-center justify-between text-white">
            <span className="font-black text-sm tracking-tight text-amber-400">DANH MỤC QUẢN TRỊ</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menu Sections */}
          <div className="p-3 space-y-6 overflow-y-auto flex-1">
            {/* GROUP 1: PHÂN HỆ QUẢN LÝ */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-stone-400">
                PHÂN HỆ QUẢN LÝ
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Tổng Quan', icon: Activity },
                  { id: 'lessons', label: 'Quản Lý Bài Học', icon: BookOpen },
                  { id: 'subjects', label: 'Quản Lý Môn Học', icon: Layers },
                  { id: 'classes', label: 'Quản Lý Lớp', icon: School },
                  { id: 'content', label: 'Quản Lý Nội Dung', icon: FileText },
                  { id: 'students', label: 'Quản Lý Học Viên', icon: GraduationCap },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const allowed = canAccessTab(item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={!allowed}
                      onClick={() => {
                        audioService.playClick();
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                          : allowed
                          ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                          : 'text-stone-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {!allowed && <Lock className="w-3 h-3 text-stone-600" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* GROUP 2: HỆ THỐNG */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-black uppercase tracking-wider text-stone-400">
                HỆ THỐNG
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'staff', label: 'Nhân Sự & Quyền', icon: Users },
                  { id: 'database', label: 'Quản Lý CSDL Supabase', icon: Database },
                  { id: 'production', label: 'Chẩn Đoán & Nhật Ký', icon: Wrench },
                  { id: 'ai_config', label: 'Cấu Hình AI (Gemini)', icon: Bot },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  const allowed = canAccessTab(item.id);
                  return (
                    <button
                      key={item.id}
                      disabled={!allowed}
                      onClick={() => {
                        audioService.playClick();
                        setActiveTab(item.id as any);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-xs transition-all ${
                        isActive
                          ? 'bg-amber-500 text-stone-950 font-black shadow-sm'
                          : allowed
                          ? 'text-stone-300 hover:bg-stone-800 hover:text-white'
                          : 'text-stone-600 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-stone-950' : 'text-stone-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {!allowed && <Lock className="w-3 h-3 text-stone-600" />}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Sidebar bottom admin profile summary */}
          <div className="p-3 border-t border-stone-800 bg-stone-950/60">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-stone-900 border border-stone-800">
              <span className="text-xl">{currentAdmin.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-black text-white truncate">{currentAdmin.name}</div>
                <div className="text-[10px] text-amber-400 font-semibold truncate">{currentAdmin.roleTitle}</div>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-400 hover:bg-stone-800"
                title="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN DASHBOARD CONTENT AREA: Responsive (Desktop / Tablet / Mobile) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {/* RBAC PERMISSION WARNING IF ACCESSING RESTRICTED TAB */}
          {!canAccessTab(activeTab) && (
            <div className="bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 text-center max-w-lg mx-auto my-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="font-black text-base text-rose-950 mb-1">
                Quyền Hạn Bị Giới Hạn Theo Vai Trò
              </h3>
              <p className="text-xs text-rose-800 mb-4">
                Vai trò <strong>{activeRoleConfig.name}</strong> không có quyền quản lý phân hệ này. Vui lòng chuyển sang vai trò Super Admin để truy cập.
              </p>
              <button
                onClick={() => {
                  const superAdmin = DEMO_ADMINS.find((a) => a.role === 'super_admin');
                  if (superAdmin) handleImpersonate(superAdmin.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm"
              >
                Chuyển Sang Super Admin
              </button>
            </div>
          )}

          {canAccessTab(activeTab) && (
            <>
              {/* ========================================================= */}
              {/* TAB 1: TỔNG QUAN (OVERVIEW - Exact Match to Image 5 & 1)   */}
              {/* ========================================================= */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top Header */}
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      Tổng Quan Hệ Thống Kiến Học
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Báo cáo tổng hợp số liệu thực tế về bài học, môn học, lớp học và học viên.
                    </p>
                  </div>

                  {/* 4 STAT METRIC CARDS (Responsive: 1 col on mobile, 2 col on tablet, 4 col on desktop) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Tổng bài học */}
                    <div className="bg-amber-50/60 border border-amber-200/80 rounded-3xl p-5 shadow-2xs relative overflow-hidden">
                      <div className="flex items-center justify-between text-amber-900 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider">Tổng Bài Học</span>
                        <BookOpen className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-stone-950 mb-1">
                        {managedLessons.length}
                      </div>
                      <div className="text-xs text-amber-800 font-semibold">
                        Lớp 5: {managedLessons.filter((l) => l.grade === 5).length} bài • Lớp 8:{' '}
                        {managedLessons.filter((l) => l.grade === 8).length} bài
                      </div>
                    </div>

                    {/* Card 2: Môn học hoạt động */}
                    <div className="bg-sky-50/60 border border-sky-200/80 rounded-3xl p-5 shadow-2xs relative overflow-hidden">
                      <div className="flex items-center justify-between text-sky-900 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider">Môn Học Hoạt Động</span>
                        <Layers className="w-5 h-5 text-sky-600" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-stone-950 mb-1">
                        {managedSubjects.length}
                      </div>
                      <div className="text-xs text-sky-800 font-semibold truncate">
                        Toán học, KHTN (Lí, Hóa, Sinh)...
                      </div>
                    </div>

                    {/* Card 3: Lớp học vận hành */}
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-3xl p-5 shadow-2xs relative overflow-hidden">
                      <div className="flex items-center justify-between text-emerald-900 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider">Lớp Học Vận Hành</span>
                        <School className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-stone-950 mb-1">
                        {classesList.length}
                      </div>
                      <div className="text-xs text-emerald-800 font-semibold">
                        Tổng {classesList.reduce((acc, c) => acc + c.studentCount, 0)} học sinh theo lớp
                      </div>
                    </div>

                    {/* Card 4: Đội ngũ quản trị */}
                    <div className="bg-purple-50/60 border border-purple-200/80 rounded-3xl p-5 shadow-2xs relative overflow-hidden">
                      <div className="flex items-center justify-between text-purple-900 mb-2">
                        <span className="text-xs font-black uppercase tracking-wider">Đội Ngũ Quản Trị</span>
                        <ShieldCheck className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="text-3xl sm:text-4xl font-black text-stone-950 mb-1">
                        {staffList.length}
                      </div>
                      <div className="text-xs text-purple-800 font-semibold">
                        6 chức danh quản trị phân quyền
                      </div>
                    </div>
                  </div>

                  {/* CƠ CẤU PHÂN QUYỀN QUẢN LÝ (ADMIN ROLES) - Interactive switching grid */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-amber-600" />
                        <h3 className="font-black text-sm sm:text-base text-stone-900 uppercase tracking-tight">
                          CƠ CẤU PHÂN QUYỀN QUẢN LÝ (ADMIN ROLES)
                        </h3>
                      </div>
                      <span className="text-xs text-stone-500 font-medium">
                        Nhấp để xem hoặc chuyển đổi quyền đóng vai
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.values(ADMIN_ROLES_CONFIG).map((roleItem) => {
                        const isSelected = currentAdmin.role === roleItem.role;
                        const matchingAdmin = staffList.find((a) => a.role === roleItem.role);
                        return (
                          <div
                            key={roleItem.role}
                            onClick={() => {
                              if (matchingAdmin) handleImpersonate(matchingAdmin.id);
                            }}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? 'bg-amber-50/50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                                : 'bg-stone-50/50 border-stone-200 hover:border-stone-300 hover:bg-stone-100/50'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xl">{roleItem.icon}</span>
                                  <span className="font-black text-xs sm:text-sm text-stone-900">
                                    {roleItem.name}
                                  </span>
                                </div>
                                {isSelected ? (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
                                    Đang chọn
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-stone-400 font-semibold">Đóng vai</span>
                                )}
                              </div>
                              <p className="text-[11px] text-stone-600 line-clamp-3 leading-relaxed mb-3">
                                {roleItem.description}
                              </p>
                            </div>

                            {matchingAdmin && (
                              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
                                <span className="font-bold truncate">{matchingAdmin.name}</span>
                                <span className="text-[10px] font-mono text-stone-400">{matchingAdmin.email}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* QUICK SHORTCUTS & ACTIVITY FEED */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Quick shortcuts */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
                      <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>Phím Tắt Thao Tác Nhanh</span>
                      </h3>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => {
                            audioService.playClick();
                            setNewLessonModalOpen(true);
                          }}
                          className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-left transition-colors"
                        >
                          <div className="font-black text-xs text-amber-950 flex items-center gap-1.5 mb-1">
                            <Plus className="w-3.5 h-3.5 text-amber-700" />
                            <span>Thêm Bài Học Mới</span>
                          </div>
                          <div className="text-[11px] text-amber-800">Biên soạn 4 bước học tập</div>
                        </button>

                        <button
                          onClick={() => {
                            audioService.playClick();
                            setNewClassModalOpen(true);
                          }}
                          className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-left transition-colors"
                        >
                          <div className="font-black text-xs text-emerald-950 flex items-center gap-1.5 mb-1">
                            <School className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Tạo Lớp Học Mới</span>
                          </div>
                          <div className="text-[11px] text-emerald-800">Khối Lớp 5 & Lớp 8</div>
                        </button>

                        <button
                          onClick={() => {
                            audioService.playClick();
                            setActiveTab('database');
                          }}
                          className="p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200 text-left transition-colors"
                        >
                          <div className="font-black text-xs text-sky-950 flex items-center gap-1.5 mb-1">
                            <Database className="w-3.5 h-3.5 text-sky-700" />
                            <span>Kiểm Tra CSDL</span>
                          </div>
                          <div className="text-[11px] text-sky-800">Supabase live latency</div>
                        </button>

                        <button
                          onClick={() => {
                            audioService.playClick();
                            setActiveTab('production');
                          }}
                          className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-left transition-colors"
                        >
                          <div className="font-black text-xs text-purple-950 flex items-center gap-1.5 mb-1">
                            <Wrench className="w-3.5 h-3.5 text-purple-700" />
                            <span>Chẩn Đoán Server</span>
                          </div>
                          <div className="text-[11px] text-purple-800">Kiểm tra production live</div>
                        </button>
                      </div>
                    </div>

                    {/* Recent audit activity */}
                    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm text-stone-900 flex items-center gap-2">
                          <Clock className="w-4 h-4 text-stone-500" />
                          <span>Nhật Ký Thao Tác Gần Nhất</span>
                        </h3>
                        <button
                          onClick={() => setActiveTab('production')}
                          className="text-xs font-bold text-amber-600 hover:text-amber-700"
                        >
                          Xem tất cả →
                        </button>
                      </div>
                      <div className="space-y-2">
                        {auditLogs.slice(0, 3).map((log) => (
                          <div key={log.id} className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-stone-900">{log.action}</span>
                              <span className="text-[10px] text-stone-400">{log.timestamp}</span>
                            </div>
                            <div className="text-[11px] text-stone-600 truncate">{log.target}: {log.details}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: QUẢN LÝ BÀI HỌC (LESSONS)                          */}
              {/* ========================================================= */}
              {activeTab === 'lessons' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        Quản Lý Bài Học Chuẩn 4 Bước
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Cấu trúc 4 giai đoạn: Khám phá • Luyện tập • Vận dụng • Giảng lại
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audioService.playClick();
                        setNewLessonModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Bài Học Mới</span>
                    </button>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl border border-stone-200 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-600">Khối lớp:</span>
                      {(['all', 5, 8] as const).map((g) => (
                        <button
                          key={String(g)}
                          onClick={() => setGradeFilter(g)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            gradeFilter === g
                              ? 'bg-amber-500 text-stone-950 font-black'
                              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                          }`}
                        >
                          {g === 'all' ? 'Tất cả' : `Lớp ${g}`}
                        </button>
                      ))}
                    </div>

                    <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm bài học..."
                        className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-stone-50 border border-stone-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Lessons Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {managedLessons
                      .filter((l) => {
                        const matchG = gradeFilter === 'all' || l.grade === gradeFilter;
                        const matchQ =
                          !searchQuery.trim() ||
                          l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          l.unit.toLowerCase().includes(searchQuery.toLowerCase());
                        return matchG && matchQ;
                      })
                      .map((lesson) => (
                        <div
                          key={lesson.id}
                          className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs hover:border-amber-300 transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md bg-stone-100 font-bold text-[10px] text-stone-700">
                                  Lớp {lesson.grade}
                                </span>
                                <span className="text-[11px] text-amber-700 font-semibold">{lesson.unit}</span>
                              </div>
                              <h3 className="font-black text-sm sm:text-base text-stone-950 leading-snug">
                                {lesson.title}
                              </h3>
                              <p className="text-xs text-stone-500 line-clamp-1">{lesson.subtitle}</p>
                            </div>

                            <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black text-xs shrink-0">
                              +{lesson.xpReward} XP
                            </span>
                          </div>

                          {/* 4-step indicator badges */}
                          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-stone-100 text-[10px] font-bold text-center">
                            <span className="p-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                              1. Khám phá
                            </span>
                            <span className="p-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                              2. Luyện tập
                            </span>
                            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                              3. Vận dụng
                            </span>
                            <span className="p-1 rounded-lg bg-purple-50 text-purple-900 border border-purple-200">
                              4. Giảng lại
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-stone-400">⏱️ {lesson.estimatedMinutes} phút</span>
                            <button
                              onClick={() => setSelectedLessonForStepView(lesson)}
                              className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors"
                            >
                              Xem Chi Tiết 4 Bước →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: QUẢN LÝ MÔN HỌC (SUBJECTS)                         */}
              {/* ========================================================= */}
              {activeTab === 'subjects' && (
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      Danh Mục Môn Học & Phân Nhánh KHTN
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Phân phối chương trình Lớp 5 & Tích hợp 3 phân môn KHTN Lớp 8
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managedSubjects.map((sub) => (
                      <div
                        key={sub.id}
                        className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl">
                            {sub.icon}
                          </div>
                          <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-xs font-bold">
                            Lớp {sub.grade}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-black text-base text-stone-950">{sub.name}</h3>
                          <p className="text-xs text-stone-500 line-clamp-2">{sub.description}</p>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                          <span>Chủ đề: {sub.topics.length}</span>
                          <span className="text-emerald-600 font-bold">✓ Đang hoạt động</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: QUẢN LÝ LỚP HỌC (CLASSES)                          */}
              {/* ========================================================= */}
              {activeTab === 'classes' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        Danh Sách Lớp Học Vận Hành
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Quản lý các lớp Khối 5 & Khối 8, phân bổ giáo viên chủ nhiệm & phòng học
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audioService.playClick();
                        setNewClassModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tạo Lớp Học Mới</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {classesList.map((cls) => (
                      <div
                        key={cls.id}
                        className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                            Lớp {cls.grade}
                          </span>
                          <span className="text-xs text-stone-400 font-mono">{cls.academicYear}</span>
                        </div>
                        <div>
                          <h3 className="font-black text-base text-stone-950">{cls.name}</h3>
                          <p className="text-xs text-stone-600 mt-1">GVCN: <strong>{cls.headTeacher}</strong></p>
                          <p className="text-xs text-stone-500">{cls.room}</p>
                        </div>
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-stone-700">👥 {cls.studentCount} Học Sinh</span>
                          <span className="text-emerald-600 font-bold">● Đang học</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: QUẢN LÝ NỘI DUNG (CONTENT & QUESTS)                 */}
              {/* ========================================================= */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      Quản Lý Nhiệm Vụ Hàng Ngày & Linh Vật Đồng Hành
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Cấu hình Daily Quests, câu chuyện linh vật Kiến Con và kho phần thưởng
                    </p>
                  </div>

                  {/* Quests list */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>Danh Sách Nhiệm Vụ Hàng Ngày (Quests)</span>
                    </h3>
                    <div className="space-y-2">
                      {managedQuests.map((quest) => (
                        <div
                          key={quest.id}
                          className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{quest.icon}</span>
                            <div>
                              <div className="font-black text-stone-900">{quest.title}</div>
                              <div className="text-[11px] text-stone-500">{quest.description}</div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black shrink-0">
                            +{quest.xpReward} XP
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ant Allies preview */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <h3 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Linh Vật Đồng Hành (Ant Allies)</span>
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {ALLIES.slice(0, 4).map((ally) => (
                        <div key={ally.id} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-center">
                          <span className="text-3xl block mb-1">{ally.icon}</span>
                          <div className="font-black text-xs text-stone-900">{ally.name}</div>
                          <div className="text-[10px] text-stone-500">{ally.role}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 6: QUẢN LÝ HỌC VIÊN (STUDENTS)                         */}
              {/* ========================================================= */}
              {activeTab === 'students' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        Danh Sách & Hồ Sơ Học Viên
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Theo dõi điểm kinh nghiệm XP, chuỗi học và thưởng khích lệ học tập
                      </p>
                    </div>

                    <div className="relative min-w-[220px]">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm theo tên học sinh..."
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white border border-stone-200 outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Student Table */}
                  <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-black uppercase text-[10px] border-b border-stone-200">
                          <tr>
                            <th className="p-3.5">Học Viên</th>
                            <th className="p-3.5">Lớp & Trường</th>
                            <th className="p-3.5">Cấp Độ</th>
                            <th className="p-3.5">Kinh Nghiệm (XP)</th>
                            <th className="p-3.5">Chuỗi Học</th>
                            <th className="p-3.5 text-right">Hành Động</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {studentsList
                            .filter(
                              (s) =>
                                !searchQuery.trim() ||
                                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                s.nickname.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((stu) => (
                              <tr key={stu.id} className="hover:bg-stone-50/80 transition-colors">
                                <td className="p-3.5">
                                  <div className="font-black text-stone-900">{stu.name}</div>
                                  <div className="text-[11px] text-amber-700">{stu.nickname}</div>
                                </td>
                                <td className="p-3.5">
                                  <div className="font-bold text-stone-800">
                                    Lớp {stu.grade} ({stu.className})
                                  </div>
                                  <div className="text-[11px] text-stone-500">{stu.school}</div>
                                </td>
                                <td className="p-3.5 font-bold text-purple-700">Cấp {stu.level}</td>
                                <td className="p-3.5 font-black text-amber-600">{stu.xp} XP</td>
                                <td className="p-3.5 font-bold text-orange-600">🔥 {stu.streak} ngày</td>
                                <td className="p-3.5 text-right">
                                  <button
                                    onClick={() => handleAwardXP(stu.id, 50)}
                                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors"
                                  >
                                    +50 XP 🎁
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 7: NHÂN SỰ & QUYỀN (STAFF - admin_users)              */}
              {/* ========================================================= */}
              {activeTab === 'staff' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                        Đội Ngũ Quản Trị & Phân Quyền (Bảng Riêng admin_users)
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Cơ chế cách ly an toàn tài khoản quản trị khỏi học sinh, bảo mật theo RBAC
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        audioService.playClick();
                        setNewAdminModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Tài Khoản Quản Trị</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffList.map((admin) => {
                      const isCurrent = currentAdmin.id === admin.id;
                      const roleConfig = ADMIN_ROLES_CONFIG[admin.role];
                      return (
                        <div
                          key={admin.id}
                          className={`bg-white border rounded-3xl p-5 shadow-xs space-y-3 transition-all ${
                            isCurrent ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-2xl shrink-0">
                                {admin.avatar}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-sm sm:text-base text-stone-900">{admin.name}</h3>
                                  {isCurrent && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black text-[10px]">
                                      Đang chọn
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-amber-700 font-bold">{admin.roleTitle}</div>
                                <div className="text-[11px] text-stone-400 font-mono">{admin.email}</div>
                              </div>
                            </div>

                            <button
                              onClick={() => handleImpersonate(admin.id)}
                              className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-950 text-xs font-bold transition-colors"
                            >
                              Đóng vai
                            </button>
                          </div>

                          <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-600 line-clamp-2">
                            {roleConfig.description}
                          </div>

                          <div className="pt-2 flex items-center justify-between text-[10px] text-stone-400">
                            <span>Trạng thái: <strong className="text-emerald-600">Hoạt động</strong></span>
                            <span>Đăng nhập: {admin.lastLogin}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 8: QUẢN LÝ CSDL SUPABASE                              */}
              {/* ========================================================= */}
              {activeTab === 'database' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      Quản Lý & Kiểm Tra CSDL Supabase Live
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Kiểm tra độ trễ (latency), đồng bộ dữ liệu người dùng & cấu trúc bảng riêng admin_users
                    </p>
                  </div>

                  {/* Status Card */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          dbStatus.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Database className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-base text-stone-900">Trạng Thái Kết Nối Supabase</h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              dbStatus.connected ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {dbStatus.connected ? 'Online (Đã Kết Nối)' : 'Local Storage Fallback'}
                            </span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{dbStatus.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={dbTesting}
                          onClick={handleTestDatabase}
                          className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800 transition-all flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${dbTesting ? 'animate-spin' : ''}`} />
                          <span>Kiểm Tra Ping Latency</span>
                        </button>

                        <button
                          disabled={dbSyncing}
                          onClick={handleSyncDatabase}
                          className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-black text-xs hover:bg-amber-400 transition-all flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Đồng Bộ Ngay</span>
                        </button>
                      </div>
                    </div>

                    {dbStatus.latencyMs !== undefined && (
                      <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-stone-700">Độ trễ phản hồi máy chủ:</span>
                        <span className="font-mono font-black text-emerald-600">{dbStatus.latencyMs} ms</span>
                      </div>
                    )}

                    {syncMessage && (
                      <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                        {syncMessage}
                      </div>
                    )}
                  </div>

                  {/* Schema Architecture Cards */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
                    <h3 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-amber-500" />
                      <span>Cấu Trúc Các Bảng Trong Cơ Sở Dữ Liệu (Schema Overview)</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { table: 'public.admin_users', desc: 'Bảng riêng quản trị viên, chứa permissions RBAC & audit.' },
                        { table: 'public.users', desc: 'Hồ sơ học sinh (họ tên, username, khối lớp, XP, streak).' },
                        { table: 'public.courses & lessons', desc: 'Kho học liệu, 4 giai đoạn học tập, điểm thưởng XP.' },
                        { table: 'public.daily_quests', desc: 'Ngân hàng nhiệm vụ tự động làm mới hàng ngày.' },
                        { table: 'public.staff_accounts', desc: 'View bảo mật đồng bộ cho AdminCP portal.' },
                        { table: 'public.leaderboards', desc: 'Bảng xếp hạng tổng hợp theo khối Lớp 5 & Lớp 8.' },
                      ].map((s) => (
                        <div key={s.table} className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
                          <div className="font-mono font-black text-stone-900 mb-1">{s.table}</div>
                          <div className="text-[11px] text-stone-600">{s.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 9: CHẨN ĐOÁN PRODUCTION & NHẬT KÝ (AUDIT)             */}
              {/* ========================================================= */}
              {activeTab === 'production' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                      Chẩn Đoán Production & Nhật Ký Kiểm Toán (Audit)
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 font-medium">
                      Giám sát hệ thống thời gian thực và lịch sử thay đổi của các quản trị viên
                    </p>
                  </div>

                  {/* System Health Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Trạng Thái Applet</div>
                        <div className="font-black text-stone-900">Hoạt Động 100%</div>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Đồng Bộ Cross-Tab</div>
                        <div className="font-black text-stone-900">BroadcastChannel Sẵn Sàng</div>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs text-stone-500">Chính Sách Bảo Mật</div>
                        <div className="font-black text-stone-900">RBAC admin_users Bật</div>
                      </div>
                    </div>
                  </div>

                  {/* Full Audit Log Table */}
                  <div className="bg-white border border-stone-200 rounded-3xl shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between">
                      <h3 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-stone-600" />
                        <span>Lịch Sử Hoạt Động (Audit Trail)</span>
                      </h3>
                      <span className="text-xs text-stone-400 font-mono">{auditLogs.length} bản ghi</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-stone-50 text-stone-600 font-black uppercase text-[10px] border-b border-stone-200">
                          <tr>
                            <th className="p-3.5">Thời Gian</th>
                            <th className="p-3.5">Quản Trị Viên</th>
                            <th className="p-3.5">Thao Tác</th>
                            <th className="p-3.5">Mục Tiêu & Chi Tiết</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                              <td className="p-3.5 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                                {log.timestamp}
                              </td>
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="font-black text-stone-900">{log.adminName}</span>
                                <span className="block text-[10px] text-amber-700 font-semibold">{log.role}</span>
                              </td>
                              <td className="p-3.5 font-bold text-stone-800 whitespace-nowrap">{log.action}</td>
                              <td className="p-3.5">
                                <div className="font-bold text-stone-900">{log.target}</div>
                                <div className="text-[11px] text-stone-500">{log.details}</div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 10: CẤU HÌNH AI TRỢ LÝ KIẾN CON (GEMINI)              */}
              {/* ========================================================= */}
              {activeTab === 'ai_config' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
                        <Bot className="w-6 h-6 text-amber-500" />
                        <span>Cấu Hình Trợ Lý Học Tập AI Kiến Con (Gemini)</span>
                      </h2>
                      <p className="text-xs sm:text-sm text-stone-500 font-medium">
                        Quản trị kết nối AI, tùy biến Model, Endpoint và kiểm tra chất lượng phản hồi trực tiếp
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          audioService.playClick();
                          const def = adminService.resetAIConfig();
                          setAiConfig(def);
                          setCustomModelInput('');
                          setTestResult(null);
                          setAiSavedSuccess(true);
                          setTimeout(() => setAiSavedSuccess(false), 3000);
                        }}
                        className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors"
                      >
                        Khôi Phục Mặc Định
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          audioService.playClick();
                          const updated = adminService.saveAIConfig(aiConfig);
                          setAiConfig(updated);
                          setAiSavedSuccess(true);
                          setTimeout(() => setAiSavedSuccess(false), 3000);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>Lưu Cấu Hình AI</span>
                      </button>
                    </div>
                  </div>

                  {aiSavedSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Đã lưu thành công cấu hình AI! Các phiên trò chuyện cùng Kiến Con sẽ sử dụng cấu hình mới này ngay lập tức.</span>
                    </div>
                  )}

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg">
                        🐜
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">Model Hoạt Động</div>
                        <div className="font-mono font-black text-amber-950 truncate text-sm">
                          {aiConfig.model || 'gemini-3-flash'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">Gateway Endpoint</div>
                        <div className="font-mono font-bold text-stone-900 truncate text-xs">
                          {aiConfig.endpoint.replace(/^https?:\/\//, '')}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-stone-500 font-semibold uppercase tracking-wider">Giao Thức AI</div>
                        <div className="font-black text-stone-900 text-xs">Gemini v1beta REST API</div>
                      </div>
                    </div>
                  </div>

                  {/* Configuration Form Card */}
                  <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
                    <h3 className="font-black text-sm text-stone-900 uppercase tracking-wider flex items-center gap-2 border-b border-stone-100 pb-3">
                      <Sliders className="w-4 h-4 text-amber-600" />
                      <span>Thông Số Kết Nối AI</span>
                    </h3>

                    {/* API Endpoint */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        API Endpoint (Đường dẫn máy chủ AI) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Server className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={aiConfig.endpoint}
                          onChange={(e) => setAiConfig({ ...aiConfig, endpoint: e.target.value.trim() })}
                          placeholder="https://antigravity.thecliff.io.vn"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 font-mono text-xs font-bold text-stone-900 outline-none"
                        />
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Hỗ trợ cổng dịch vụ Antigravity Proxy (<code>https://antigravity.thecliff.io.vn</code>) hoặc Google Gemini API gốc.
                      </p>
                    </div>

                    {/* API Key */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        API Key (Khóa bảo mật) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={aiConfig.apiKey}
                          onChange={(e) => setAiConfig({ ...aiConfig, apiKey: e.target.value.trim() })}
                          placeholder="sk-123456@"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 font-mono text-xs font-bold text-stone-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Model AI Selection */}
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5">
                        Lựa Chọn Model AI Cho Kiến Con <span className="text-rose-500">*</span>
                      </label>

                      {/* Presets */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                        {[
                          { id: 'gemini-3-flash', name: 'Gemini 3 Flash', desc: 'Suy luận nhanh, thông minh (Đề xuất)' },
                          { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', desc: 'Mô hình thế hệ mới nhất' },
                          { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', desc: 'Phản hồi cực nhanh, độ trễ thấp' },
                          { id: 'gemini-2.5-flash-thinking', name: 'Gemini 2.5 Thinking', desc: 'Kèm tư duy logic từng bước' },
                          { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', desc: 'Phân tích khoa học nâng cao' },
                          { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', desc: 'Phiên bản cân bằng' },
                        ].map((m) => {
                          const isSelected = aiConfig.model === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                audioService.playClick();
                                setAiConfig({ ...aiConfig, model: m.id });
                                setCustomModelInput('');
                              }}
                              className={`p-3 rounded-2xl text-left border-2 transition-all ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-500 shadow-xs'
                                  : 'bg-white border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-black ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                                  {m.name}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                              </div>
                              <span className="block text-[10px] text-stone-500 mt-0.5">{m.desc}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Custom Model Input */}
                      <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-1.5">
                        <span className="block text-xs font-bold text-stone-700">Hoặc Nhập Tên Custom Model AI Khác:</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customModelInput || (['gemini-3-flash', 'gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-2.5-flash-thinking', 'gemini-3.1-pro', 'gemini-3.5-flash'].includes(aiConfig.model) ? '' : aiConfig.model)}
                            onChange={(e) => {
                              const val = e.target.value.trim();
                              setCustomModelInput(val);
                              if (val) {
                                setAiConfig({ ...aiConfig, model: val });
                              }
                            }}
                            placeholder="Ví dụ: gemini-3.1-flash-lite, claude-3-7-sonnet..."
                            className="flex-1 px-3 py-2 rounded-xl bg-white border border-stone-300 font-mono text-xs font-bold outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Test Connection Live Button */}
                    <div className="pt-2 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <button
                        type="button"
                        disabled={testingAI}
                        onClick={async () => {
                          audioService.playClick();
                          setTestingAI(true);
                          setTestResult(null);
                          try {
                            const res = await adminService.testAIConnection(aiConfig);
                            setTestResult(res);
                            if (res.success) {
                              audioService.playSuccess();
                            }
                          } catch (err: any) {
                            setTestResult({
                              success: false,
                              message: `Lỗi: ${err?.message}`,
                            });
                          } finally {
                            setTestingAI(false);
                          }
                        }}
                        className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
                      >
                        {testingAI ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                            <span>Đang kiểm tra kết nối tới {aiConfig.model}...</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 text-amber-400" />
                            <span>Kiểm Tra Kết Nối AI (Live Test)</span>
                          </>
                        )}
                      </button>

                      {testResult && (
                        <div
                          className={`flex-1 p-3 rounded-xl border text-xs font-semibold flex items-center justify-between gap-2 ${
                            testResult.success
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                              : 'bg-rose-50 border-rose-300 text-rose-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {testResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <div>
                              <span>{testResult.message}</span>
                              {testResult.reply && (
                                <p className="text-[11px] text-stone-600 italic mt-0.5">
                                  Phản hồi: &ldquo;{testResult.reply}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                          {typeof testResult.latencyMs === 'number' && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white border border-stone-200 shrink-0">
                              {testResult.latencyMs}ms
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vercel Deployment Instructions Card */}
                  <div className="bg-stone-900 text-stone-200 rounded-3xl p-5 sm:p-6 space-y-3 border border-stone-800">
                    <div className="flex items-center gap-2 text-amber-400 font-black text-sm uppercase tracking-wider">
                      <Server className="w-4 h-4" />
                      <span>Hướng Dẫn Cấu Hình Biến Môi Trường Trên Vercel Production</span>
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Để triển khai hệ thống AI trên Production Vercel (<code>https://kiencon.vercel.app</code>), bạn truy cập vào <strong>Vercel Project Dashboard &rarr; Settings &rarr; Environment Variables</strong> và thêm các biến sau:
                    </p>
                    <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-800 font-mono text-xs space-y-1.5 text-stone-300">
                      <div><strong className="text-amber-400">AI_API_ENDPOINT</strong> = <code>https://antigravity.thecliff.io.vn</code></div>
                      <div><strong className="text-amber-400">AI_API_KEY</strong> = <code>sk-123456@</code></div>
                      <div><strong className="text-amber-400">AI_MODEL</strong> = <code>gemini-3-flash</code></div>
                      <div><strong className="text-amber-400">GEMINI_API_KEY</strong> = <code>sk-123456@</code></div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: THÊM BÀI HỌC MỚI                                           */}
      {/* =================================================================== */}
      {newLessonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-500" />
                <span>Biên Soạn Bài Học Mới</span>
              </h3>
              <button
                onClick={() => setNewLessonModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tiêu Đề Bài Học</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="Ví dụ: Phép Nhân Phân Số"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Khối Lớp</label>
                  <select
                    value={newLessonGrade}
                    onChange={(e) => setNewLessonGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none cursor-pointer"
                  >
                    <option value={5}>Lớp 5</option>
                    <option value={8}>Lớp 8</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Điểm Thưởng (XP)</label>
                  <input
                    type="number"
                    value={newLessonXP}
                    onChange={(e) => setNewLessonXP(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Chương / Unit</label>
                <input
                  type="text"
                  value={newLessonUnit}
                  onChange={(e) => setNewLessonUnit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setNewLessonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateLesson}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-sm"
              >
                Xuất Bản Bài Học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: TẠO LỚP HỌC MỚI                                            */}
      {/* =================================================================== */}
      {newClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <School className="w-5 h-5 text-emerald-500" />
                <span>Tạo Mới Lớp Học</span>
              </h3>
              <button
                onClick={() => setNewClassModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Tên Lớp Học</label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="Ví dụ: Lớp 5A4 - Kiến Chăm Ngoan"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Khối Lớp</label>
                  <select
                    value={newClassGrade}
                    onChange={(e) => setNewClassGrade(Number(e.target.value) as GradeLevel)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none cursor-pointer"
                  >
                    <option value={5}>Lớp 5</option>
                    <option value={8}>Lớp 8</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Giáo Viên Chủ Nhiệm</label>
                  <input
                    type="text"
                    value={newClassTeacher}
                    onChange={(e) => setNewClassTeacher(e.target.value)}
                    placeholder="Thầy / Cô..."
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Phòng Học</label>
                <input
                  type="text"
                  value={newClassRoom}
                  onChange={(e) => setNewClassRoom(e.target.value)}
                  placeholder="Ví dụ: Phòng 204 - Nhà A"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setNewClassModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm"
              >
                Lưu Lớp Học
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: THÊM TÀI KHOẢN QUẢN TRỊ                                    */}
      {/* =================================================================== */}
      {newAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                <span>Thêm Tài Khoản Quản Trị</span>
              </h3>
              <button
                onClick={() => setNewAdminModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Họ Và Tên</label>
                <input
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Ví dụ: ThS. Lê Văn An"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Email Cơ Quan</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="an.le@kienhoc.vn"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Vai Trò Quản Trị (RBAC)</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 font-bold outline-none cursor-pointer"
                >
                  {Object.values(ADMIN_ROLES_CONFIG).map((r) => (
                    <option key={r.role} value={r.role}>
                      {r.icon} {r.name} ({r.shortTitle})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setNewAdminModalOpen(false)}
                className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateAdmin}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-sm"
              >
                Cấp Quyền Quản Trị
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: XEM CHI TIẾT 4 BƯỚC BÀI HỌC                                 */}
      {/* =================================================================== */}
      {selectedLessonForStepView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700">Lớp {selectedLessonForStepView.grade}</span>
                <h3 className="font-black text-lg text-stone-900 leading-snug">
                  {selectedLessonForStepView.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLessonForStepView(null)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="font-black text-amber-900 mb-1">Giai Đoạn 1: Khám Phá (Discover)</div>
                <p className="text-amber-800">{selectedLessonForStepView.discover.conceptHeadline}</p>
                <p className="text-stone-600 mt-1">{selectedLessonForStepView.discover.scenarioStory}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="font-black text-blue-900 mb-1">Giai Đoạn 2: Luyện Tập (Practice)</div>
                <p className="text-blue-800">Gồm {selectedLessonForStepView.practice.totalSteps} bước rèn luyện câu hỏi trắc nghiệm tương tác.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <div className="font-black text-emerald-900 mb-1">Giai Đoạn 3: Vận Dụng Thực Tế (Apply)</div>
                <p className="text-emerald-800">{selectedLessonForStepView.apply.challengeTitle}</p>
                <p className="text-stone-600 mt-1">{selectedLessonForStepView.apply.realWorldScenario}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
                <div className="font-black text-purple-900 mb-1">Giai Đoạn 4: Giảng Lại (Teach-Back Feynman)</div>
                <p className="text-purple-800">{selectedLessonForStepView.teachBack.promptTitle}</p>
                <p className="text-stone-600 mt-1">{selectedLessonForStepView.teachBack.guidingQuestion}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setSelectedLessonForStepView(null)}
                className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
