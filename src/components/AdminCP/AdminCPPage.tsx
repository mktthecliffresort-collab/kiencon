import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { AdminUser, Lesson, Subject, DailyQuest, UserProfile } from '../../types';
import { adminService, DEMO_ADMINS } from '../../services/adminService';
import { supabaseService } from '../../services/supabaseService';
import { audioService } from '../../services/audioService';
import { AdminPortalModal } from '../Admin/AdminPortalModal';
import { ProductionDebugModal } from '../ProductionDebugModal';

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

export const AdminCPPage: React.FC<AdminCPPageProps> = ({
  onBackToApp,
  lessons,
  subjects,
  quests,
  currentUser,
  onUpdateLessons,
  onUpdateSubjects,
  onUpdateQuests,
}) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(() => adminService.getCurrentAdmin());
  const [activeTab, setActiveTab] = useState<'portal' | 'database' | 'production' | 'staff'>('portal');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
  const [showSubPortal, setShowSubPortal] = useState(false);
  const [showSubDebug, setShowSubDebug] = useState(false);

  useEffect(() => {
    const unsub = adminService.subscribe((admin) => {
      setCurrentAdmin(admin);
    });
    return unsub;
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    audioService.playClick();

    if (!email.trim()) {
      setLoginError('Vui lòng nhập email quản trị viên.');
      return;
    }

    const res = adminService.loginWithEmail(email, password);
    if (!res.success) {
      setLoginError(res.error || 'Email quản trị viên không chính xác!');
      audioService.playClick();
    } else {
      audioService.playSuccess();
    }
  };

  const handleImpersonate = (adminId: string) => {
    audioService.playSuccess();
    const admin = adminService.impersonate(adminId);
    if (admin) {
      setCurrentAdmin(admin);
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
      if (res.connected) audioService.playSuccess();
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
      audioService.playSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncMessage(`Lỗi đồng bộ: ${msg}`);
    } finally {
      setDbSyncing(false);
    }
  };

  // --------------------------------------------------------------------------
  // VIEW 1: ADMIN LOGIN GATE (Nếu chưa đăng nhập tài khoản quản lý)
  // --------------------------------------------------------------------------
  if (!currentAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white flex flex-col justify-between p-4 sm:p-8">
        <div className="max-w-5xl mx-auto w-full pt-4">
          {/* Top back button */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => {
                audioService.playClick();
                onBackToApp();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-stone-200 text-xs sm:text-sm font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang học sinh Kiến Học</span>
            </button>
            <div className="flex items-center gap-2 text-xs font-mono bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl border border-amber-500/30">
              <Lock className="w-3.5 h-3.5" />
              <span>Đường dẫn bảo mật: /admincp</span>
            </div>
          </div>

          {/* Login Card & Demo Accounts Table */}
          <div className="bg-stone-900/90 border-2 border-stone-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-3xl shadow-xl mx-auto mb-4 border-2 border-amber-300/40">
                🛡️
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
                HỆ THỐNG QUẢN TRỊ KIẾN HỌC (ADMINCP)
              </h1>
              <p className="text-xs sm:text-sm text-stone-400">
                Khu vực giới hạn chỉ dành riêng cho Ban Giám Hiệu, Trưởng Bộ Môn & Kỹ Thuật Viên. Vui lòng đăng nhập hoặc chọn tài khoản quản trị demo bên dưới.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="max-w-md mx-auto mb-10 space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">
                  Email Quản Trị Viên
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mkt.thecliffresort@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-500 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-stone-800 border border-stone-700 focus:border-amber-500 text-xs sm:text-sm text-white placeholder-stone-500 outline-none"
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
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng Nhập Vào Ban Quản Trị</span>
              </button>
            </form>

            {/* Demo Accounts Table (Exact match to Image 4) */}
            <div className="border-t border-stone-700/80 pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-amber-400 flex items-center gap-2">
                    <span>👑</span>
                    <span>DANH SÁCH TÀI KHOẢN QUẢN LÝ DEMO (CLICK ĐÓNG VAI ĐỂ TRUY CẬP NHANH)</span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    Chọn nhanh một trong các vai trò quản trị để trải nghiệm đầy đủ quyền hạn phân cấp:
                  </p>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  {DEMO_ADMINS.length} Tài khoản hoạt động
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-stone-700">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-800/80 text-stone-300 border-b border-stone-700 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Quản Trị Viên</th>
                      <th className="py-3 px-3">Vai Trò Quản Trị</th>
                      <th className="py-3 px-3">Quyền Hạn Chi Tiết</th>
                      <th className="py-3 px-3">Đăng Nhập Gần Nhất</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800 text-stone-200">
                    {DEMO_ADMINS.map((admin) => (
                      <tr key={admin.id} className="hover:bg-stone-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl shrink-0">{admin.avatar}</span>
                            <div>
                              <div className="font-black text-white">{admin.name}</div>
                              <div className="text-[11px] text-stone-400 font-mono">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                              admin.role === 'super_admin'
                                ? 'bg-rose-950/60 text-rose-300 border-rose-500/50'
                                : admin.role === 'lesson_manager'
                                ? 'bg-blue-950/60 text-blue-300 border-blue-500/50'
                                : admin.role === 'subject_manager'
                                ? 'bg-purple-950/60 text-purple-300 border-purple-500/50'
                                : admin.role === 'grade_manager'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50'
                                : admin.role === 'content_manager'
                                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                                : 'bg-pink-950/60 text-pink-300 border-pink-500/50'
                            }`}
                          >
                            {admin.roleTitle}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-stone-300 max-w-[240px] truncate">
                          {admin.permissions.join(', ')}
                        </td>
                        <td className="py-3 px-3 text-stone-400 text-[11px]">
                          {admin.lastLogin}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                            Hoạt động
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleImpersonate(admin.id)}
                            className="px-3 py-1.5 rounded-xl bg-stone-700 hover:bg-amber-500 hover:text-stone-950 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                          >
                            Đóng Vai
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="max-w-5xl mx-auto w-full pt-6 pb-2 text-center text-xs text-stone-500">
          Kiến Học Admin Control Panel • Hệ thống phân quyền RBAC & Quản trị trung tâm
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD (/admincp)
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col">
      {/* AdminCP Sticky Header */}
      <header className="sticky top-0 z-40 bg-stone-900 text-white border-b-2 border-amber-500/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-xl shadow-md border border-amber-300/40">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm sm:text-base tracking-tight text-white">
                  KIẾN HỌC ADMINCP
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  /admincp
                </span>
              </div>
              <p className="text-[11px] text-stone-400">Hệ Thống Quản Trị & Điều Hành Trung Tâm</p>
            </div>
          </div>

          {/* Current Admin Badge & Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2.5 bg-stone-800/90 px-3 py-1.5 rounded-2xl border border-stone-700">
              <span className="text-xl">{currentAdmin.avatar}</span>
              <div className="text-left">
                <div className="text-xs font-black text-white">{currentAdmin.name}</div>
                <div className="text-[10px] text-amber-400 font-bold">{currentAdmin.roleTitle}</div>
              </div>
            </div>

            <button
              onClick={() => {
                audioService.playClick();
                onBackToApp();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors"
              title="Mở giao diện học tập của học sinh"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Xem Học Sinh</span>
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold transition-colors"
              title="Đăng xuất khỏi phiên Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Thoát</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-stone-950 border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('portal');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'portal'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Quản Trị Hệ Thống (Bài Học, Môn Học, Lớp)</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('database');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'database'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Quản Lý CSDL Supabase</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('production');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'production'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Chẩn Đoán Production</span>
            </button>

            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('staff');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                activeTab === 'staff'
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-black'
                  : 'text-stone-400 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Quản Lý Admin & Đổi Vai (RBAC)</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* ================================================================= */}
        {/* TAB 1: QUẢN TRỊ HỆ THỐNG */}
        {/* ================================================================= */}
        {activeTab === 'portal' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-amber-600" />
                    <span>Trung Tâm Điều Hành Kiến Thức</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Quản lý toàn diện bài học Lớp 5 & Lớp 8, chuyên đề KHTN, danh mục môn học và nhiệm vụ hàng ngày
                  </p>
                </div>
                <button
                  onClick={() => {
                    audioService.playClick();
                    setShowSubPortal(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:brightness-105 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mở Cửa Sổ Soạn Bài & Phân Quyền Chi Tiết</span>
                </button>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-xs font-bold text-amber-800">Tổng Bài Học</div>
                  <div className="text-2xl font-black text-amber-950 mt-1">{lessons.length}</div>
                  <div className="text-[11px] text-amber-700 mt-1">Chuẩn 4 bước tư duy</div>
                </div>
                <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200">
                  <div className="text-xs font-bold text-purple-800">Môn Học & Chuyên Đề</div>
                  <div className="text-2xl font-black text-purple-950 mt-1">{subjects.length}</div>
                  <div className="text-[11px] text-purple-700 mt-1">Toán, KHTN, Lịch Sử - Địa Lí</div>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800">Nhiệm Vụ Hằng Ngày</div>
                  <div className="text-2xl font-black text-emerald-950 mt-1">{quests.length}</div>
                  <div className="text-[11px] text-emerald-700 mt-1">Tích lũy XP & duy trì Streak</div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
                  <div className="text-xs font-bold text-blue-800">Quyền Hiện Tại</div>
                  <div className="text-sm font-black text-blue-950 mt-1 truncate">{currentAdmin.roleTitle}</div>
                  <div className="text-[11px] text-blue-700 mt-1 font-mono truncate">{currentAdmin.permissions.join(', ')}</div>
                </div>
              </div>

              {/* Lessons Overview Table */}
              <div className="mt-8">
                <h3 className="text-sm font-black text-stone-800 uppercase tracking-wider mb-3">
                  Danh sách bài học gần đây
                </h3>
                <div className="overflow-x-auto rounded-2xl border border-stone-200">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[11px]">
                        <th className="py-2.5 px-4">Bài học</th>
                        <th className="py-2.5 px-3">Khối Lớp</th>
                        <th className="py-2.5 px-3">Môn Học</th>
                        <th className="py-2.5 px-3">Hạt Đường XP</th>
                        <th className="py-2.5 px-3">Trạng Thái</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {lessons.slice(0, 5).map((l) => (
                        <tr key={l.id} className="hover:bg-amber-50/50">
                          <td className="py-3 px-4 font-bold text-stone-900">{l.title}</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px]">
                              Lớp {l.grade}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-stone-600 font-medium">{l.subjectId}</td>
                          <td className="py-3 px-3 font-black text-amber-700">+{l.rewardXp} XP</td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Đã xuất bản
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: QUẢN LÝ CSDL SUPABASE */}
        {/* ================================================================= */}
        {activeTab === 'database' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                    <Database className="w-6 h-6 text-emerald-600" />
                    <span>Cơ Sở Dữ Liệu Supabase PostgreSQL</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Quản lý kết nối, đồng bộ hồ sơ, kiểm tra độ trễ phản hồi máy chủ và sơ đồ bảng
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={dbTesting}
                    onClick={handleTestDatabase}
                    className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-2 border border-stone-300 transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dbTesting ? 'animate-spin text-amber-600' : ''}`} />
                    <span>{dbTesting ? 'Đang Kiểm Tra...' : 'Kiểm Tra Kết Nối'}</span>
                  </button>
                  <button
                    disabled={dbSyncing}
                    onClick={handleSyncDatabase}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${dbSyncing ? 'animate-spin' : ''}`} />
                    <span>{dbSyncing ? 'Đang Đồng Bộ...' : 'Đồng Bộ Hồ Sơ Ngay'}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        dbStatus.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    <span className="text-xs font-black uppercase tracking-wider text-stone-700">
                      {dbStatus.connected ? 'Supabase Online (Đang hoạt động)' : 'Chế độ Local Fallback'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">{dbStatus.message}</p>
                </div>
                {dbStatus.latencyMs !== undefined && (
                  <div className="text-xs font-black px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Ping Server: {dbStatus.latencyMs} ms
                  </div>
                )}
              </div>

              {syncMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{syncMessage}</span>
                </div>
              )}

              {/* Database Entities Architecture */}
              <div>
                <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider mb-3">
                  Kiến Trúc Mô Hình Bảng Dữ Liệu (Supabase Centralized Schema)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-black text-stone-900 block mb-1">👤 users</span>
                    <span className="text-stone-500 leading-relaxed block text-[11px]">
                      Lưu trữ hồ sơ học sinh: auth_id (UUID), username (cố định), họ tên, email, phone, lớp (5/8), avatar thú cưng, tổng điểm XP, chuỗi ngày streak.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200">
                    <span className="font-black text-purple-950 block mb-1">👑 admin_users / staff_accounts</span>
                    <span className="text-purple-900/80 leading-relaxed block text-[11px]">
                      Bảng riêng biệt cho Ban Quản Trị & Nhân sự, lưu permissions mảng, phòng ban, roleTitle và audit logs bảo mật chống leo thang đặc quyền.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-black text-stone-900 block mb-1">📚 lessons & lesson_steps</span>
                    <span className="text-stone-500 leading-relaxed block text-[11px]">
                      Lưu trữ bài học động 4 bước tư duy: Khám phá, Luyện tập, Vận dụng, Giảng lại với hình ảnh và điểm thưởng.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-black text-stone-900 block mb-1">🎯 questions & question_tags</span>
                    <span className="text-stone-500 leading-relaxed block text-[11px]">
                      Ngân hàng câu hỏi trắc nghiệm tập trung phục vụ Đấu trường 60s, Kiến đố vui và kiểm tra định kỳ.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-black text-stone-900 block mb-1">⏱️ user_lesson_progress</span>
                    <span className="text-stone-500 leading-relaxed block text-[11px]">
                      Lưu tiến độ từng bài học của học sinh, số sao đạt được, thời gian hoàn thành và số lần thử.
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                    <span className="font-black text-stone-900 block mb-1">🏆 get_weekly_leaderboard (RPC)</span>
                    <span className="text-stone-500 leading-relaxed block text-[11px]">
                      Function SQL tính toán bảng xếp hạng realtime theo tuần, chia theo khối lớp 5 và 8.
                    </span>
                  </div>
                </div>
              </div>

              {/* SQL Script info */}
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-stone-700">
                <div className="flex items-center gap-2 font-black text-amber-900 mb-1">
                  <FileCode className="w-4 h-4 text-amber-600" />
                  <span>Kịch Bản SQL Hoàn Chỉnh Tại: supabase/schema.sql & supabase/seed.sql</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Đầy đủ quan hệ khóa ngoại (Foreign Keys), chỉ mục (Indexes), chính sách phân quyền RLS (Row Level Security) và mã nguồn stored procedures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: CHẨN ĐOÁN PRODUCTION */}
        {/* ================================================================= */}
        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                    <Wrench className="w-6 h-6 text-amber-600" />
                    <span>Bộ Công Cụ Chẩn Đoán Production</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Kiểm tra gửi email OTP / SMTP, biến môi trường, Live Logs Console và chuẩn đoán API Supabase
                  </p>
                </div>
                <button
                  onClick={() => {
                    audioService.playClick();
                    setShowSubDebug(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all"
                >
                  <Activity className="w-4 h-4" />
                  <span>Mở Bảng Điều Khiển Chẩn Đoán Live Logs</span>
                </button>
              </div>

              {/* Quick Health Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-700">Supabase Auth & API</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">Hoạt Động</div>
                  <p className="text-[11px] text-stone-500 mt-1">Xác thực OTP & JWT Session sẵn sàng</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-700">Cấu Hình Email SMTP</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">SMTP Custom</div>
                  <p className="text-[11px] text-stone-500 mt-1">Gửi mail kích hoạt với mẫu Kiến Học</p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-700">Môi Trường Triển Khai</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  </div>
                  <div className="text-lg font-black text-stone-900">Production / Vite</div>
                  <p className="text-[11px] text-stone-500 mt-1">Single-Page App với Route /admincp</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: QUẢN LÝ ADMIN & PHÂN QUYỀN RBAC (IMAGE 4) */}
        {/* ================================================================= */}
        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border-2 border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
                <div>
                  <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    <span>Danh Sách Quản Trị Viên & Phân Quyền Chi Tiết</span>
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Hệ thống phân quyền Role-Based Access Control (RBAC). Bạn có thể bấm "Đóng Vai" để đổi ngay sang tài khoản quản lý khác.
                  </p>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200">
                  Đang đóng vai: <strong className="font-black">{currentAdmin.name}</strong> ({currentAdmin.roleTitle})
                </div>
              </div>

              {/* Exact Table from Image 4 */}
              <div className="overflow-x-auto rounded-2xl border border-stone-200 mt-6">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[11px]">
                      <th className="py-3 px-4">Quản Trị Viên</th>
                      <th className="py-3 px-3">Vai Trò Quản Trị</th>
                      <th className="py-3 px-3">Quyền Hạn Chi Tiết</th>
                      <th className="py-3 px-3">Đăng Nhập Gần Nhất</th>
                      <th className="py-3 px-3 text-center">Trạng Thái</th>
                      <th className="py-3 px-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {DEMO_ADMINS.map((admin) => {
                      const isCurrent = admin.id === currentAdmin.id;
                      return (
                        <tr
                          key={admin.id}
                          className={`transition-colors ${
                            isCurrent ? 'bg-amber-50/70 font-semibold' : 'hover:bg-stone-50'
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <span className="text-2xl shrink-0">{admin.avatar}</span>
                              <div>
                                <div className="font-black text-stone-900 flex items-center gap-1.5">
                                  <span>{admin.name}</span>
                                  {isCurrent && (
                                    <span className="px-1.5 py-0.2 rounded bg-amber-500 text-stone-950 text-[10px] font-black">
                                      Hiện tại
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500 font-mono">{admin.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                                admin.role === 'super_admin'
                                  ? 'bg-red-100 text-red-800 border-red-300'
                                  : admin.role === 'lesson_manager'
                                  ? 'bg-blue-100 text-blue-800 border-blue-300'
                                  : admin.role === 'subject_manager'
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : admin.role === 'grade_manager'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : admin.role === 'content_manager'
                                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {admin.roleTitle}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-[11px] text-stone-700">
                            {admin.permissions.join(', ')}
                          </td>
                          <td className="py-3 px-3 text-stone-500 text-[11px]">{admin.lastLogin}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold">
                              Hoạt động
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleImpersonate(admin.id)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                                isCurrent
                                  ? 'bg-amber-500 text-stone-950 shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300'
                              }`}
                            >
                              {isCurrent ? 'Đang Đóng Vai' : 'Đóng Vai'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Embedded Full Admin Portal Modal if triggered */}
      {showSubPortal && (
        <AdminPortalModal
          isOpen={showSubPortal}
          onClose={() => setShowSubPortal(false)}
          currentUser={currentUser}
          lessons={lessons}
          subjects={subjects}
          quests={quests}
          onUpdateLessons={onUpdateLessons}
          onUpdateSubjects={onUpdateSubjects}
          onUpdateQuests={onUpdateQuests}
        />
      )}

      {/* Embedded Production Debug Modal if triggered */}
      {showSubDebug && (
        <ProductionDebugModal
          isOpen={showSubDebug}
          onClose={() => setShowSubDebug(false)}
        />
      )}
    </div>
  );
};
