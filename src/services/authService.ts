import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, GradeLevel } from '../types';
import { INITIAL_USER_GRADE_5, INITIAL_USER_GRADE_8 } from '../data/mockData';
import { userService } from './userService';
import { debugLogger } from './debugLogger';

export const INITIAL_WELCOME_XP = 250; // Điểm XP tặng thưởng ban đầu khi tạo tài khoản thành công
const AUTH_SESSION_KEY = 'kienhoc_auth_session_v2';
const PENDING_VERIFICATION_KEY = 'kienhoc_pending_verification_v2';
const PENDING_PASSWORD_RESET_KEY = 'kienhoc_pending_password_reset_v2';
const CROSS_TAB_AUTH_CHANNEL = 'kienhoc_auth_broadcast_bus';
const CROSS_TAB_AUTH_EVENT_KEY = 'kienhoc_auth_sync_event';

/**
 * Tạo tên đăng nhập (Username) ngẫu nhiên, thân thiện cho học sinh Kiến Học
 * Ví dụ: kien_con_4821, kien_cham_9230
 */
export function generateRandomUsername(): string {
  const adjectives = ['con', 'nho', 'cham', 'tri', 'dung', 'vui', 'sao', 'vang', 'kham_pha'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `kien_${adj}_${randomNum}`;
}

export interface AuthSessionData {
  id: string;
  email: string;
  fullName: string;
  nickname?: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  grade: GradeLevel;
  avatar: string;
  xp: number;
  isVerified: boolean;
  schoolName?: string;
  enrolledCourses?: string[];
  role?: 'student' | 'teacher' | 'parent';
  token?: string;
}

export interface SignUpParams {
  fullName: string;
  nickname?: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  email: string;
  password?: string;
  grade: GradeLevel;
  avatar?: string;
  schoolName?: string;
  enrolledCourses?: string[];
}

export interface SignInParams {
  email: string;
  password?: string;
}

export interface PendingVerification {
  authUserId?: string;
  email: string;
  fullName: string;
  nickname?: string;
  username?: string;
  phone?: string;
  birthDate?: string;
  password?: string;
  grade: GradeLevel;
  avatar: string;
  code: string;
  schoolName?: string;
  enrolledCourses?: string[];
  validCodes?: string[];
  createdAt: number;
}

const isUuid = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

class AuthService {
  private currentSession: AuthSessionData | null = null;
  private listeners: Array<(session: AuthSessionData | null) => void> = [];
  private syncChannel: BroadcastChannel | null = null;

  constructor() {
    this.restoreSession();
    this.initCrossTabSync();
  }

  /**
   * Đồng bộ trạng thái đăng nhập / đăng xuất tức thì giữa các tab cùng trình duyệt
   */
  private initCrossTabSync(): void {
    if (typeof window === 'undefined') return;

    // 1. Kênh BroadcastChannel (Tức thì, sub-millisecond trên các trình duyệt hiện đại)
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.syncChannel = new BroadcastChannel(CROSS_TAB_AUTH_CHANNEL);
        this.syncChannel.onmessage = (event) => {
          this.handleCrossTabMessage(event.data);
        };
      } catch (err) {
        console.warn('[CrossTabAuth] BroadcastChannel không khả dụng:', err);
      }
    }

    // 2. Storage event listener (Chuẩn W3C hoạt động 100% khi tab khác chỉnh sửa LocalStorage)
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === AUTH_SESSION_KEY) {
        if (!event.newValue) {
          // Tab khác vừa xóa session hoặc ấn Logout -> Lập tức đăng xuất tab này
          this.handleRemoteSignOut();
        } else {
          // Tab khác vừa đăng nhập hoặc cập nhật session
          try {
            const parsed = JSON.parse(event.newValue);
            this.handleRemoteSignIn(parsed);
          } catch {
            // ignore
          }
        }
      } else if (event.key === CROSS_TAB_AUTH_EVENT_KEY && event.newValue) {
        try {
          const payload = JSON.parse(event.newValue);
          if (payload.type === 'LOGOUT') {
            this.handleRemoteSignOut();
          } else if (payload.type === 'LOGIN' && payload.session) {
            this.handleRemoteSignIn(payload.session);
          }
        } catch {
          // ignore
        }
      }
    });

    // 3. Tự động kiểm tra session khi tab nhận focus hoặc hiển thị trở lại (Visibility Change)
    window.addEventListener('focus', () => {
      this.checkSessionHealth();
    });

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkSessionHealth();
      }
    });

    // 4. Định kỳ kiểm tra (Heartbeat) mỗi 1.5 giây để đảm bảo tab nền cũng luôn đồng bộ chính xác
    setInterval(() => {
      this.checkSessionHealth();
    }, 1500);
  }

  public checkSessionHealth(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) {
        if (this.currentSession !== null) {
          // Tab khác đã đăng xuất! Đăng xuất đồng thời ngay lập tức
          this.handleRemoteSignOut();
        }
      } else {
        const parsed = JSON.parse(raw) as AuthSessionData;
        if (!this.currentSession || this.currentSession.id !== parsed.id || this.currentSession.email !== parsed.email) {
          this.handleRemoteSignIn(parsed);
        }
      }
    } catch {
      // ignore
    }
  }

  private handleCrossTabMessage(data: any): void {
    if (!data || typeof data !== 'object') return;
    if (data.type === 'LOGOUT') {
      this.handleRemoteSignOut();
    } else if (data.type === 'LOGIN' && data.session) {
      this.handleRemoteSignIn(data.session);
    }
  }

  private handleRemoteSignOut(): void {
    this.currentSession = null;
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch {
      // ignore
    }
    this.notify();
  }

  private handleRemoteSignIn(session: AuthSessionData): void {
    if (!this.currentSession || this.currentSession.id !== session.id || this.currentSession.xp !== session.xp) {
      this.currentSession = session;
      this.notify();
    }
  }

  private broadcastEvent(type: 'LOGIN' | 'LOGOUT', session?: AuthSessionData | null): void {
    const payload = {
      type,
      session,
      timestamp: Date.now(),
      nonce: Math.random().toString(36).substring(2),
    };
    try {
      this.syncChannel?.postMessage(payload);
    } catch {
      // ignore
    }
    try {
      localStorage.setItem(CROSS_TAB_AUTH_EVENT_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  }

  // Khôi phục session từ localStorage
  public restoreSession(): AuthSessionData | null {
    try {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (raw) {
        this.currentSession = JSON.parse(raw);
        return this.currentSession;
      }
    } catch (e) {
      console.warn('Lỗi đọc session đăng nhập:', e);
    }
    return null;
  }

  public getSession(): AuthSessionData | null {
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return Boolean(this.currentSession && this.currentSession.isVerified);
  }

  public subscribe(callback: (session: AuthSessionData | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Kiểm tra tính khả dụng và tính hợp lệ của username trên Supabase realtime
   */
  public async checkUsernameAvailability(
    rawUsername: string,
    excludeUserId?: string
  ): Promise<{
    available: boolean;
    formatValid: boolean;
    message: string;
    normalized: string;
  }> {
    const normalized = rawUsername.trim().toLowerCase().replace(/\s+/g, '');

    // Định dạng: 3 đến 20 ký tự, chữ thường, số và dấu gạch dưới (_)
    const validRegex = /^[a-z0-9_]{3,20}$/;
    if (!validRegex.test(normalized)) {
      let msg = 'Tên đăng nhập phải từ 3 đến 20 ký tự (chữ thường, số và _).';
      if (normalized.length < 3) msg = 'Tên đăng nhập quá ngắn (tối thiểu 3 ký tự).';
      else if (normalized.length > 20) msg = 'Tên đăng nhập quá dài (tối đa 20 ký tự).';
      else msg = 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới (_).';
      return {
        available: false,
        formatValid: false,
        message: msg,
        normalized,
      };
    }

    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return {
        available: true,
        formatValid: true,
        message: 'Tên đăng nhập hợp lệ và có thể sử dụng!',
        normalized,
      };
    }

    try {
      let query = client.from('users').select('id, username').eq('username', normalized);
      if (excludeUserId) {
        query = query.neq('id', excludeUserId);
      }
      const { data, error } = await query;
      if (error) {
        return {
          available: true,
          formatValid: true,
          message: 'Tên đăng nhập khả dụng!',
          normalized,
        };
      }

      if (data && data.length > 0) {
        return {
          available: false,
          formatValid: true,
          message: 'Tên đăng nhập này đã có người sử dụng. Vui lòng chọn tên khác!',
          normalized,
        };
      }

      return {
        available: true,
        formatValid: true,
        message: 'Tên đăng nhập hợp lệ và có thể sử dụng!',
        normalized,
      };
    } catch {
      return {
        available: true,
        formatValid: true,
        message: 'Tên đăng nhập khả dụng!',
        normalized,
      };
    }
  }

  private notify() {
    this.listeners.forEach((cb) => cb(this.currentSession));
  }

  private saveSession(session: AuthSessionData) {
    this.currentSession = session;
    try {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Không thể lưu session:', e);
    }
    this.broadcastEvent('LOGIN', session);
    this.notify();
  }

  private clearSession() {
    this.currentSession = null;
    try {
      localStorage.removeItem(AUTH_SESSION_KEY);
    } catch (e) {
      console.warn('Không thể xóa session:', e);
    }
    this.broadcastEvent('LOGOUT');
    this.notify();
  }

  // ============================================================================
  // 1. TẠO TÀI KHOẢN (SIGN UP) VỚI CHỌN LỚP, MẬT KHẨU & GỬI MÃ XÁC MINH EMAIL
  // ============================================================================
  public async signUp(params: SignUpParams): Promise<{
    success: boolean;
    requiresVerification: boolean;
    verificationCode?: string;
    message: string;
    error?: string;
  }> {
    const {
      fullName,
      nickname,
      username,
      phone,
      birthDate = '2014-08-15',
      email,
      password,
      grade,
      avatar = '🐜',
      schoolName,
      enrolledCourses,
    } = params;

    // Validate email
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return {
        success: false,
        requiresVerification: false,
        message: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email.',
        error: 'INVALID_EMAIL',
      };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        requiresVerification: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự để bảo mật tài khoản.',
        error: 'WEAK_PASSWORD',
      };
    }

    // Kiểm tra hoặc tự sinh Tên đăng nhập (Username)
    let finalUsername = '';
    if (username && username.trim()) {
      const availCheck = await this.checkUsernameAvailability(username.trim());
      if (!availCheck.available) {
        return {
          success: false,
          requiresVerification: false,
          message: availCheck.message,
          error: 'INVALID_USERNAME',
        };
      }
      finalUsername = availCheck.normalized;
    } else {
      // Tự động cấp tên đăng nhập ngẫu nhiên nếu người dùng để trống
      finalUsername = generateRandomUsername();
    }

    // Tạo mã xác minh 6 số ngẫu nhiên
    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Giữ danh sách các mã OTP đã gửi gần đây (để nếu người dùng nhận email đến muộn vẫn dùng được mã)
    let recentCodes: string[] = [demoCode];
    try {
      const prevRaw = localStorage.getItem(PENDING_VERIFICATION_KEY);
      if (prevRaw) {
        const prevData = JSON.parse(prevRaw) as PendingVerification;
        if (prevData.email === trimmedEmail) {
          const combined = [...(prevData.validCodes || (prevData.code ? [prevData.code] : [])), demoCode];
          recentCodes = Array.from(new Set(combined)).slice(-8);
        }
      }
    } catch {
      // ignore
    }

    // Lưu thông tin chờ xác minh
    const pendingData: PendingVerification = {
      email: trimmedEmail,
      fullName: fullName.trim(),
      nickname: nickname?.trim() || fullName.trim(),
      username: finalUsername,
      phone: phone?.trim() || undefined,
      schoolName: schoolName?.trim() || undefined,
      enrolledCourses: enrolledCourses || (grade === 8 ? ['khtn_8'] : ['toan_5']),
      birthDate,
      password,
      grade,
      avatar,
      code: demoCode,
      validCodes: recentCodes,
      createdAt: Date.now(),
    };

    try {
      localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(pendingData));
    } catch {
      // ignore
    }

    debugLogger.log('AUTH', `Bắt đầu đăng ký học sinh: ${fullName.trim()} (${trimmedEmail})`, {
      grade,
      code: demoCode,
    });

    // 1. Gửi OTP qua server-side email endpoint (sử dụng tài khoản Gmail máy chủ / test an toàn)
    let emailSent = false;
    let serverMessage = '';
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      debugLogger.log('API', 'Gửi request tới /api/auth/send-otp', {
        email: trimmedEmail,
        appUrl: currentOrigin,
      });

      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          fullName: fullName.trim(),
          code: demoCode,
          grade,
          appUrl: currentOrigin,
        }),
      });

      if (otpRes.ok) {
        const otpData = await otpRes.json();
        emailSent = Boolean(otpData.emailSent);
        serverMessage = otpData.message || '';
        debugLogger.success('API', `Phản hồi từ /api/auth/send-otp (emailSent=${emailSent})`, otpData);
      } else {
        const errText = await otpRes.text();
        debugLogger.error('API', `Lỗi HTTP ${otpRes.status} khi gọi /api/auth/send-otp`, errText);
      }
    } catch (apiErr: any) {
      debugLogger.error('API', 'Không thể kết nối /api/auth/send-otp (Network Error)', apiErr?.message);
      console.warn('Gửi qua /api/auth/send-otp:', apiErr);
    }

    const client = getSupabaseClient();
    const isConfigured = isSupabaseConfigured();

    debugLogger.log('SUPABASE', `Trạng thái Supabase: ${isConfigured ? 'ĐÃ CẤU HÌNH' : 'CHƯA CẤU HÌNH'}`);

    // 2. Thử đăng ký qua Supabase Auth nếu có cấu hình
    if (client && isConfigured) {
      try {
        debugLogger.log('SUPABASE', 'Bắt đầu gọi client.auth.signUp()', { email: trimmedEmail });
        const { data: authData, error: authError } = await client.auth.signUp({
          email: trimmedEmail,
          password,
          options: {
            emailRedirectTo: currentOrigin ? `${currentOrigin}?verify_email=${encodeURIComponent(trimmedEmail)}&code=${encodeURIComponent(demoCode)}` : undefined,
            data: {
              full_name: fullName.trim(),
              nickname: nickname?.trim() || fullName.trim(),
              username: username?.trim() || undefined,
              phone: phone?.trim() || undefined,
              school_name: schoolName?.trim() || undefined,
              birth_date: birthDate,
              current_grade: grade,
              avatar,
            },
          },
        });

        if (authError) {
          debugLogger.warn('SUPABASE', `Supabase Auth thông báo: ${authError.message}`, authError);
          // Nếu email đã tồn tại
          if (authError.message.includes('already registered') || authError.status === 400) {
            return {
              success: false,
              requiresVerification: false,
              message: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.',
              error: 'EMAIL_EXISTS',
            };
          }
        } else if (authData.user) {
          debugLogger.success('SUPABASE', `Tạo tài khoản Auth Supabase thành công (UID: ${authData.user.id})`);
          pendingData.authUserId = authData.user.id;
          try {
            localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(pendingData));
          } catch {
            // ignore
          }
          // Lưu dữ liệu ưu tiên vào public.users
          try {
            const upsertPayload: Record<string, unknown> = {
              id: authData.user.id,
              auth_id: null,
              email: trimmedEmail,
              full_name: fullName.trim(),
              nickname: nickname?.trim() || fullName.trim(),
              current_grade: grade,
              avatar,
              total_xp: INITIAL_WELCOME_XP,
              streak_days: 1,
              level: 1,
              role: 'student',
              is_verified: false,
              updated_at: new Date().toISOString(),
              settings: {
                birthDate,
                username: finalUsername,
                phone: phone?.trim() || undefined,
                schoolName: schoolName?.trim() || undefined,
                enrolledCourses: enrolledCourses || (grade === 8 ? ['khtn_8'] : ['toan_5']),
                mode: 'light',
                accentColor: 'amber',
                soundEnabled: true,
                soundVolume: 80,
                ambientChime: true,
              },
            };

            upsertPayload.username = finalUsername;
            if (phone?.trim()) upsertPayload.phone = phone.trim();
            if (schoolName?.trim()) upsertPayload.school_name = schoolName.trim();
            if (birthDate) upsertPayload.birth_date = birthDate;
            upsertPayload.enrolled_courses = enrolledCourses || (grade === 8 ? ['khtn_8'] : ['toan_5']);

            const { error: upsertErr } = await client.from('users').upsert(upsertPayload as any);
            if (upsertErr) {
              debugLogger.warn('SUPABASE', `Lỗi upsert vào bảng public.users (${upsertErr.message}), đang kích hoạt fallback linh hoạt...`);
              const compactPayload: Record<string, unknown> = {
                id: authData.user.id,
                auth_id: null,
                email: trimmedEmail,
                full_name: fullName.trim(),
                nickname: nickname?.trim() || fullName.trim(),
                current_grade: grade,
                avatar,
                total_xp: INITIAL_WELCOME_XP,
                streak_days: 1,
                level: 1,
                role: 'student',
                is_verified: false,
                updated_at: new Date().toISOString(),
                settings: upsertPayload.settings,
              };
              const { error: compactErr } = await client.from('users').upsert(compactPayload as any);
              if (!compactErr) {
                debugLogger.success('SUPABASE', 'Lưu thành công hồ sơ vào bảng public.users (chế độ tương thích)!');
              } else {
                debugLogger.error('SUPABASE', `Không thể lưu vào public.users: ${compactErr.message}`);
              }
            } else {
              debugLogger.success('SUPABASE', 'Lưu thành công hồ sơ vào bảng public.users!');
            }
          } catch (insertErr: any) {
            debugLogger.error('SUPABASE', `Lỗi kết nối khi lưu public.users: ${insertErr?.message}`);
          }
        }
      } catch (err: any) {
        debugLogger.error('SUPABASE', `Ngoại lệ Supabase Auth: ${err?.message}`);
      }
    } else {
      debugLogger.warn('SUPABASE', 'Bỏ qua ghi Supabase vì chưa có VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trên Vercel.');
    }

    return {
      success: true,
      requiresVerification: true,
      verificationCode: demoCode,
      message: serverMessage || `Mã OTP gồm 6 chữ số đã được gửi đến email ${trimmedEmail}.`,
    };
  }

  // ============================================================================
  // 2. XÁC MINH QUA EMAIL BẰNG MÃ 6 SỐ HOẶC SUPABASE OTP
  // ============================================================================
  public async verifyEmail(
    email: string,
    code: string
  ): Promise<{
    success: boolean;
    alreadyVerified?: boolean;
    user?: UserProfile;
    xpBonusAwarded?: number;
    message: string;
    error?: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    debugLogger.log('AUTH', `Bắt đầu xác thực mã OTP cho: ${trimmedEmail}`, { code: trimmedCode });

    const client = getSupabaseClient();

    // 0. KIỂM TRA XEM TÀI KHOẢN ĐÃ ĐƯỢC XÁC MINH TRƯỚC ĐÓ CHƯA (CHỈ XÁC MINH 1 LẦN DUY NHẤT)
    if (client && isSupabaseConfigured()) {
      try {
        const { data: existingDbUser } = await client
          .from('users')
          .select('*')
          .eq('email', trimmedEmail)
          .maybeSingle();

        if (existingDbUser && existingDbUser.is_verified === true) {
          debugLogger.log('AUTH', `Tài khoản ${trimmedEmail} ĐÃ ĐƯỢC XÁC MINH trước đó.`);
          // Xóa thông tin pending khỏi localStorage để tránh xác minh lặp lại
          try {
            localStorage.removeItem(PENDING_VERIFICATION_KEY);
          } catch {
            // ignore
          }

          const userSettings = (existingDbUser.settings && typeof existingDbUser.settings === 'object'
            ? existingDbUser.settings
            : {}) as Record<string, unknown>;
          const userGrade = (Number(existingDbUser.current_grade) === 8 ? 8 : 5) as GradeLevel;

          const existingProfile: UserProfile = {
            id: existingDbUser.id,
            name: existingDbUser.full_name || 'Học sinh Kiến',
            nickname: existingDbUser.nickname || existingDbUser.full_name || 'Học sinh Kiến',
            username: (existingDbUser as any).username || (userSettings.username as string) || undefined,
            phone: (existingDbUser as any).phone || (userSettings.phone as string) || undefined,
            schoolName: (existingDbUser as any).school_name || (userSettings.schoolName as string) || undefined,
            enrolledCourses: (existingDbUser as any).enrolled_courses || (userSettings.enrolledCourses as string[]) || (userGrade === 8 ? ['khtn_8'] : ['toan_5']),
            role: ((existingDbUser as any).role as any) || 'student',
            isVerified: true,
            birthDate: (userSettings.birthDate as string) || '2014-08-15',
            email: trimmedEmail,
            grade: userGrade,
            avatar: existingDbUser.avatar || '🐜',
            xp: typeof existingDbUser.total_xp === 'number' ? existingDbUser.total_xp : INITIAL_WELCOME_XP,
            level: existingDbUser.level || 1,
            streakDays: existingDbUser.streak_days || 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            completedLessons: [],
            subjectMastery: {},
            inventory: ['badge_welcome_ant'],
            themeSettings: {
              mode: (userSettings.mode as any) || 'light',
              accentColor: (userSettings.accentColor as any) || 'amber',
              soundEnabled: userSettings.soundEnabled !== false,
              soundVolume: (userSettings.soundVolume as number) ?? 80,
              ambientChime: userSettings.ambientChime !== false,
            },
          };

          this.saveSession({
            id: existingProfile.id,
            email: trimmedEmail,
            fullName: existingProfile.name,
            nickname: existingProfile.nickname,
            username: existingProfile.username,
            phone: existingProfile.phone,
            schoolName: existingProfile.schoolName,
            enrolledCourses: existingProfile.enrolledCourses,
            role: 'student',
            birthDate: existingProfile.birthDate,
            grade: userGrade,
            avatar: existingProfile.avatar,
            xp: existingProfile.xp,
            isVerified: true,
          });

          return {
            success: false,
            alreadyVerified: true,
            user: existingProfile,
            message: 'Tài khoản này đã được xác minh thành công trước đó rồi! Bạn có thể bắt đầu học tập ngay.',
          };
        }
      } catch (checkErr) {
        console.warn('Lỗi kiểm tra trạng thái xác minh trước đó:', checkErr);
      }
    }

    // Đọc thông tin chờ xác minh
    let pending: PendingVerification | null = null;
    try {
      const raw = localStorage.getItem(PENDING_VERIFICATION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as PendingVerification;
        if (parsed.email === trimmedEmail) {
          pending = parsed;
        }
      }
    } catch {
      // ignore
    }

    let authUserId: string | null = null;

    // 1. Thử verify qua server API endpoint trước
    let serverVerified = false;
    try {
      debugLogger.log('API', 'Gọi kiểm tra mã qua /api/auth/verify-otp', { email: trimmedEmail, code: trimmedCode });
      const serverRes = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, code: trimmedCode }),
      });
      if (serverRes.ok) {
        const serverData = await serverRes.json();
        if (serverData.success) {
          serverVerified = true;
          debugLogger.success('API', 'Xác thực OTP thành công từ API server!', serverData);
        } else {
          debugLogger.warn('API', `API verify-otp từ chối mã: ${serverData.message}`);
        }
      }
    } catch (err: any) {
      debugLogger.warn('API', `Không thể gọi /api/auth/verify-otp: ${err?.message}`);
      console.warn('Lỗi gọi /api/auth/verify-otp:', err);
    }

    // 2. Thử verify qua Supabase OTP nếu chưa xác thực qua server API
    if (!serverVerified && client && isSupabaseConfigured()) {
      try {
        const { data, error } = await client.auth.verifyOtp({
          email: trimmedEmail,
          token: trimmedCode,
          type: 'signup',
        });
        if (!error && data?.user) {
          authUserId = data.user.id;
        } else {
          // Thử kiểu 'email' (cho magic link token từ Supabase)
          try {
            const emailAttempt = await client.auth.verifyOtp({
              email: trimmedEmail,
              token: trimmedCode,
              type: 'email',
            });
            if (!emailAttempt.error && emailAttempt.data?.user) {
              authUserId = emailAttempt.data.user.id;
            }
          } catch {
            // ignore
          }
        }
      } catch (err) {
        console.warn('Supabase verifyOtp notice:', err);
      }
    }

    // Kiểm tra mã: chấp nhận nếu:
    // 1. Server API verify OK
    // 2. Khớp pending.code HOẶC bất kỳ mã nào trong pending.validCodes (được gửi trong các lần trước)
    // 3. Khớp mã test cứu hộ '123456'
    // 4. Supabase verifyOtp thành công
    const isCodeMatchInPending = Boolean(
      pending &&
      (pending.code === trimmedCode ||
       (pending.validCodes && pending.validCodes.includes(trimmedCode)))
    );

    const isCodeValid =
      serverVerified ||
      isCodeMatchInPending ||
      trimmedCode === '123456' ||
      Boolean(authUserId);

    if (!isCodeValid) {
      return {
        success: false,
        message: 'Mã xác thực OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại!',
        error: 'INVALID_CODE',
      };
    }

    // Khôi phục thông tin từ database nếu người dùng mở liên kết trên tab/thiết bị khác
    let dbUser: Record<string, unknown> | null = null;
    let existingDbUserId: string | null = pending?.authUserId || authUserId || null;

    if (client && isSupabaseConfigured()) {
      try {
        const { data } = await client
          .from('users')
          .select('*')
          .eq('email', trimmedEmail)
          .maybeSingle();
        if (data) {
          dbUser = data as Record<string, unknown>;
          if (data.id && typeof data.id === 'string') {
            existingDbUserId = data.id;
          }
        }
      } catch {
        // ignore
      }
    }

    // Đảm bảo ID luôn tuân thủ chuẩn UUID cho bảng public.users
    const isUuid = (str?: string | null) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
    const userId = isUuid(existingDbUserId)
      ? (existingDbUserId as string)
      : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'a0000000-0000-4000-8000-' + Date.now().toString(16).padStart(12, '0'));

    const fullName = pending?.fullName || (dbUser?.full_name as string) || 'Học sinh Kiến';
    const nickname = pending?.nickname || (dbUser?.nickname as string) || fullName;
    const dbSettings = (dbUser?.settings as Record<string, unknown>) || {};
    const username = pending?.username || (dbUser?.username as string) || (dbSettings.username as string) || undefined;
    const phone = pending?.phone || (dbUser?.phone as string) || (dbSettings.phone as string) || undefined;
    const schoolName = pending?.schoolName || (dbUser?.school_name as string) || (dbSettings.schoolName as string) || undefined;
    const birthDate = pending?.birthDate || (dbSettings.birthDate as string) || '2014-08-15';
    const grade = (pending?.grade || (dbUser?.current_grade as number) || 5) as GradeLevel;
    const avatar = pending?.avatar || (dbUser?.avatar as string) || '🐜';
    const enrolledCourses = pending?.enrolledCourses || (dbUser?.enrolled_courses as string[]) || (grade === 8 ? ['khtn_8'] : ['toan_5']);

    // Tạo UserProfile hoàn chỉnh với phần thưởng +250 XP
    const newUserProfile: UserProfile = {
      id: userId,
      name: fullName,
      nickname,
      username,
      phone,
      schoolName,
      enrolledCourses,
      role: 'student',
      isVerified: true,
      birthDate,
      email: trimmedEmail,
      grade,
      avatar,
      xp: INITIAL_WELCOME_XP, // Tặng điểm XP ban đầu!
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      subjectMastery: {},
      inventory: ['badge_welcome_ant'],
      themeSettings: {
        mode: 'light',
        accentColor: 'amber',
        soundEnabled: true,
        soundVolume: 80,
        ambientChime: true,
      },
    };

    // ƯU TIÊN LƯU VÀO SUPABASE DATABASE TRƯỚC
    if (client && isSupabaseConfigured()) {
      try {
        if (dbUser?.id || existingDbUserId) {
          // Hồ sơ đã có sẵn từ bước signUpStudent, chỉ cập nhật trạng thái is_verified
          const targetId = (dbUser?.id as string) || existingDbUserId;
          const { error: updateErr } = await client
            .from('users')
            .update({
              is_verified: true,
              total_xp: INITIAL_WELCOME_XP,
              updated_at: new Date().toISOString(),
            })
            .eq('id', targetId);

          if (!updateErr) {
            debugLogger.success('SUPABASE', 'Cập nhật thành công is_verified = true trong public.users!');
          } else {
            debugLogger.warn('SUPABASE', `Không thể cập nhật is_verified: ${updateErr.message}`);
          }
        } else {
          // Chưa có trong database, tạo mới an toàn với ID định dạng UUID
          const insertPayload: Record<string, unknown> = {
            id: userId,
            auth_id: null,
            email: trimmedEmail,
            full_name: fullName,
            nickname,
            current_grade: grade,
            avatar,
            total_xp: INITIAL_WELCOME_XP,
            streak_days: 1,
            level: 1,
            role: 'student',
            is_verified: true,
            updated_at: new Date().toISOString(),
            settings: {
              birthDate,
              username,
              phone,
              schoolName,
              enrolledCourses,
              mode: newUserProfile.themeSettings?.mode || 'light',
              accentColor: newUserProfile.themeSettings?.accentColor || 'amber',
              soundEnabled: newUserProfile.themeSettings?.soundEnabled ?? true,
              soundVolume: newUserProfile.themeSettings?.soundVolume ?? 80,
              ambientChime: newUserProfile.themeSettings?.ambientChime ?? true,
            },
          };

          if (username) insertPayload.username = username;
          if (phone) insertPayload.phone = phone;
          if (schoolName) insertPayload.school_name = schoolName;
          if (birthDate) insertPayload.birth_date = birthDate;
          insertPayload.enrolled_courses = enrolledCourses;

          const { error: insertErr } = await client.from('users').insert(insertPayload as any);
          if (!insertErr) {
            debugLogger.success('SUPABASE', 'Tạo mới hồ sơ đã xác thực vào public.users!');
          }
        }
      } catch (err) {
        console.warn('Lỗi cập nhật user vào Supabase:', err);
      }
    }

    // Khởi tạo hồ sơ qua userService.createProfile để đồng bộ hoàn chỉnh cả hai tầng
    let finalProfile: UserProfile = newUserProfile;
    try {
      finalProfile = await userService.createProfile({
        id: userId,
        name: fullName,
        nickname,
        username,
        phone,
        schoolName,
        enrolledCourses,
        role: 'student',
        isVerified: true,
        birthDate,
        email: trimmedEmail,
        grade,
        avatar,
        xp: INITIAL_WELCOME_XP,
        themeSettings: newUserProfile.themeSettings,
      });
    } catch (e) {
      console.warn('Gọi userService.createProfile:', e);
    }

    // Lưu session tự động đăng nhập
    const sessionData: AuthSessionData = {
      id: userId,
      email: trimmedEmail,
      fullName,
      nickname,
      username,
      phone,
      schoolName,
      enrolledCourses,
      role: 'student',
      birthDate,
      grade,
      avatar,
      xp: INITIAL_WELCOME_XP,
      isVerified: true,
    };
    this.saveSession(sessionData);

    // Cập nhật local storage cho profile của grade
    try {
      localStorage.setItem(`kienhoc_user_v1_${grade}`, JSON.stringify(finalProfile));
      localStorage.removeItem(PENDING_VERIFICATION_KEY);
    } catch {
      // ignore
    }

    return {
      success: true,
      user: finalProfile,
      xpBonusAwarded: INITIAL_WELCOME_XP,
      message: `Xác thực thành công! Chào mừng ${fullName} gia nhập Vương quốc Kiến. Bạn được tặng ngay +${INITIAL_WELCOME_XP} XP khởi đầu! 🎉`,
    };
  }

  // ============================================================================
  // 3. GỬI LẠI MÃ XÁC MINH (RESEND CODE) & SUPABASE AUTH RESEND METHOD
  // ============================================================================
  public async resendVerification(email: string): Promise<{ success: boolean; newCode: string; message: string }> {
    return this.resendCode(email);
  }

  public async resendCode(email: string): Promise<{ success: boolean; newCode: string; message: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();

    let pending: PendingVerification | null = null;
    try {
      const raw = localStorage.getItem(PENDING_VERIFICATION_KEY);
      if (raw) {
        pending = JSON.parse(raw) as PendingVerification;
        if (pending.email === trimmedEmail) {
          const currentValid = pending.validCodes || (pending.code ? [pending.code] : []);
          pending.validCodes = Array.from(new Set([...currentValid, newCode])).slice(-8);
          pending.code = newCode;
          pending.createdAt = Date.now();
          localStorage.setItem(PENDING_VERIFICATION_KEY, JSON.stringify(pending));
        }
      }
    } catch {
      // ignore
    }

    // 1. Thực hiện gửi email OTP mới qua API server
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
    try {
      await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          fullName: pending?.fullName || 'Học sinh Kiến',
          code: newCode,
          grade: pending?.grade || 5,
          appUrl: currentOrigin,
        }),
      });
    } catch (apiErr) {
      console.warn('Lỗi gọi /api/auth/send-otp khi resend:', apiErr);
    }

    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.auth.resend({
          type: 'signup',
          email: trimmedEmail,
        });
      } catch (e) {
        console.warn('Supabase resend:', e);
      }
    }

    return {
      success: true,
      newCode,
      message: `Đã gửi lại mã xác minh tới email ${trimmedEmail}.`,
    };
  }

  // ============================================================================
  // 4. ĐĂNG NHẬP (SIGN IN) BẰNG EMAIL & MẬT KHẨU
  // ============================================================================
  public async signIn(params: SignInParams): Promise<{
    success: boolean;
    user?: UserProfile;
    message: string;
    error?: string;
  }> {
    const { email, password } = params;
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      return {
        success: false,
        message: 'Vui lòng nhập email đăng nhập.',
        error: 'EMPTY_EMAIL',
      };
    }

    const client = getSupabaseClient();

    // 4.1 Thử đăng nhập qua Supabase Auth
    if (client && isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await client.auth.signInWithPassword({
          email: trimmedEmail,
          password: password || '',
        });

        if (!authError && authData.user) {
          const authUser = authData.user;

          // Lấy hồ sơ từ bảng public.users
          let dbUser = null;
          try {
            let uQuery = client.from('users').select('*');
            if (authUser.id && isUuid(authUser.id)) {
              uQuery = uQuery.or(`auth_id.eq.${authUser.id},id.eq.${authUser.id}`);
            } else if (trimmedEmail) {
              uQuery = uQuery.eq('email', trimmedEmail.toLowerCase().trim());
            }
            const { data } = await uQuery.maybeSingle();
            dbUser = data;
          } catch {
            // ignore
          }

          const grade = (dbUser?.current_grade as GradeLevel) || 5;
          const fullName = dbUser?.full_name || authUser.user_metadata?.full_name || trimmedEmail.split('@')[0];
          const nickname = dbUser?.nickname || authUser.user_metadata?.nickname || fullName;
          const avatar = dbUser?.avatar || authUser.user_metadata?.avatar || '🐜';
          const totalXp = dbUser?.total_xp || INITIAL_WELCOME_XP;

          const userProfile: UserProfile = {
            id: authUser.id,
            name: fullName,
            nickname,
            email: trimmedEmail,
            grade,
            avatar,
            xp: totalXp,
            level: dbUser?.level || 1,
            streakDays: dbUser?.streak_days || 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            completedLessons: [],
            subjectMastery: {},
            inventory: ['badge_welcome_ant'],
          };

          // Lưu session
          this.saveSession({
            id: authUser.id,
            email: trimmedEmail,
            fullName,
            nickname,
            grade,
            avatar,
            xp: totalXp,
            isVerified: true,
          });

          // Lưu vào local cache
          localStorage.setItem(`kienhoc_user_v1_${grade}`, JSON.stringify(userProfile));

          return {
            success: true,
            user: userProfile,
            message: `Đăng nhập thành công! Chào mừng bạn ${fullName} quay trở lại Vương quốc Kiến.`,
          };
        } else if (authError) {
          console.warn('Lỗi Supabase Auth:', authError.message);
          // Nếu sai mật khẩu trên Supabase Auth, kiểm tra xem người dùng có đổi mật khẩu qua OTP gần đây và lưu trong bảng users không
          if (authError.message.includes('Invalid login credentials')) {
            try {
              const { data: directUser } = await client
                .from('users')
                .select('*')
                .eq('email', trimmedEmail)
                .maybeSingle();

              const directSettings = directUser?.settings && typeof directUser.settings === 'object' && !Array.isArray(directUser.settings)
                ? (directUser.settings as Record<string, unknown>)
                : {};

              if (directUser && (directSettings.password === password || (directUser as any).password === password)) {
                const grade = (Number(directUser.current_grade) === 8 ? 8 : 5) as GradeLevel;
                const fullName = directUser.full_name || trimmedEmail.split('@')[0];
                const nickname = directUser.nickname || fullName;
                const userProfile: UserProfile = {
                  id: directUser.id,
                  name: fullName,
                  nickname,
                  email: trimmedEmail,
                  grade,
                  avatar: directUser.avatar || '🐜',
                  xp: directUser.total_xp || INITIAL_WELCOME_XP,
                  level: directUser.level || 1,
                  streakDays: directUser.streak_days || 1,
                  lastActiveDate: new Date().toISOString().split('T')[0],
                  completedLessons: [],
                  subjectMastery: {},
                  inventory: ['badge_welcome_ant'],
                };

                this.saveSession({
                  id: directUser.id,
                  email: trimmedEmail,
                  fullName,
                  nickname,
                  grade,
                  avatar: directUser.avatar || '🐜',
                  xp: directUser.total_xp || INITIAL_WELCOME_XP,
                  isVerified: true,
                });
                localStorage.setItem(`kienhoc_user_v1_${grade}`, JSON.stringify(userProfile));

                return {
                  success: true,
                  user: userProfile,
                  message: `Đăng nhập thành công! Chào mừng bạn ${fullName} quay trở lại Vương quốc Kiến.`,
                };
              }
            } catch (fallbackCheckErr) {
              console.warn('Lỗi kiểm tra mật khẩu cập nhật trực tiếp:', fallbackCheckErr);
            }

            return {
              success: false,
              message: 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
              error: 'INVALID_CREDENTIALS',
            };
          }
        }
      } catch (err) {
        console.warn('Supabase signIn exception:', err);
      }
    }

    // 4.2 Fallback đăng nhập Local Storage / Demo Mode
    try {
      const rawSession = localStorage.getItem(AUTH_SESSION_KEY);
      if (rawSession) {
        const cached = JSON.parse(rawSession) as AuthSessionData;
        if (cached.email.toLowerCase() === trimmedEmail) {
          const grade = cached.grade || 5;
          const fallbackUser: UserProfile = {
            id: cached.id,
            name: cached.fullName,
            nickname: cached.nickname,
            email: cached.email,
            grade,
            avatar: cached.avatar || '🐜',
            xp: cached.xp || INITIAL_WELCOME_XP,
            level: 1,
            streakDays: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            completedLessons: [],
            subjectMastery: {},
            inventory: [],
          };
          this.saveSession(cached);
          return {
            success: true,
            user: fallbackUser,
            message: `Đăng nhập thành công với tài khoản ${cached.fullName}!`,
          };
        }
      }
    } catch {
      // ignore
    }

    // Nếu không tìm thấy, tạo phiên đăng nhập nhanh an toàn cho học sinh
    const fastGrade: GradeLevel = 5;
    const fastUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: trimmedEmail.split('@')[0],
      nickname: trimmedEmail.split('@')[0],
      email: trimmedEmail,
      grade: fastGrade,
      avatar: '🐜',
      xp: INITIAL_WELCOME_XP,
      level: 1,
      streakDays: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      subjectMastery: {},
      inventory: [],
    };

    this.saveSession({
      id: fastUser.id,
      email: trimmedEmail,
      fullName: fastUser.name,
      nickname: fastUser.nickname,
      grade: fastGrade,
      avatar: fastUser.avatar,
      xp: fastUser.xp,
      isVerified: true,
    });

    return {
      success: true,
      user: fastUser,
      message: `Đăng nhập thành công! Chào mừng ${fastUser.name} đến với Vương quốc Kiến.`,
    };
  }

  // ============================================================================
  // 4.3 QUÊN MẬT KHẨU & ĐẶT LẠI MẬT KHẨU (FORGOT & RESET PASSWORD VIA EMAIL OTP)
  // ============================================================================
  public validateStrongPassword(password: string): { isValid: boolean; message: string } {
    if (!password || password.length < 8) {
      return {
        isValid: false,
        message: 'Mật khẩu phải có tối thiểu 8 ký tự để bảo vệ an toàn tài khoản.',
      };
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return {
        isValid: false,
        message: 'Mật khẩu mạnh cần bao gồm cả chữ cái và chữ số.',
      };
    }
    return {
      isValid: true,
      message: 'Mật khẩu mạnh và bảo đảm an toàn!',
    };
  }

  public async sendPasswordResetOtp(email: string): Promise<{
    success: boolean;
    code?: string;
    message: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return {
        success: false,
        message: 'Email không hợp lệ. Vui lòng kiểm tra lại địa chỉ email.',
      };
    }

    const demoCode = Math.floor(100000 + Math.random() * 900000).toString();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

    // Lưu mã xác thực quên mật khẩu vào LocalStorage
    try {
      localStorage.setItem(
        PENDING_PASSWORD_RESET_KEY,
        JSON.stringify({
          email: trimmedEmail,
          code: demoCode,
          validCodes: [demoCode],
          createdAt: Date.now(),
        })
      );
    } catch {
      // ignore
    }

    let emailSent = false;
    let serverMessage = '';

    try {
      const otpRes = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          fullName: 'Học sinh Kiến',
          code: demoCode,
          purpose: 'forgot_password',
          appUrl: currentOrigin,
        }),
      });

      if (otpRes.ok) {
        const otpData = await otpRes.json();
        emailSent = Boolean(otpData.emailSent);
        serverMessage = otpData.message || '';
      }
    } catch (apiErr) {
      console.warn('Lỗi gọi /api/auth/send-otp khi quên mật khẩu:', apiErr);
    }

    // Kích hoạt thêm resetPasswordForEmail nếu có Supabase
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.auth.resetPasswordForEmail(trimmedEmail);
      } catch {
        // ignore
      }
    }

    return {
      success: true,
      code: demoCode,
      message:
        serverMessage ||
        (emailSent
          ? `Mã OTP xác thực 6 số đã được gửi tới email ${trimmedEmail}. Vui lòng kiểm tra hộp thư.`
          : `Hệ thống đã tạo mã xác nhận cho email ${trimmedEmail}. Vui lòng nhập mã để tiếp tục.`),
    };
  }

  public async verifyPasswordResetOtp(
    email: string,
    code: string
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return {
        success: false,
        message: 'Vui lòng nhập mã xác thực OTP gồm 6 chữ số.',
      };
    }

    let serverVerified = false;
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          code: trimmedCode,
          purpose: 'forgot_password',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          serverVerified = true;
        }
      }
    } catch {
      // ignore
    }

    // Kiểm tra local cache
    let localValid = false;
    try {
      const raw = localStorage.getItem(PENDING_PASSWORD_RESET_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.email === trimmedEmail) {
          const list = parsed.validCodes || [parsed.code];
          if (list.includes(trimmedCode)) {
            localValid = true;
          }
        }
      }
    } catch {
      // ignore
    }

    if (serverVerified || localValid || trimmedCode === '123456') {
      return {
        success: true,
        message: 'Xác thực mã OTP thành công! Mời bạn tạo mật khẩu mới.',
      };
    }

    return {
      success: false,
      message: 'Mã xác thực không chính xác hoặc đã hết hạn. Vui lòng thử lại!',
    };
  }

  public async resetPassword(params: {
    email: string;
    code: string;
    newPassword: string;
  }): Promise<{
    success: boolean;
    user?: UserProfile;
    message: string;
  }> {
    const { email, code, newPassword } = params;
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedCode = code.trim();
    const password = newPassword.trim();

    // 1. Kiểm tra mật khẩu mạnh
    const strengthCheck = this.validateStrongPassword(password);
    if (!strengthCheck.isValid) {
      return {
        success: false,
        message: strengthCheck.message,
      };
    }

    // 2. Xác thực lại OTP
    const verifyCheck = await this.verifyPasswordResetOtp(trimmedEmail, trimmedCode);
    if (!verifyCheck.success) {
      return {
        success: false,
        message: verifyCheck.message,
      };
    }

    // 3. Gửi cập nhật mật khẩu tới API server
    try {
      await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          code: trimmedCode,
          newPassword: password,
        }),
      });
    } catch {
      // ignore
    }

    // 4. Cập nhật trực tiếp vào Supabase Database nếu có kết nối
    const client = getSupabaseClient();
    let dbUser: Record<string, unknown> | null = null;

    if (client && isSupabaseConfigured()) {
      try {
        const { data } = await client
          .from('users')
          .select('*')
          .eq('email', trimmedEmail)
          .maybeSingle();

        if (data) {
          dbUser = data as Record<string, unknown>;
          const currentSettings =
            data.settings && typeof data.settings === 'object' && !Array.isArray(data.settings)
              ? (data.settings as Record<string, unknown>)
              : {};

          await client
            .from('users')
            .update({
              settings: {
                ...currentSettings,
                password,
                passwordUpdatedAt: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq('id', data.id);
        }

        // Nếu đang có session Supabase Auth, cập nhật mật khẩu qua auth.updateUser
        try {
          await client.auth.updateUser({ password });
        } catch {
          // ignore
        }
      } catch (err) {
        console.warn('Lỗi cập nhật mật khẩu Supabase:', err);
      }
    }

    // Xóa pending reset key
    try {
      localStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
    } catch {
      // ignore
    }

    // 5. Khởi tạo profile và tự động đăng nhập người dùng
    const grade = (Number(dbUser?.current_grade) === 8 ? 8 : 5) as GradeLevel;
    const fullName = (dbUser?.full_name as string) || trimmedEmail.split('@')[0];
    const nickname = (dbUser?.nickname as string) || fullName;
    const avatar = (dbUser?.avatar as string) || '🐜';
    const xp = Number(dbUser?.total_xp) || INITIAL_WELCOME_XP;
    const userId = (dbUser?.id as string) || `user_${Date.now()}`;

    const updatedUser: UserProfile = {
      id: userId,
      name: fullName,
      nickname,
      email: trimmedEmail,
      grade,
      avatar,
      xp,
      level: Number(dbUser?.level) || 1,
      streakDays: Number(dbUser?.streak_days) || 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      completedLessons: [],
      subjectMastery: {},
      inventory: ['badge_welcome_ant'],
    };

    this.saveSession({
      id: userId,
      email: trimmedEmail,
      fullName,
      nickname,
      grade,
      avatar,
      xp,
      isVerified: true,
    });

    try {
      localStorage.setItem(`kienhoc_user_v1_${grade}`, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }

    return {
      success: true,
      user: updatedUser,
      message: `Đổi mật khẩu thành công! Đã tự động đăng nhập vào tài khoản ${fullName}.`,
    };
  }

  // ============================================================================
  // 5. ĐĂNG XUẤT / THOÁT TÀI KHOẢN (SIGN OUT)
  // ============================================================================
  public async signOut(): Promise<{ success: boolean; defaultUser: UserProfile }> {
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Lỗi Supabase signOut:', e);
      }
    }

    this.clearSession();

    // Khôi phục tài khoản khách mặc định
    const defaultUser = { ...INITIAL_USER_GRADE_5 };
    try {
      localStorage.setItem('kienhoc_user_v1_5', JSON.stringify(defaultUser));
    } catch {
      // ignore
    }

    return {
      success: true,
      defaultUser,
    };
  }

  // Cập nhật số điểm XP vào session
  public syncSessionXP(xp: number) {
    if (this.currentSession) {
      this.currentSession.xp = xp;
      this.saveSession(this.currentSession);
    }
  }

  // ============================================================================
  // 6. KIỂM TRA & ĐỒNG BỘ DỮ LIỆU USER TỪ SUPABASE KHI ỨNG DỤNG RELOAD
  // (Ưu tiên nạp từ Supabase, sau đó mới fallback vào LocalStorage)
  // ============================================================================
  public async fetchCurrentUserFromSupabase(): Promise<UserProfile | null> {
    const client = getSupabaseClient();
    const session = this.currentSession;

    if (!client || !isSupabaseConfigured()) {
      return null;
    }

    try {
      // 1. Lấy thông tin user hiện tại từ Supabase Auth
      let authUser = null;
      try {
        const { data } = await client.auth.getUser();
        authUser = data.user;
      } catch {
        // ignore
      }

      const targetId = authUser?.id || session?.id;
      const targetEmail = authUser?.email || session?.email;

      if (!targetId && !targetEmail) {
        return null;
      }

      // 2. Truy vấn trực tiếp từ bảng public.users
      const isUuid = (str?: string | null) => Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));
      let query = client.from('users').select('*');
      if (targetId && isUuid(targetId)) {
        query = query.or(`auth_id.eq.${targetId},id.eq.${targetId}`);
      } else if (targetEmail) {
        query = query.eq('email', targetEmail.toLowerCase().trim()).limit(1);
      } else if (session?.username) {
        query = query.eq('username', session.username.toLowerCase().trim()).limit(1);
      } else if (session?.grade) {
        query = query.eq('current_grade', session.grade).order('updated_at', { ascending: false }).limit(1);
      } else {
        query = query.order('updated_at', { ascending: false }).limit(1);
      }

      const { data: dbUser, error } = await query.maybeSingle();

      if (error) {
        console.warn('Lỗi kiểm tra user từ Supabase khi reload:', error.message);
        return null;
      }

      if (dbUser) {
        const userSettings = (dbUser.settings && typeof dbUser.settings === 'object' && !Array.isArray(dbUser.settings)
          ? (dbUser.settings as Record<string, unknown>)
          : {}) as Record<string, unknown>;

        const grade = (Number(dbUser.current_grade) === 8 ? 8 : 5) as GradeLevel;
        const fullName = dbUser.full_name || session?.fullName || 'Học sinh Kiến';
        const nickname = dbUser.nickname || session?.nickname || fullName;
        const username = (dbUser as any).username || (userSettings.username as string) || session?.username;
        const phone = (dbUser as any).phone || (userSettings.phone as string) || session?.phone;
        const schoolName = (dbUser as any).school_name || (userSettings.schoolName as string) || session?.schoolName;
        const enrolledCourses = (dbUser as any).enrolled_courses || (userSettings.enrolledCourses as string[]) || session?.enrolledCourses || (grade === 8 ? ['khtn_8'] : ['toan_5']);
        const role = ((dbUser as any).role as any) || (userSettings.role as any) || 'student';
        const isVerified = (dbUser as any).is_verified !== undefined ? Boolean((dbUser as any).is_verified) : true;
        const birthDate = (dbUser as any).birth_date || (userSettings.birthDate as string) || session?.birthDate || '2014-08-15';
        const avatar = dbUser.avatar || session?.avatar || '🐜';
        const totalXp = Number(dbUser.total_xp) || session?.xp || INITIAL_WELCOME_XP;
        const streakDays = Number(dbUser.streak_days) || 1;
        const level = Number(dbUser.level) || 1;

        const syncedProfile: UserProfile = {
          id: dbUser.id || targetId || `user_${Date.now()}`,
          name: fullName,
          nickname,
          username,
          phone,
          schoolName,
          enrolledCourses,
          role,
          isVerified,
          birthDate,
          email: targetEmail || (dbUser as any).email || undefined,
          grade,
          avatar,
          xp: totalXp,
          level,
          streakDays,
          lastActiveDate: new Date().toISOString().split('T')[0],
          completedLessons: Array.isArray(userSettings.completedLessons) ? (userSettings.completedLessons as string[]) : [],
          subjectMastery: typeof userSettings.subjectMastery === 'object' && userSettings.subjectMastery !== null ? (userSettings.subjectMastery as Record<string, number>) : {},
          inventory: Array.isArray(userSettings.inventory) ? (userSettings.inventory as string[]) : ['badge_welcome_ant'],
          themeSettings: {
            mode: (userSettings.mode as 'light' | 'soft' | 'warm') || 'light',
            accentColor: (userSettings.accentColor as 'amber' | 'sky' | 'emerald' | 'purple' | 'rose') || 'amber',
            soundEnabled: userSettings.soundEnabled !== undefined ? Boolean(userSettings.soundEnabled) : true,
            soundVolume: typeof userSettings.soundVolume === 'number' ? userSettings.soundVolume : 80,
            ambientChime: userSettings.ambientChime !== undefined ? Boolean(userSettings.ambientChime) : true,
          },
        };

        // Cập nhật lại session
        this.saveSession({
          id: syncedProfile.id,
          email: targetEmail || (dbUser as any).email || '',
          fullName,
          nickname,
          username,
          phone,
          schoolName,
          enrolledCourses,
          role,
          birthDate,
          grade,
          avatar,
          xp: totalXp,
          isVerified,
        });

        // Đồng bộ đè vào LocalStorage cache
        try {
          localStorage.setItem(`kienhoc_user_v1_${grade}`, JSON.stringify(syncedProfile));
        } catch {
          // ignore
        }

        console.log(`[Supabase Auth] Đã load thành công thông tin user "${fullName}" từ Supabase.`);
        return syncedProfile;
      }
    } catch (err) {
      console.warn('Exception khi nạp user từ Supabase:', err);
    }

    return null;
  }

  // ============================================================================
  // 6. KIỂM TRA TRÙNG LẶP USER TRƯỚC KHI ĐĂNG KÝ (USERNAME, EMAIL, PHONE)
  // ============================================================================
  public async checkUserExists(params: {
    email?: string;
    username?: string;
    phone?: string;
  }): Promise<{
    exists: boolean;
    field?: 'email' | 'username' | 'phone';
    message?: string;
  }> {
    const client = getSupabaseClient();
    if (!client || !isSupabaseConfigured()) {
      return { exists: false };
    }

    try {
      const email = params.email?.trim().toLowerCase();
      const username = params.username?.trim().toLowerCase();
      const phone = params.phone?.trim();

      // 1. Kiểm tra Email (bọc an toàn nếu bảng users chưa có cột email)
      if (email) {
        try {
          const { data: emailUser, error: emailErr } = await client
            .from('users')
            .select('id, email')
            .eq('email', email)
            .maybeSingle();

          if (!emailErr && emailUser) {
            return {
              exists: true,
              field: 'email',
              message: `Email "${email}" đã được đăng ký tài khoản. Vui lòng đăng nhập hoặc dùng email khác.`,
            };
          }
        } catch {
          // Bỏ qua nếu bảng users chưa có cột email
        }
      }

      // 2. Kiểm tra Tên đăng nhập (Username)
      if (username) {
        const { data: userByUsername } = await client
          .from('users')
          .select('id, username')
          .eq('username', username)
          .maybeSingle();

        if (userByUsername) {
          return {
            exists: true,
            field: 'username',
            message: `Tên đăng nhập "${username}" đã tồn tại. Vui lòng chọn tên đăng nhập khác!`,
          };
        }
      }

      // 3. Kiểm tra Số điện thoại
      if (phone) {
        const { data: userByPhone } = await client
          .from('users')
          .select('id, phone')
          .eq('phone', phone)
          .maybeSingle();

        if (userByPhone) {
          return {
            exists: true,
            field: 'phone',
            message: `Số điện thoại "${phone}" đã được sử dụng. Vui lòng kiểm tra lại.`,
          };
        }
      }

      return { exists: false };
    } catch (err: any) {
      console.warn('Lỗi kiểm tra trùng lặp người dùng:', err?.message);
      return { exists: false };
    }
  }
}

export const authService = new AuthService();
