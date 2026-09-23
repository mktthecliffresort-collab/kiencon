import { AdminUser, AdminRole, AIConfig } from '../types';

export const DEMO_ADMINS: AdminUser[] = [
  {
    id: 'admin_1',
    name: 'Nguyễn Minh Hoàng',
    email: 'mkt.thecliffresort@gmail.com',
    avatar: '👑',
    role: 'super_admin',
    roleTitle: 'Super Admin',
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
    roleTitle: 'Quản Lý Bài Học',
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
    roleTitle: 'Quản Lý Môn Học',
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
    roleTitle: 'Quản Lý Lớp',
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
    roleTitle: 'Quản Lý Nội Dung',
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
    roleTitle: 'Quản Lý Học Viên',
    permissions: ['students:view', 'students:grant_xp', 'students:support'],
    lastLogin: 'Hôm nay lúc 11:00',
    status: 'active',
  },
];

const ADMIN_STORAGE_KEY = 'kienhoc_admincp_session';

class AdminService {
  private currentAdmin: AdminUser | null = null;
  private listeners: Array<(admin: AdminUser | null) => void> = [];

  constructor() {
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (raw) {
        this.currentAdmin = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Lỗi đọc session admin:', e);
      this.currentAdmin = null;
    }
  }

  public getCurrentAdmin(): AdminUser | null {
    if (!this.currentAdmin) {
      this.loadSession();
    }
    return this.currentAdmin;
  }

  public isAuthenticated(): boolean {
    return this.getCurrentAdmin() !== null;
  }

  public loginWithEmail(email: string, _password?: string): { success: boolean; admin?: AdminUser; error?: string } {
    const trimmedEmail = email.trim().toLowerCase();
    const found = DEMO_ADMINS.find((a) => a.email.toLowerCase() === trimmedEmail);
    if (!found) {
      return {
        success: false,
        error: `Email "${email}" không thuộc danh sách Ban Quản Trị được cấp phép!`,
      };
    }

    const updated = {
      ...found,
      lastLogin: 'Vừa xong',
    };
    this.setSession(updated);
    return { success: true, admin: updated };
  }

  public impersonate(adminId: string): AdminUser | null {
    const found = DEMO_ADMINS.find((a) => a.id === adminId);
    if (!found) return null;

    const updated = {
      ...found,
      lastLogin: 'Vừa xong',
    };
    this.setSession(updated);
    return updated;
  }

  // ============================================================================
  // CẤU HÌNH AI & CUSTOM MODEL KIẾN CON
  // ============================================================================
  public getAIConfig(): AIConfig {
    const defaultConfig: AIConfig = {
      endpoint: 'https://antigravity.thecliff.io.vn',
      apiKey: 'sk-123456@',
      model: 'gemini-3-flash',
      provider: 'gemini',
    };

    if (typeof window === 'undefined') return defaultConfig;

    try {
      const raw = localStorage.getItem('kienhoc_admin_ai_config');
      if (raw) {
        return { ...defaultConfig, ...JSON.parse(raw) };
      }
    } catch {
      // ignore
    }
    return defaultConfig;
  }

  public saveAIConfig(config: Partial<AIConfig>): AIConfig {
    const current = this.getAIConfig();
    const updated: AIConfig = {
      ...current,
      ...config,
      endpoint: (config.endpoint || current.endpoint).replace(/\/$/, ''),
      apiKey: (config.apiKey || current.apiKey).trim(),
      model: (config.model || current.model).trim(),
    };

    try {
      localStorage.setItem('kienhoc_admin_ai_config', JSON.stringify(updated));
    } catch (e) {
      console.warn('Lỗi lưu cấu hình AI:', e);
    }
    return updated;
  }

  public resetAIConfig(): AIConfig {
    const defaultConfig: AIConfig = {
      endpoint: 'https://antigravity.thecliff.io.vn',
      apiKey: 'sk-123456@',
      model: 'gemini-3-flash',
      provider: 'gemini',
    };
    try {
      localStorage.removeItem('kienhoc_admin_ai_config');
    } catch {
      // ignore
    }
    return defaultConfig;
  }

  public async testAIConnection(customConfig?: Partial<AIConfig>): Promise<{
    success: boolean;
    latencyMs: number;
    reply?: string;
    model?: string;
    message: string;
  }> {
    const config = customConfig ? { ...this.getAIConfig(), ...customConfig } : this.getAIConfig();
    const startTime = performance.now();

    try {
      const res = await fetch('/api/admin/test-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await res.json();
      return data;
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      return {
        success: false,
        latencyMs,
        message: `Lỗi kết nối tới endpoint: ${err?.message}`,
      };
    }
  }

  public logout(): void {
    this.currentAdmin = null;
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch (e) {
      console.warn('Lỗi xóa session admin:', e);
    }
    this.notify();
  }

  private setSession(admin: AdminUser): void {
    this.currentAdmin = admin;
    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
    } catch (e) {
      console.warn('Lỗi lưu session admin:', e);
    }
    this.notify();
  }

  public subscribe(listener: (admin: AdminUser | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l(this.currentAdmin));
  }
}

export const adminService = new AdminService();

