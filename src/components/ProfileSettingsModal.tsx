import React, { useState, useEffect } from 'react';
import { UserProfile, UserThemeSettings } from '../types';
import {
  X,
  User,
  Palette,
  Volume2,
  VolumeX,
  Sparkles,
  Check,
  Eye,
  EyeOff,
  Save,
  Bell,
  Sun,
  Moon,
  CloudSun,
  ShieldCheck,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  LogOut,
  LogIn,
  UserPlus,
  Lock,
} from 'lucide-react';
import { audioService } from '../services/audioService';
import { supabaseService } from '../services/supabaseService';
import { authService } from '../services/authService';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup' | 'signout_confirm') => void;
  isAuthenticated?: boolean;
  onOpenAdmin?: () => void;
  onOpenDebug?: () => void;
}

const AVATAR_OPTIONS = [
  { icon: '🐜', name: 'Kiến Con', desc: 'Bạn đồng hành thân thiết' },
  { icon: '⚡', name: 'Kiến Khám', desc: 'Thám hiểm & tò mò' },
  { icon: '💥', name: 'Kiến Nổ', desc: 'Bứt phá mọi giới hạn' },
  { icon: '🐝', name: 'Kiến Chăm', desc: 'Chăm chỉ mỗi ngày' },
  { icon: '🌿', name: 'Kiến Cần', desc: 'Bền bỉ, kiên nhẫn' },
  { icon: '👦', name: 'Bạn Nam', desc: 'Năng động, tự tin' },
  { icon: '👧', name: 'Bạn Nữ', desc: 'Thông minh, hoạt bát' },
  { icon: '🧑‍🎓', name: 'Học Giả Nhí', desc: 'Thần đồng toán học' },
];

