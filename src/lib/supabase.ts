import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Đọc thông tin kết nối Supabase từ biến môi trường (hỗ trợ cả Vite client và Node.js server)
const supabaseUrl: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_URL) ||
  '';
const supabaseAnonKey: string =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_SUPABASE_ANON_KEY) ||
  '';

// Kiểm tra xem đã cung cấp credentials Supabase chưa
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  );
};

// Khởi tạo Supabase Client (singleton có type Database)
let clientInstance: SupabaseClient<Database> | null = null;

export const getSupabaseClient = (): SupabaseClient<Database> | null => {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!clientInstance) {
    try {
      clientInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

