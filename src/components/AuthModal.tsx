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
  Calendar,
  Phone,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup' | 'verification_pending' | 'signout_confirm' | 'forgot_password_request';
  onClose: () => void;
  onAuthSuccess: (user: UserProfile, message?: string) => void;
  onSignOutSuccess: (defaultUser: UserProfile) => void;
  currentUser: UserProfile | null;
  currentGrade: GradeLevel;
  onSwitchGrade?: (grade: GradeLevel) => void;
  onOpenDebug?: () => void;
  isMandatory?: boolean;
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
  onOpenDebug,
  isMandatory = false,
}) => {
  const [mode, setMode] = useState<
    | 'signin'
    | 'signup'
    | 'verification_pending'
    | 'verify'
    | 'welcome'
    | 'signout_confirm'
    | 'forgot_password_request'
    | 'forgot_password_verify'
    | 'forgot_password_reset'
  >(initialMode);

  // Sign In / Sign Up Form States
  const [fullName, setFullName] = useState<string>('');
  const [nickname, setNickname] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [schoolName, setSchoolName] = useState<string>('');
  const [birthDate, setBirthDate] = useState<string>(currentGrade === 8 ? '2011-05-20' : '2014-08-15');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel>(currentGrade || 5);
  const [selectedAvatar, setSelectedAvatar] = useState<string>('🐜');

  // Forgot Password / Reset Password Form States
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false);

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

  // Realtime username availability checker state
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    formatValid?: boolean;
    message?: string;
  }>({ checking: false });

  // Kiểm tra username realtime trên Supabase khi người dùng gõ
  useEffect(() => {
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({ checking: false });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await authService.checkUsernameAvailability(trimmed);
      setUsernameStatus({
        checking: false,
        available: res.available,
        formatValid: res.formatValid,
        message: res.message,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [username]);

  // Sync mode when modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessInfo(null);
      if (initialMode === 'signup' && !selectedGrade) {
        setSelectedGrade(currentGrade || 5);
      }
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const emailFromUrl = urlParams.get('verify_email');
        const codeFromUrl = urlParams.get('code');
        if (emailFromUrl && !email) {
          setEmail(emailFromUrl);
        }
        if (codeFromUrl && !verificationCode) {
          setVerificationCode(codeFromUrl);
        }
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

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      setLoading(false);
      return;
    }

    // Kiểm tra username trước khi gửi nếu người dùng có nhập
    if (username.trim()) {
      if (usernameStatus.available === false) {
        audioService.playClick();
        setErrorMessage(usernameStatus.message || 'Tên đăng nhập không khả dụng. Vui lòng chọn tên khác!');
        setLoading(false);
        return;
      }
    }

    try {
      // 1. Kiểm tra xác thực xem người dùng đã tồn tại chưa (email, username, phone)
      const existCheck = await authService.checkUserExists({
        email: email.trim(),
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
      });

      if (existCheck.exists) {
        audioService.playClick();
        setErrorMessage(existCheck.message || 'Tài khoản đã tồn tại trong hệ thống. Vui lòng kiểm tra lại!');
        setLoading(false);
        return;
      }

      // 2. Tiến hành khởi tạo đăng ký & gửi OTP
      const result = await authService.signUp({
        fullName: fullName.trim(),
        nickname: nickname.trim() || fullName.trim(),
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        schoolName: schoolName.trim() || undefined,
        birthDate: birthDate || '2014-08-15',
        email: email.trim(),
        password,
        grade: selectedGrade,
        avatar: selectedAvatar,
        enrolledCourses: selectedGrade === 8 ? ['khtn_8'] : ['toan_5'],
      });

      if (result.success) {
        audioService.playClick();
        if (result.verificationCode) {
          setDemoCodeGiven(result.verificationCode);
        }
        setResendCooldown(30);
        // Hiển thị giao diện Chờ xác thực OTP qua email
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

  // 3. Handle Verify Email Code -> Tự động login ngay sau khi xác minh thành công!
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

      // Nếu tài khoản đã được xác minh trước đó (ngăn chặn xác minh lần 2)
      if (result.alreadyVerified) {
        audioService.playSuccess();
        setToastMessage(result.message);
        setSuccessInfo(result.message);
        if (result.user) {
          onAuthSuccess(result.user, result.message);
          if (onSwitchGrade && result.user.grade !== currentGrade) {
            onSwitchGrade(result.user.grade);
          }
          setTimeout(() => {
            onClose();
          }, 1500);
        }
        return;
      }

      if (result.success && result.user) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
        setWelcomeUser(result.user);
        setToastMessage(`Chào mừng ${result.user.name} gia nhập Vương quốc Kiến! +${INITIAL_WELCOME_XP} XP thưởng khởi đầu!`);
        
        // TỰ ĐỘNG LOGIN VÀO TÀI KHOẢN NGAY LẬP TỨC
        onAuthSuccess(result.user, `Chào mừng ${result.user.name} gia nhập Vương quốc Kiến! +${INITIAL_WELCOME_XP} XP thưởng khởi đầu!`);
        
        // Cố định lớp học đã chọn (các lớp khác sẽ tự động được ẩn đi)
        if (onSwitchGrade && result.user.grade !== currentGrade) {
          onSwitchGrade(result.user.grade);
        }

        setMode('welcome');
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

  // 7. Handle Forgot Password - Send OTP
  const handleSendPasswordResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessInfo(null);
    setLoading(true);
    audioService.playClick();

    const targetEmail = resetEmail.trim() || email.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ để nhận mã xác minh OTP.');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.sendPasswordResetOtp(targetEmail);
      if (result.success) {
        audioService.playClick();
        setSuccessInfo(result.message);
        setResendCooldown(30);
        setMode('forgot_password_verify');
      } else {
        setErrorMessage(result.message || 'Không thể gửi mã xác nhận OTP.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi kết nối khi gửi mã OTP đặt lại mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  // 8. Handle Forgot Password - Verify OTP Code
  const handleVerifyPasswordResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    audioService.playClick();

    const targetEmail = resetEmail.trim() || email.trim();
    const targetCode = resetOtp.trim();

    if (!targetCode || targetCode.length < 6) {
      setErrorMessage('Vui lòng nhập đủ 6 chữ số mã xác thực OTP.');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.verifyPasswordResetOtp(targetEmail, targetCode);
      if (result.success) {
        audioService.playSuccess();
        setSuccessInfo(result.message);
        setMode('forgot_password_reset');
      } else {
        audioService.playClick();
        setErrorMessage(result.message || 'Mã OTP không chính xác hoặc đã hết hạn.');
      }
    } catch {
      setErrorMessage('Không thể xác thực mã OTP lúc này. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // 9. Handle Forgot Password - Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    audioService.playClick();

    const targetEmail = resetEmail.trim() || email.trim();
    const targetCode = resetOtp.trim();

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp. Vui lòng nhập lại!');
      setLoading(false);
      return;
    }

    const strength = authService.validateStrongPassword(newPassword);
    if (!strength.isValid) {
      setErrorMessage(strength.message);
      setLoading(false);
      return;
    }

    try {
      const result = await authService.resetPassword({
        email: targetEmail,
        code: targetCode,
        newPassword,
      });

      if (result.success && result.user) {
        audioService.playCelebrationBurst();
        fireGrandCelebration();
        setToastMessage(result.message);
        onAuthSuccess(result.user, result.message);
        if (onSwitchGrade && result.user.grade !== currentGrade) {
          onSwitchGrade(result.user.grade);
        }
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMessage(result.message || 'Không thể đặt lại mật khẩu.');
      }
    } catch {
      setErrorMessage('Đã xảy ra lỗi khi cập nhật mật khẩu mới.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-opacity duration-300 overflow-y-auto bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden transform transition-all my-auto"
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

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white text-amber-600 flex items-center justify-center text-2xl shadow-md border border-amber-100 shrink-0">
              {mode === 'welcome'
                ? '🎁'
                : mode === 'signout_confirm'
                ? '👋'
                : mode.startsWith('forgot_password')
                ? '🔑'
                : '🐜'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  {mode === 'signin' && 'Đăng Nhập Vương Quốc'}
                  {mode === 'signup' && 'Gia Nhập Vương Quốc Kiến'}
                  {(mode === 'verification_pending' || mode === 'verify') && 'Xác Minh Email Học Sinh'}
                  {mode === 'welcome' && 'Thưởng Chào Mừng! 🎉'}
                  {mode === 'signout_confirm' && 'Thoát Tài Khoản'}
                  {mode === 'forgot_password_request' && 'Lấy Lại Mật Khẩu'}
                  {mode === 'forgot_password_verify' && 'Xác Minh Mã OTP'}
                  {mode === 'forgot_password_reset' && 'Tạo Mật Khẩu Mới'}
                </h2>
              </div>
              <p className="text-xs text-amber-100 font-medium">
                {mode === 'signin' && 'Tiếp tục hành trình chinh phục tri thức cùng bạn Kiến'}
                {mode === 'signup' && 'Tạo tài khoản nhận ngay quà tặng khởi đầu'}
                {mode === 'verification_pending' && 'Email xác minh đã được gửi, đang chờ kích hoạt'}
                {mode === 'verify' && 'Kiểm tra hộp thư để kích hoạt hồ sơ học tập'}
                {mode === 'welcome' && 'Chúc mừng bạn đã là cư dân Vương quốc Kiến!'}
                {mode === 'signout_confirm' && 'Dữ liệu học tập đã lưu an toàn trên hệ thống'}
                {mode === 'forgot_password_request' && 'Nhập email để nhận mã OTP khôi phục mật khẩu'}
                {mode === 'forgot_password_verify' && 'Nhập mã 6 chữ số đã gửi về email của bạn'}
                {mode === 'forgot_password_reset' && 'Thiết lập mật khẩu mạnh để bảo vệ tài khoản'}
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
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setErrorMessage(null);
                      setSuccessInfo(null);
                      setResetEmail(email.trim());
                      setResetOtp('');
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setMode('forgot_password_request');
                    }}
                    className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
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
          {/* MODE 1.1: QUÊN MẬT KHẨU - BƯỚC 1: NHẬP EMAIL NHẬN MÃ OTP */}
          {/* ========================================================================= */}
          {mode === 'forgot_password_request' && (
            <form onSubmit={handleSendPasswordResetOtp} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs font-medium flex items-start gap-2.5">
                <KeyRound className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Đừng lo lắng! Hãy nhập địa chỉ email bạn đã sử dụng để đăng ký tài khoản. Tổ Kiến sẽ gửi một mã OTP 6 số để bạn xác thực và thiết lập mật khẩu mới.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Email tài khoản của bạn <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={resetEmail || email}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="hocsinh@kienhoc.edu.vn"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-stone-900 outline-none transition-all"
                  />
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
                    <span>Gửi Mã Xác Nhận OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-3 text-center border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => {
                    audioService.playClick();
                    setErrorMessage(null);
                    setSuccessInfo(null);
                    setMode('signin');
                  }}
                  className="text-xs font-bold text-stone-600 hover:text-amber-700 hover:underline"
                >
                  ← Quay lại màn hình đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 1.2: QUÊN MẬT KHẨU - BƯỚC 2: XÁC MINH MÃ OTP GỬI VỀ EMAIL */}
          {/* ========================================================================= */}
          {mode === 'forgot_password_verify' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-stone-700 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 font-black">
                  <Mail className="w-4 h-4 text-amber-600" />
                  <span>Mã OTP đã được gửi đến:</span>
                </div>
                <div className="font-mono font-bold text-amber-950 bg-amber-100/90 px-3 py-1.5 rounded-xl break-all text-xs">
                  {resetEmail || email}
                </div>
                <p className="text-[11px] text-stone-500">
                  Mã OTP có hiệu lực trong vòng 15 phút. Nếu không thấy trong Hộp thư đến, vui lòng kiểm tra mục Thư rác (Spam).
                </p>
              </div>

              <form onSubmit={handleVerifyPasswordResetOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 text-center">
                    Nhập mã xác nhận OTP 6 số
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    autoFocus
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="------"
                    className="w-full text-center tracking-[0.4em] font-mono text-2xl font-black py-2.5 rounded-2xl border-3 border-amber-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200 text-stone-900 outline-none transition-all shadow-inner"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || resetOtp.length < 6}
                  className="w-full py-3.5 rounded-2xl btn-ant-3d-amber font-black text-amber-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-amber-900" />
                      <span>Xác Minh Mã OTP</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setErrorMessage(null);
                      setMode('forgot_password_request');
                    }}
                    className="text-stone-500 hover:text-stone-800"
                  >
                    ← Đổi email khác
                  </button>

                  <button
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={async () => {
                      audioService.playClick();
                      setLoading(true);
                      try {
                        const res = await authService.sendPasswordResetOtp(resetEmail || email);
                        setSuccessInfo(res.message);
                        setResendCooldown(30);
                      } catch {
                        setErrorMessage('Không thể gửi lại mã OTP lúc này.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="text-amber-700 hover:text-amber-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendCooldown > 0 ? `Gửi lại (${resendCooldown}s)` : 'Gửi lại mã'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 1.3: QUÊN MẬT KHẨU - BƯỚC 3: THIẾT LẬP MẬT KHẨU MỚI (MẬT KHẨU MẠNH) */}
          {/* ========================================================================= */}
          {mode === 'forgot_password_reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-950 text-xs">
                <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Quy chuẩn mật khẩu mạnh:</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-stone-600 font-medium">
                  <div className="flex items-center gap-1">
                    <span className={newPassword.length >= 8 ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                      {newPassword.length >= 8 ? '✓' : '○'} Tối thiểu 8 ký tự
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={/[a-zA-Z]/.test(newPassword) ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                      {/[a-zA-Z]/.test(newPassword) ? '✓' : '○'} Có chữ cái
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={/[0-9]/.test(newPassword) ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                      {/[0-9]/.test(newPassword) ? '✓' : '○'} Có chữ số
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={
                        confirmNewPassword && newPassword === confirmNewPassword
                          ? 'text-emerald-600 font-bold'
                          : 'text-stone-400'
                      }
                    >
                      {confirmNewPassword && newPassword === confirmNewPassword ? '✓' : '○'} Khớp mật khẩu
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    autoFocus
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập ít nhất 8 ký tự..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-stone-900 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">
                  Xác nhận lại mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type={showConfirmNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-medium text-stone-900 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showConfirmNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmNewPassword}
                className="w-full mt-2 py-3 rounded-2xl btn-ant-3d-amber font-black text-amber-950 flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-98 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    <span>Đặt Lại Mật Khẩu & Đăng Nhập</span>
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
                  ← Hủy bỏ và quay lại đăng nhập
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: SIGN UP (TẠO TÀI KHOẢN & CHỌN LỚP & ĐẶT MẬT KHẨU) */}
          {/* ========================================================================= */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              {/* Họ tên & Tên đăng nhập */}
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
                    Tên đăng nhập (Username)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="Ví dụ: kien_vui_123"
                      className={`w-full px-3 py-2 rounded-xl border-2 text-xs font-semibold text-stone-900 outline-none transition-colors ${
                        !username.trim()
                          ? 'border-stone-200 focus:border-amber-500'
                          : usernameStatus.checking
                          ? 'border-amber-400 bg-amber-50/20'
                          : usernameStatus.available
                          ? 'border-emerald-500 bg-emerald-50/20'
                          : 'border-rose-500 bg-rose-50/20'
                      }`}
                    />
                    {usernameStatus.checking && (
                      <RefreshCw className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" />
                    )}
                    {!usernameStatus.checking && username.trim() && usernameStatus.available && (
                      <CheckCircle2 className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />
                    )}
                    {!usernameStatus.checking && username.trim() && usernameStatus.available === false && (
                      <AlertCircle className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-rose-500" />
                    )}
                  </div>

                  {!username.trim() ? null : usernameStatus.checking ? (
                    <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <span>Đang kiểm tra...</span>
                    </div>
                  ) : usernameStatus.available ? (
                    <div className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
                      <span>✓ {usernameStatus.message}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-semibold">
                      <span>✕ {usernameStatus.message}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Biệt danh
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Kiến Chăm Chỉ"
                    className="w-full px-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                    <input
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Số điện thoại
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Trường học
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      placeholder="TH & THCS Kiến Học"
                      className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-stone-200 focus:border-amber-500 text-xs font-semibold text-stone-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Chọn Khối Lớp Học */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-stone-700">
                    Chọn khối lớp
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Lớp {selectedGrade}
                  </span>
                </div>

                <div className="space-y-2 bg-stone-50/80 p-2.5 rounded-2xl border-2 border-stone-200">
                  {/* Stage 1: Tiểu học */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-900 mb-1 px-1">
                      <span>🎒 TIỂU HỌC (LỚP 1 - 5)</span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[1, 2, 3, 4, 5].map((g) => {
                        const isSelected = selectedGrade === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              audioService.playClick();
                              setSelectedGrade(g as GradeLevel);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center relative ${
                              isSelected
                                ? 'bg-amber-400 text-amber-950 border-2 border-amber-500 shadow-xs scale-102 ring-2 ring-amber-300/40'
                                : 'bg-white hover:bg-amber-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage 2: THCS */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-black text-sky-900 mb-1 px-1">
                      <span>📚 THCS (LỚP 6 - 9)</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[6, 7, 8, 9].map((g) => {
                        const isSelected = selectedGrade === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              audioService.playClick();
                              setSelectedGrade(g as GradeLevel);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center relative ${
                              isSelected
                                ? 'bg-sky-400 text-sky-950 border-2 border-sky-500 shadow-xs scale-102 ring-2 ring-sky-300/40'
                                : 'bg-white hover:bg-sky-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Stage 3: THPT */}
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-black text-purple-900 mb-1 px-1">
                      <span>🎓 THPT (LỚP 10 - 12)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[10, 11, 12].map((g) => {
                        const isSelected = selectedGrade === g;
                        return (
                          <button
                            key={g}
                            type="button"
                            onClick={() => {
                              audioService.playClick();
                              setSelectedGrade(g as GradeLevel);
                            }}
                            className={`py-1.5 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center relative ${
                              isSelected
                                ? 'bg-purple-400 text-purple-950 border-2 border-purple-500 shadow-xs scale-102 ring-2 ring-purple-300/40'
                                : 'bg-white hover:bg-purple-50 border border-stone-200 text-stone-700'
                            }`}
                          >
                            <span>Lớp {g}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
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
                  Email
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
                  Mật khẩu
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
