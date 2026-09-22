import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Đọc thông tin kết nối Supabase từ biến môi trường (hỗ trợ cả Vite client và Node.js server)
const getEnvUrl = (): string => {
  const envUrl =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL)) ||
    '';
  if (envUrl) return envUrl;

  // Fallback to in-app custom storage if user entered directly in Debug/CSDL tab
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('kienhoc_custom_supabase_url');
      if (stored) return stored.trim();
    } catch {
      // ignore
    }
  }
  return '';
};

const getEnvKey = (): string => {
  const envKey =
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY)) ||
    '';
  if (envKey) return envKey;

  // Fallback to in-app custom storage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = localStorage.getItem('kienhoc_custom_supabase_key');
      if (stored) return stored.trim();
    } catch {
      // ignore
    }
  }
  return '';
};

// Kiểm tra xem đã cung cấp credentials Supabase chưa
export const isSupabaseConfigured = (): boolean => {
  const url = getEnvUrl();
  const key = getEnvKey();
  return Boolean(
    url &&
    key &&
    url.startsWith('https://') &&
    key.length > 20
  );
};

export const getSupabaseConfigInfo = () => {
  const url = getEnvUrl();
  const key = getEnvKey();
  const isEnv = Boolean(
    (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL)) ||
    (typeof process !== 'undefined' && process.env && (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL))
  );

  return {
    isConfigured: isSupabaseConfigured(),
    url: url || 'Chưa thiết lập',
    maskedUrl: url ? url.replace(/^https?:\/\//, '').split('.')[0] + '.supabase.co' : 'Chưa thiết lập',
    keyConfigured: Boolean(key && key.length > 20),
    keyLength: key ? key.length : 0,
    source: isEnv ? 'Biến môi trường Vercel (VITE_SUPABASE_URL)' : (url ? 'Cấu hình thủ công trong ứng dụng' : 'Chưa cấu hình'),
  };
};

export const setCustomSupabaseConfig = (url: string, key: string) => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem('kienhoc_custom_supabase_url', url.trim());
    localStorage.setItem('kienhoc_custom_supabase_key', key.trim());
    clientInstance = null; // reset client instance
  }
};

export const clearCustomSupabaseConfig = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.removeItem('kienhoc_custom_supabase_url');
    localStorage.removeItem('kienhoc_custom_supabase_key');
    clientInstance = null;
  }
};

// Khởi tạo Supabase Client (singleton có type Database)
let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      const url = getEnvUrl();
      const key = getEnvKey();
      clientInstance = createClient<Database>(url, key, {
        auth: {
          persistSession: true, // Bắt buộc cho Offline-first
          autoRefreshToken: true,
        },
        global: {
          headers: { 'x-client-app': 'kien-hoc-ant-universe' },
        },
      });
    } catch (err) {
      console.warn('Không thể khởi tạo Supabase Client:', err);
      return null;
    }
  }
  return clientInstance;
};

export const supabase = getSupabaseClient();

// Hàm kiểm tra trạng thái kết nối tới Supabase (Ping check với đo độ trễ)
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  latencyMs?: number;
}> {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      message: 'Chưa cấu hình VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY trong .env',
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Lỗi khởi tạo Supabase Client',
    };
  }

  const start = performance.now();
  try {
    // Thử truy vấn bảng courses chuẩn hóa mới
    const { error } = await client.from('courses').select('id').limit(1);
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      // Nếu bảng chưa tạo, vẫn nhận diện kết nối hợp lệ nếu lỗi dạng table does not exist
      if (error.code === '42P01') {
        return {
          connected: true,
          message: 'Kết nối máy chủ Supabase thành công! Cần chạy schema.sql mới để kích hoạt các bảng.',
          latencyMs,
        };
      }
      return {
        connected: false,
        message: `Lỗi kết nối: ${error.message} (${error.code})`,
        latencyMs,
      };
    }

    return {
      connected: true,
      message: 'Kết nối Supabase ổn định (Cơ sở dữ liệu linh hoạt & RPC sẵn sàng)!',
      latencyMs,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Không thể kết nối Supabase: ${message}`,
    };
  }
}