const ACCENT_COLORS: { id: UserThemeSettings['accentColor']; name: string; bgClass: string; borderClass: string }[] = [
  { id: 'amber', name: 'Cam Kiến Vàng', bgClass: 'bg-amber-400', borderClass: 'border-amber-500' },
  { id: 'sky', name: 'Xanh Bầu Trời', bgClass: 'bg-sky-400', borderClass: 'border-sky-500' },
  { id: 'emerald', name: 'Xanh Lá Tri Thức', bgClass: 'bg-emerald-400', borderClass: 'border-emerald-500' },
  { id: 'purple', name: 'Tím Mộng Mơ', bgClass: 'bg-purple-400', borderClass: 'border-purple-500' },
  { id: 'rose', name: 'Hồng San Hô', bgClass: 'bg-rose-400', borderClass: 'border-rose-500' },
];

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveProfile,
  onOpenAuth,
  isAuthenticated = false,
  onOpenAdmin,
  onOpenDebug,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');

  // Supabase Database State
  const [dbStatus, setDbStatus] = useState<{
    tested: boolean;
    connected: boolean;
    message: string;
    latencyMs?: number;
  }>({
    tested: false,
    connected: supabaseService.isConfigured(),
    message: supabaseService.isConfigured()
      ? 'Đã phát hiện biến môi trường Supabase.'
      : 'Đang dùng chế độ Offline / Local Storage (Bảo toàn dữ liệu 100%).',
  });
  const [isTestingDb, setIsTestingDb] = useState<boolean>(false);
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Form State - Profile
  const [name, setName] = useState<string>(user.name || '');
  const [nickname, setNickname] = useState<string>(user.nickname || '');
  const [username, setUsername] = useState<string>(user.username || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [schoolName, setSchoolName] = useState<string>(user.schoolName || '');
  const [birthDate, setBirthDate] = useState<string>(user.birthDate || '2014-08-15');
  const [email, setEmail] = useState<string>(user.email || '');
  const [password, setPassword] = useState<string>(user.password || '••••••••');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [avatar, setAvatar] = useState<string>(user.avatar || '🐜');

  // Form State - Settings
  const initialTheme: UserThemeSettings = user.themeSettings || {
    mode: 'light',
    accentColor: 'amber',
    soundEnabled: !audioService.getMuted(),
    soundVolume: audioService.getVolume(),
    ambientChime: false,
  };

  const [themeMode, setThemeMode] = useState<UserThemeSettings['mode']>(initialTheme.mode);
  const [accentColor, setAccentColor] = useState<UserThemeSettings['accentColor']>(initialTheme.accentColor);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(initialTheme.soundEnabled);
  const [soundVolume, setSoundVolume] = useState<number>(initialTheme.soundVolume);
  const [ambientChime, setAmbientChime] = useState<boolean>(initialTheme.ambientChime);

  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Kiểm tra username đã được cấp cố định hay chưa
  const isUsernameFixed = Boolean(user.username && user.username.trim());
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available?: boolean;
    formatValid?: boolean;
    message?: string;
  }>({ checking: false });

  // Live availability check nếu chưa có username cố định
  useEffect(() => {
    if (isUsernameFixed) return;
    const trimmed = username.trim();
    if (!trimmed) {
      setUsernameStatus({ checking: false });
      return;
    }

    setUsernameStatus({ checking: true });
    const timer = setTimeout(async () => {
      const res = await authService.checkUsernameAvailability(trimmed, user.id);
      setUsernameStatus({
        checking: false,
        available: res.available,
        formatValid: res.formatValid,
        message: res.message,
      });
    }, 350);

    return () => clearTimeout(timer);
  }, [username, isUsernameFixed, user.id]);

  // Sync state whenever modal opens or user prop updates
  useEffect(() => {
    if (isOpen && user) {
      setName(user.name || '');
      setNickname(user.nickname || '');
      setUsername(user.username || '');
      setPhone(user.phone || '');
      setSchoolName(user.schoolName || '');
      setBirthDate(user.birthDate || '2014-08-15');
      setEmail(user.email || '');
      setPassword(user.password || '••••••••');
      setAvatar(user.avatar || '🐜');
      if (user.themeSettings) {
        setThemeMode(user.themeSettings.mode);
        setAccentColor(user.themeSettings.accentColor);
        setSoundEnabled(user.themeSettings.soundEnabled);
        setSoundVolume(user.themeSettings.soundVolume);
        setAmbientChime(user.themeSettings.ambientChime);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleTestSound = () => {
    audioService.setVolume(soundVolume);
    audioService.setMuted(!soundEnabled);
    if (soundEnabled) {
      audioService.playTestSound();
    }
  };

  const handleTestChime = () => {
    audioService.setVolume(soundVolume);
    audioService.setMuted(!soundEnabled);
    if (soundEnabled) {
      audioService.playAmbientChime();
    }
  };

  const handleTestDatabase = async () => {
    audioService.playClick();
    setIsTestingDb(true);
    setSyncMessage(null);
    try {
      const result = await supabaseService.checkStatus();
      setDbStatus({
        tested: true,
        connected: result.connected,
        message: result.message,
        latencyMs: result.latencyMs,
      });
      if (result.connected) {
        audioService.playSuccess();
      } else {
        audioService.playLevelUp();
      }
    } catch {
      setDbStatus({
        tested: true,
        connected: false,
        message: 'Lỗi kiểm tra kết nối Supabase.',
      });
    } finally {
      setIsTestingDb(false);
    }
  };

  const handleSyncToSupabase = async () => {
    audioService.playClick();
    setIsSyncingDb(true);
    setSyncMessage(null);
    try {
      await supabaseService.syncProfileToSupabase(user);
      setSyncMessage('Đã đồng bộ hồ sơ, điểm số XP và chuỗi học tập lên Supabase thành công! 🚀');
      audioService.playSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSyncMessage(`Chưa thể đồng bộ: ${msg}`);
    } finally {
      setIsSyncingDb(false);
    }
  };

  const handleSave = () => {
    const finalName = name.trim() || user.name || 'Học Sinh';
    const finalNickname = nickname.trim() || finalName;

    // Apply audio changes directly
    audioService.setMuted(!soundEnabled);
    audioService.setVolume(soundVolume);

    // Nếu user đã có username cố định, KHÔNG cho phép sửa đổi
    let finalUsername = user.username;
    if (!isUsernameFixed) {
      if (username.trim()) {
        if (usernameStatus.available === false) {
          audioService.playClick();
          alert(usernameStatus.message || 'Tên đăng nhập không khả dụng. Vui lòng chọn tên khác!');
          return;
        }
        finalUsername = username.trim().toLowerCase().replace(/\s+/g, '');
      }
    }

    const updatedProfile: UserProfile = {
      ...user,
      name: finalName,
      nickname: finalNickname,
      username: finalUsername || user.username,
      phone: phone.trim() || user.phone,
      schoolName: schoolName.trim() || user.schoolName,
      birthDate,
      email: email.trim(),
      password,
      avatar,
      themeSettings: {
        mode: themeMode,
        accentColor,
        soundEnabled,
        soundVolume,
        ambientChime,
      },
    };

    onSaveProfile(updatedProfile);
    audioService.playSuccess();
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-stone-200 shadow-2xl overflow-hidden relative my-auto">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 sm:p-6 text-white relative">
          <button
            onClick={() => {
              audioService.playClick();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/25 border-2 border-white/40 flex items-center justify-center text-3xl shadow-inner">
              {avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-xl sm:text-2xl tracking-tight text-white">
                  Quản Lý Hồ Sơ & Cài Đặt
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-amber-100 font-medium">
                Tùy chỉnh thông tin học tập, giao diện và hiệu ứng âm thanh
              </p>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-2 mt-5">
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('profile');
              }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'profile'
                  ? 'bg-white text-amber-950 shadow-md scale-102'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Hồ Sơ</span>
            </button>
            <button
              onClick={() => {
                audioService.playClick();
                setActiveTab('settings');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl font-black text-xs sm:text-sm transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-amber-950 shadow-md scale-102'
                  : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Cài Đặt Chung</span>
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto space-y-6">
          {/* TAB 1: PROFILE INFORMATION */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Choose Avatar */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2">
                  Linh Vật / Avatar Đại Diện
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = avatar === item.icon;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => {
                          audioService.playBoingPop();
                          setAvatar(item.icon);
                        }}
                        className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${
                          isSelected
                            ? 'bg-amber-100 border-amber-500 shadow-xs ring-2 ring-amber-400/30'
                            : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="text-2xl sm:text-3xl">{item.icon}</span>
                        <span className="text-[11px] font-black tracking-tight">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Name & Nickname */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Tên Gọi (Họ và Tên)
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: Minh Khang"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Biệt Danh (Nickname)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ví dụ: Kiến Siêu Trí Tuệ"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Date of Birth & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Email Học Tập
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ví dụ: email@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Tên đăng nhập & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-stone-700">
                      Tên Đăng Nhập (Username)
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      disabled={isUsernameFixed}
                      readOnly={isUsernameFixed}
                      value={username}
                      onChange={(e) => !isUsernameFixed && setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="ví dụ: kien_con123"
                      className={`w-full px-3.5 py-2.5 rounded-xl border-2 text-sm font-bold outline-none transition-colors ${
                        isUsernameFixed
                          ? 'border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed select-none'
                          : !username.trim()
                          ? 'border-stone-200 bg-stone-50/50 text-stone-800 focus:border-amber-500'
                          : usernameStatus.checking
                          ? 'border-amber-400 bg-amber-50/30 text-stone-800'
                          : usernameStatus.available
                          ? 'border-emerald-500 bg-emerald-50/30 text-stone-800'
                          : 'border-rose-500 bg-rose-50/30 text-stone-800'
                      }`}
                    />
                    {isUsernameFixed && (
                      <Lock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    )}
                    {!isUsernameFixed && usernameStatus.checking && (
                      <RefreshCw className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 animate-spin" />
                    )}
                    {!isUsernameFixed && !usernameStatus.checking && username.trim() && usernameStatus.available && (
                      <CheckCircle2 className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                    {!isUsernameFixed && !usernameStatus.checking && username.trim() && usernameStatus.available === false && (
                      <AlertCircle className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-rose-500" />
                    )}
                  </div>

                  {isUsernameFixed ? (
                    <p className="text-[11px] text-stone-400 mt-1 font-medium">
                      🔒 Tên đăng nhập đã được cấp cố định và liên kết với tài khoản này, không thể thay đổi.
                    </p>
                  ) : !username.trim() ? (
                    <p className="text-[11px] text-stone-500 mt-1 font-medium">
                      💡 Nhập tên đăng nhập của bạn (chữ thường, số, dấu _). Sau khi lưu sẽ không thể thay đổi.
                    </p>
                  ) : usernameStatus.checking ? (
                    <p className="text-[11px] text-amber-600 mt-1 font-medium">
                      Đang kiểm tra tính khả dụng trong hệ thống...
                    </p>
                  ) : usernameStatus.available ? (
                    <p className="text-[11px] text-emerald-600 mt-1 font-bold">
                      ✓ {usernameStatus.message}
                    </p>
                  ) : (
                    <p className="text-[11px] text-rose-600 mt-1 font-bold">
                      ✕ {usernameStatus.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 mb-1.5">
                    Số Điện Thoại Phụ Huynh / Học Sinh
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="ví dụ: 0912345678"
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                </div>
              </div>

              {/* Trường học */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Trường Học Hiện Tại
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="ví dụ: Tiểu học Dịch Vọng A / THCS Cầu Giấy"
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1.5">
                  Mật Khẩu Tài Khoản
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border-2 border-stone-200 focus:border-amber-500 focus:outline-none text-sm font-bold text-stone-800 bg-stone-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] font-semibold text-stone-500 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Mật khẩu được lưu trữ an toàn trên thiết bị của bạn.
                </p>
              </div>

              {/* Learning stats snapshot */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-base font-black text-amber-600">{user.xp} XP</div>
                  <div className="text-[11px] font-bold text-stone-500">Kinh nghiệm</div>
                </div>
                <div className="border-x border-stone-200">
                  <div className="text-base font-black text-purple-600">Cấp {user.level}</div>
                  <div className="text-[11px] font-bold text-stone-500">Cấp độ</div>
                </div>
                <div>
                  <div className="text-base font-black text-orange-600">🔥 {user.streakDays} ngày</div>
                  <div className="text-[11px] font-bold text-stone-500">Chuỗi học</div>
                </div>
              </div>

              {/* Account Authentication & Logout Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-200">
                {isAuthenticated ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        onClose();
                        if (onOpenAuth) onOpenAuth('signout_confirm');
                      }}
                      className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Thoát tài khoản</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        onClose();
                        if (onOpenAuth) onOpenAuth('signin');
                      }}
                      className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Chuyển tài khoản</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        onClose();
                        if (onOpenAuth) onOpenAuth('signup');
                      }}
                      className="px-4 py-2 rounded-xl btn-ant-3d-amber text-amber-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Đăng ký</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        audioService.playClick();
                        onClose();
                        if (onOpenAuth) onOpenAuth('signin');
                      }}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Đăng nhập</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: THEMES, COLORS & SOUND SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Theme Mode Selection */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2.5">
                  Chế Độ Giao Diện (Theme Mode)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setThemeMode('light');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                      themeMode === 'light'
                        ? 'bg-amber-50 border-amber-500 shadow-xs ring-2 ring-amber-400/20'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <Sun className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 block">Sáng Tươi Vui</span>
                      <span className="text-[11px] text-stone-500">Năng lượng sáng tạo</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setThemeMode('soft');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                      themeMode === 'soft'
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-2 ring-emerald-400/20'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CloudSun className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 block">Dịu Mắt Pastel</span>
                      <span className="text-[11px] text-stone-500">Êm dịu, chống mỏi</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      audioService.playClick();
                      setThemeMode('warm');
                    }}
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 text-left transition-all ${
                      themeMode === 'warm'
                        ? 'bg-orange-50 border-orange-500 shadow-xs ring-2 ring-orange-400/20'
                        : 'bg-white border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-orange-100 text-orange-700">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 block">Ấm Êm Ấm Áp</span>
                      <span className="text-[11px] text-stone-500">Ấm áp buổi tối</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Accent Color Selection */}
              <div>
                <label className="block text-xs font-black text-stone-800 uppercase tracking-wider mb-2.5">
                  Màu Sắc Chủ Đạo (Accent Color)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {ACCENT_COLORS.map((col) => {
                    const isSelected = accentColor === col.id;
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => {
                          audioService.playBoingPop();
                          setAccentColor(col.id);
                        }}
                        className={`p-2.5 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-stone-100 border-stone-800 shadow-xs scale-102 ring-2 ring-stone-400/40'
                            : 'bg-white border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-full ${col.bgClass} shadow-inner flex items-center justify-center text-white`}>
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                        <span className="text-[11px] font-bold text-stone-700 text-center leading-tight">
                          {col.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audio & Sound Settings */}
              <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm text-stone-900 block">
                        Âm Thanh & Hiệu Ứng Vui Nhộn
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Tiếng chúc mừng, trả lời đúng và âm thanh động lực
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      audioService.setMuted(!next);
                      if (next) audioService.playBoingPop();
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      soundEnabled ? 'bg-amber-500' : 'bg-stone-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        soundEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Volume Slider */}
                {soundEnabled && (
                  <div className="space-y-2 pt-2 border-t border-stone-200">
                    <div className="flex items-center justify-between text-xs font-black text-stone-700">
                      <span>Âm Lượng: {soundVolume}%</span>
                      <button
                        type="button"
                        onClick={handleTestSound}
                        className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] transition-colors"
                      >
                        🎵 Nghe Thử
                      </button>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={soundVolume}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setSoundVolume(val);
                        audioService.setVolume(val);
                      }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                )}

                {/* Ambient Focus Chime */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-stone-500" />
                    <div>
                      <span className="font-bold text-xs text-stone-800 block">Chuông Thiền Định Tập Trung</span>
                      <span className="text-[11px] text-stone-500">Âm thanh 528Hz êm dịu khi suy nghĩ bài khó</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {ambientChime && (
                      <button
                        type="button"
                        onClick={handleTestChime}
                        className="px-2 py-0.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-700 text-[11px] font-bold"
                      >
                        Thử
                      </button>
                    )}
                    <input
                      type="checkbox"
                      checked={ambientChime}
                      onChange={(e) => setAmbientChime(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs sm:text-sm transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            onClick={handleSave}
            className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm text-white shadow-md flex items-center gap-2 transition-all active:scale-95 ${
              saveSuccess
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:brightness-105'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Đã Lưu Thành Công!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Lưu Hồ Sơ & Cài Đặt</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
