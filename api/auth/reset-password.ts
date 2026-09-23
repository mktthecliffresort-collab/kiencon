import { verifyOtpCode, consumeOtpCode } from '../../server/services/emailOtpService.js';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { email, code, newPassword } = req.body || {};

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, mã OTP và mật khẩu mới là bắt buộc.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim();
    const password = String(newPassword).trim();

    // 1. Kiểm tra độ mạnh của mật khẩu (theo yêu cầu người dùng)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có tối thiểu 8 ký tự để đảm bảo an toàn.',
      });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mạnh cần chứa cả chữ cái và chữ số.',
      });
    }

    // 2. Xác minh mã OTP
    const verifyResult = await verifyOtpCode(normalizedEmail, trimmedCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message || 'Mã xác thực OTP không chính xác hoặc đã hết hạn.',
      });
    }

    // 3. Cập nhật mật khẩu trong Supabase Database nếu có cấu hình
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    let dbUpdated = false;
    if (supabaseUrl && supabaseKey) {
      try {
        const client = createClient(supabaseUrl, supabaseKey);

        // Tìm user trong bảng public.users
        const { data: userRecord } = await client
          .from('users')
          .select('id, settings')
          .eq('email', normalizedEmail)
          .maybeSingle();

        if (userRecord) {
          const currentSettings = (userRecord.settings && typeof userRecord.settings === 'object' && !Array.isArray(userRecord.settings))
            ? userRecord.settings
            : {};

          const updatedSettings = {
            ...currentSettings,
            password, // lưu mật khẩu vào settings (dành cho chế độ direct / hybrid)
            passwordUpdatedAt: new Date().toISOString(),
          };

          const { error: updateErr } = await client
            .from('users')
            .update({
              settings: updatedSettings,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userRecord.id);

          if (!updateErr) {
            dbUpdated = true;
          }
        }
      } catch (sbErr: any) {
        console.warn('Lỗi cập nhật mật khẩu vào Supabase:', sbErr?.message);
      }
    }

    // Tiêu thụ mã OTP sau khi đổi mật khẩu thành công
    consumeOtpCode(normalizedEmail);

    return res.status(200).json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể sử dụng mật khẩu mới để đăng nhập.',
      dbUpdated,
    });
  } catch (error: any) {
    console.error('Lỗi API reset-password:', error);
    return res.status(500).json({
      success: false,
      message: 'Đã xảy ra sự cố trên máy chủ khi đặt lại mật khẩu.',
      error: error?.message,
    });
  }
}
