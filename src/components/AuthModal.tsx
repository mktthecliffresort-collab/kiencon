import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GradeLevel, UserProfile } from '../types';
import { authService, INITIAL_WELCOME_XP } from '../services/authService';
import { userService } from '../services/userService';
import { audioService } from '../services/audioService';
import { fireGrandCelebration, fireMiniBurst } from '../utils/confettiHelper';
import {
  X,
  Mail,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  LogOut,
  LogIn,
  UserPlus,
  KeyRound,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Gift,
  Star,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup' | 'signout_confirm';
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, message?: string) => void;
  onSignOutSuccess: (defaultUser: UserProfile) => void;
  currentUser: UserProfile | null;
  currentGrade: GradeLevel;
  onSwitchGrade?: (grade: GradeLevel) => void;
}

const AVATARS = [
  { icon: '🐜', name: 'Kiến Con', desc: 'Thân thiện, chăm chỉ' },
  { icon: '⚡', name: 'Kiến Sấm', desc: 'Phản xạ nhanh như chớp' },
  { icon: '🌿', name: 'Kiến Cần', desc: 'Bền bỉ, tích lũy kiến thức' },
  { icon: '👑', name: 'Kiến Chúa', desc: 'Bản lĩnh thủ lĩnh' },
  { icon: '🚀', name: 'Kiến Bay', desc: 'Thám hiểm vũ trụ tri thức' },
  { icon: '🧑‍🎓', name: 'Học Giả', desc: 'Sâu sắc & đam mê' },
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signin',
  onClose,
  onAuthSuccess,
  onSignOutSuccess,
  currentUser,
  currentGrade,
  onSwitchGrade,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'verification_pending' | 'verify' | 'welcome' | 'signout_confirm'>(initialMode);

  // Sign In / Sign Up Form States
  const [fullName, setFullName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(currentGrade || 5);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🐜');

  // Email Verification State
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [demoCodeGiven, setDemoCodeGiven] = useState<string>('');
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  // Status & Feedback
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Newly registered user for welcome screen
  const [welcomeUser, setWelcomeUser] = useState<UserProfile | null>(null);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessInfo(null);
      if (initialMode === 'signup' && !selectedGrade) {
        setSelectedGrade(currentGrade || 5);
      }
    }
  }, [isOpen, initialMode, currentGrade]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  if (!isOpen) return null;

  // 1. Handle Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    audioService.playClick();

    try {
      const result = await authService.signIn({
        email,
        password,
      });

      if (result.success && result.user) {
        audioService.playSuccess();
        fireMiniBurst();
        setToastMessage('Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
        onAuthSuccess(result.user, 'Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
        if (onSwitchGrade && result.user.grade !== currentGrade) {
          onSwitchGrade(result.user.grade);
        }
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        audioService.playClick();
        setErrorMessage(result.message || 'Không thể đăng nhập. Vui lòng thử lại!');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Sign Up Initiation
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    audioService.playClick();

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của học sinh.');
      setLoading(false);
      return;
    }

    try {
      // Ensure the grade choice ('Lớp 5' or 'Lớp 8') is captured and passed
      // to userService.createProfile when the account is initialized in Supabase
      await userService.createProfile({
        name: fullName.trim(),
        nickname: nickname.trim() || fullName.trim(),
        email: email.trim().toLowerCase(),
        grade: selectedGrade,
        avatar: selectedAvatar,
        xp: 50,
      });

      const result = await authService.signUp({
        fullName,
        nickname: nickname.trim() || fullName.trim(),
        email,
        password,
        grade: selectedGrade,
        avatar: selectedAvatar,
      });

      if (result.success) {
        audioService.playClick();
        if (result.verificationCode) {
          setDemoCodeGiven(result.verificationCode);
        }
        setResendCooldown(30);
        // Display visual state for 'Email Verification Pending'
        setMode('verification_pending');
      } else {
        setErrorMessage(result.message || 'Đăng ký không thành công.');
      }
    } catch {
      setErrorMessage('Có lỗi xảy ra trong quá trình đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify Email Code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    audioService.playClick();

    if (!verificationCode.trim()) {
      setErrorMessage('Vui lòng nhập mã xác thực gồm 6 chữ số.');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.verifyEmail(email, verificationCode);

      if (result.success && result.user) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
        setWelcomeUser(result.user);
        setToastMessage('Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
        setMode('welcome');
        onAuthSuccess(result.user, 'Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
      } else {
        audioService.playClick();
        setErrorMessage(result.message || 'Mã xác thực không hợp lệ.');
      }
    } catch {
      setErrorMessage('Không thể xác thực mã. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend Verification (Calls Supabase Auth resend method)
  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    audioService.playClick();
    setLoading(true);
    try {
      const result = await authService.resendVerification(email);
      if (result.newCode) {
        setDemoCodeGiven(result.newCode);
      }
      setResendCooldown(30);
      setSuccessInfo(result.message || 'Đã gửi lại yêu cầu xác minh email!');
      setTimeout(() => setSuccessInfo(null), 4000);
    } catch {
      setErrorMessage('Không thể gửi lại email xác minh lúc này.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Claim Welcome Bonus & Close
  const handleClaimWelcome = () => {
    audioService.playCelebrationBurst();
    fireMiniBurst();
    if (welcomeUser) {
      setToastMessage('Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
      onAuthSuccess(welcomeUser, 'Chào mừng bạn đến với Kiến Học! +50 XP chào mừng!');
      if (onSwitchGrade && welcomeUser.grade !== currentGrade) {
        onSwitchGrade(welcomeUser.grade);
      }
    }
    onClose();
  };

  // 6. Handle Sign Out
  const handleSignOut = async () => {
    audioService.playClick();
    setLoading(true);
    try {
      const result = await authService.signOut();
      audioService.playClick();
      onSignOutSuccess(result.defaultUser);
      onClose();
    } catch {
      setErrorMessage('Không thể thoát tài khoản lúc này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs transition-opacity duration-300 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-amber-200 overflow-hidden transform transition-all my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Decor */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-emerald-500 px-6 py-5 text-white relative">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center text-2xl shadow-md border border-amber-100 shrink-0">
              {mode === 'welcome' ? '🎁' : mode === 'signout_confirm' ? '👋' : '🐜'}
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                {mode === 'signin' && 'Đăng Nhập Vương Quốc'}
                {mode === 'signup' && 'Gia Nhập Vương Quốc Kiến'}
                {(mode === 'verification_pending' || mode === 'verify') && 'Xác Minh Email Học Sinh'}
                {mode === 'welcome' && 'Thưởng Chào Mừng! 🎉'}
                {mode === 'signout_confirm' && 'Thoát Tài Khoản'}
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                {mode === 'signin' && 'Tiếp tục hành trình chinh phục tri thức cùng bạn Kiến'}
                {mode === 'signup' && 'Tạo tài khoản nhận ngay quà tặng khởi đầu'}
                {mode === 'verification_pending' && 'Email xác minh đã được gửi, đang chờ kích hoạt'}
                {mode === 'verify' && 'Kiểm tra hộp thư để kích hoạt hồ sơ học tập'}
                {mode === 'welcome' && 'Chúc mừng bạn đã là cư dân Vương quốc Kiến!'}
                {mode === 'signout_confirm' && 'Dữ liệu học tập đã lưu an toàn trên hệ thống'}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {/* Animated Welcome Toast Announcement */}
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-emerald-600 text-white shadow-lg flex items-center justify-between gap-3 border-2 border-amber-300"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎉</span>
                  <span className="text-xs sm:text-sm font-black text-white">{toastMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setToastMessage(null)}
                  className="w-6 h-6 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs flex items-center justify-center font-bold shrink-0"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Banner */}
          {successInfo && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 1: SIGN IN (ĐĂNG NHẬP) */}
          {/* ========================================================================= */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Email học sinh / phụ huynh
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hocsinh@kienhoc.edu.vn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-stone-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-stone-900 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-2xl btn-ant-3d-amber font-black text-amber-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Đăng Nhập Ngay</span>
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-stone-100 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setErrorMessage(null);
                    setMode('signup');
                  }}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline flex items-center justify-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Chưa có tài khoản? Đăng ký nhận thưởng ngay!</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: SIGN UP (TẠO TÀI KHOẢN & CHỌN LỚP & ĐẶT MẬT KHẨU) */}
          {/* ========================================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Họ tên & Biệt danh */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Họ và tên học sinh <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn An"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Biệt danh bạn Kiến
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Kiến Chăm Chỉ"
                    className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                  />
                </div>
              </div>

              {/* Chọn Lớp Học Phù Hợp: Radio Button Group for 'Lớp 5' or 'Lớp 8' */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                  <span>Chọn Lớp Học <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                    Có thể chuyển đổi bất kỳ lúc nào
                  </span>
                </label>

                <div
                  role="radiogroup"
                  aria-label="Chọn Lớp Học: Lớp 5 hoặc Lớp 8"
                  className="grid grid-cols-2 gap-2.5"
                >
                  {/* Radio Option Lớp 5 */}
                  <label
                    htmlFor="auth-grade-5-radio"
                    onClick={() => audioService.playClick()}
                    className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col gap-1 relative select-none ${
                      selectedGrade === 5
                        ? 'border-amber-500 bg-amber-50/90 shadow-xs ring-2 ring-amber-200'
                        : 'border-stone-200 bg-stone-50/60 hover:border-amber-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="auth-grade-5-radio"
                          name="gradeSelectionGroup"
                          value="5"
                          checked={selectedGrade === 5}
                          onChange={() => setSelectedGrade(5)}
                          className="w-4 h-4 text-amber-600 border-stone-300 focus:ring-amber-500 cursor-pointer accent-amber-600"
                        />
                        <span className="font-black text-xs text-amber-950">LỚP 5</span>
                      </div>
                      <span className="text-base">📐</span>
                    </div>
                    <p className="text-[11px] text-stone-600 pl-6 leading-tight">
                      Toán học, Tiếng Việt, Lịch sử - Địa lí
                    </p>
                  </label>

                  {/* Radio Option Lớp 8 */}
                  <label
                    htmlFor="auth-grade-8-radio"
                    onClick={() => audioService.playClick()}
                    className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col gap-1 relative select-none ${
                      selectedGrade === 8
                        ? 'border-blue-500 bg-blue-50/90 shadow-xs ring-2 ring-blue-200'
                        : 'border-stone-200 bg-stone-50/60 hover:border-blue-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          id="auth-grade-8-radio"
                          name="gradeSelectionGroup"
                          value="8"
                          checked={selectedGrade === 8}
                          onChange={() => setSelectedGrade(8)}
                          className="w-4 h-4 text-blue-600 border-stone-300 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span className="font-black text-xs text-blue-950">LỚP 8</span>
                      </div>
                      <span className="text-base">🔬</span>
                    </div>
                    <p className="text-[11px] text-stone-600 pl-6 leading-tight">
                      KHTN (Lí, Hóa, Sinh), Toán, Tiếng Anh
                    </p>
                  </label>
                </div>
              </div>

              {/* Chọn Linh vật Kiến đại diện */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Chọn bạn Kiến đại diện
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATARS.map((av) => (
                    <button
                      key={av.icon}
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        setSelectedAvatar(av.icon);
                      }}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center shrink-0 transition-all ${
                        selectedAvatar === av.icon
                          ? 'bg-amber-100 border-2 border-amber-500 shadow-xs scale-105'
                          : 'bg-stone-100 border border-stone-200 hover:bg-stone-200'
                      }`}
                      title={`${av.name}: ${av.desc}`}
                    >
                      {av.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Email học sinh / phụ huynh <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hocsinh@kienhoc.edu.vn"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                  />
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Đặt mật khẩu (từ 6 ký tự) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-8 pr-9 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Bonus Announcement Tag */}
              <div className="p-2.5 rounded-2xl bg-amber-50 border border-amber-300/80 flex items-center gap-2.5 text-amber-950 text-xs font-bold">
                <span className="text-lg">🍯</span>
                <div className="flex-1 text-[11px] leading-snug">
                  Đăng ký thành công nhận ngay{' '}
                  <span className="text-amber-700 font-black">+{INITIAL_WELCOME_XP} XP Hạt Đường</span> chào mừng!
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl btn-ant-3d-amber font-black text-amber-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span>Tiếp Tục Xác Minh Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setErrorMessage(null);
                    setMode('signin');
                  }}
                  className="text-xs font-bold text-stone-600 hover:text-amber-700 hover:underline"
                >
                  Đã có tài khoản? <span className="text-amber-600">Đăng nhập</span>
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: EMAIL VERIFICATION PENDING & CODE ACTIVATION */}
          {/* ========================================================================= */}
          {(mode === 'verification_pending' || mode === 'verify') && (
            <div className="space-y-4">
              {/* Visual Card: Email Verification Pending */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50 via-white to-amber-50/60 border-2 border-amber-300 shadow-sm relative overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Mail className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                        Email Verification Pending
                      </span>
                    </div>
                    <h3 className="text-sm sm:text-base font-black text-stone-900 leading-snug">
                      Vui lòng kiểm tra hộp thư email của bạn
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      Chúng tôi đã gửi đường dẫn và mã xác nhận đến:
                      <br />
                      <span className="font-mono font-bold text-amber-950 bg-amber-100/80 px-2 py-0.5 rounded-md inline-block mt-0.5 break-all">
                        {email}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-amber-200/80 text-[11px] text-stone-600 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Vui lòng mở email và nhấn liên kết xác nhận (hoặc nhập mã 6 số bên dưới). Nếu chưa thấy, hãy kiểm tra thư mục <strong>Thư rác (Spam)</strong> hoặc <strong>Quảng cáo</strong>.
                  </span>
                </div>

                {/* Resend Verification Button calling Supabase Auth resend method */}
                <div className="mt-3.5 pt-3 border-t border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-500 font-medium">Chưa nhận được email xác nhận?</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResendVerification}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>
                      {resendCooldown > 0
                        ? `Gửi lại sau (${resendCooldown}s)`
                        : 'Gửi lại xác minh (Resend Verification)'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Quick test / immediate verification code badge if provided */}
              {demoCodeGiven && (
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Mã xác nhận nhanh: <strong className="font-mono text-sm tracking-wider text-emerald-700">{demoCodeGiven}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setVerificationCode(demoCodeGiven);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all"
                  >
                    Điền nhanh
                  </button>
                </div>
              )}

              {/* Form to enter 6-digit code and verify */}
              <form onSubmit={handleVerifyCode} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 text-center">
                    Nhập mã xác nhận gồm 6 chữ số
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-2.5 rounded-2xl border-3 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 text-stone-900 outline-none transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                  className="w-full py-3.5 rounded-2xl btn-ant-3d-green font-black text-white flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Xác Minh & Kích Hoạt Tài Khoản</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-1 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setMode('signup');
                    }}
                    className="text-stone-500 hover:text-stone-700"
                  >
                    ← Đổi email hoặc thông tin khác
                  </button>
                  <span className="text-[11px] text-stone-400">
                    Bảo mật với Supabase
                  </span>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 4: WELCOME SCREEN (VINH DANH & TRAO THƯỞNG +250 XP BAN ĐẦU) */}
          {/* ========================================================================= */}
          {mode === 'welcome' && (
            <div className="text-center py-2 space-y-4">
              <div className="relative inline-block">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-300 to-amber-500 text-white flex items-center justify-center text-4xl shadow-xl animate-bounce-gentle border-4 border-amber-200">
                  {welcomeUser?.avatar || '🐜'}
                </div>
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-emerald-500 text-white text-base flex items-center justify-center shadow-md animate-pulse">
                  ✨
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-stone-900">
                  Chào Mừng {welcomeUser?.name}!
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Bạn đã chính thức trở thành học viên ưu tú của Lớp {welcomeUser?.grade} trong Vương quốc Kiến.
                </p>
              </div>

              {/* Bonus XP Trophy Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-amber-100 to-emerald-50 border-2 border-amber-300 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-xs">
                    🍯
                  </div>
                  <div>
                    <div className="text-xs text-stone-600 font-bold uppercase tracking-wider">
                      Thưởng Khởi Đầu
                    </div>
                    <div className="text-xl font-black text-amber-800">
                      +{INITIAL_WELCOME_XP} XP Hạt Đường
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-xs shadow-2xs">
                    ĐÃ CỘNG
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaimWelcome}
                className="w-full py-3.5 rounded-2xl btn-ant-3d-amber font-black text-amber-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all"
              >
                <Sparkles className="w-5 h-5 text-amber-800" />
                <span>Bắt Đầu Hành Trình Học Tập</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 5: SIGN OUT CONFIRM (XÁC NHẬN THOÁT TÀI KHOẢN) */}
          {/* ========================================================================= */}
          {mode === 'signout_confirm' && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-3xl shadow-inner border border-rose-200">
                <LogOut className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-base font-black text-stone-900">
                  Bạn có chắc chắn muốn thoát?
                </h3>
                <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto">
                  Hồ sơ học tập của bạn{' '}
                  <strong className="text-stone-900 font-bold">
                    {currentUser?.name || 'Học sinh'}
                  </strong>{' '}
                  và tiến độ ({currentUser?.xp || 0} XP) đã được lưu trữ an toàn trên hệ thống.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    onClose();
                  }}
                  className="py-2.5 rounded-xl border-2 border-stone-200 hover:bg-stone-100 font-bold text-xs text-stone-700 transition-colors"
                >
                  Ở lại học tiếp
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSignOut}
                  className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Xác Nhận Thoát</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
