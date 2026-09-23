import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const rawUser = process.env.GMAIL_USER || '';
  const rawPass = process.env.GMAIL_APP_PASSWORD || '';
  const sanitizedPass = rawPass.replace(/[\s"'-]/g, '').trim();

  const rawSupabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const rawSupabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  // Clean URL: strip /rest/v1, /rest, trailing slashes, quotes using URL parser
  let supabaseUrl = rawSupabaseUrl.trim().replace(/^["']|["']$/g, '');
  if (supabaseUrl) {
    try {
      const parsed = new URL(supabaseUrl);
      supabaseUrl = `${parsed.protocol}//${parsed.host}`;
    } catch {
      supabaseUrl = supabaseUrl
        .replace(/\/+$/, '')
        .replace(/\/rest\/v1\/?$/i, '')
        .replace(/\/rest\/?$/i, '')
        .replace(/\/+$/, '');
    }
  }
  const supabaseKey = rawSupabaseKey.trim().replace(/^["']|["']$/g, '');
  const hadDoubledRestPath = rawSupabaseUrl.includes('/rest/v1') || rawSupabaseUrl.includes('/rest');

  const isVercel = Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
  const now = new Date().toISOString();

  // Test SMTP verification
  let smtpStatus: 'NOT_CONFIGURED' | 'CONNECTED' | 'ERROR' = 'NOT_CONFIGURED';
  let smtpMessage = 'Chưa cấu hình GMAIL_APP_PASSWORD';
  let smtpErrorDetails: any = null;

  let transporter: any = null;

  if (sanitizedPass) {
    try {
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: rawUser || 'mkt.thecliffresort@gmail.com',
          pass: sanitizedPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      });

      await transporter.verify();
      smtpStatus = 'CONNECTED';
      smtpMessage = '✅ Kết nối SMTP Gmail (smtp.gmail.com:465) THÀNH CÔNG!';
    } catch (err: any) {
      smtpStatus = 'ERROR';
      smtpMessage = `❌ Lỗi xác thực Gmail SMTP: ${err.message}`;
      smtpErrorDetails = {
        code: err.code,
        command: err.command,
        response: err.response,
        responseCode: err.responseCode,
      };
    }
  }

  // Handle action to send test email
  if (req.method === 'POST') {
    const { action, targetEmail } = req.body || {};
    if (action === 'send_test_email') {
      if (!transporter || smtpStatus !== 'CONNECTED') {
        return res.status(400).json({
          success: false,
          message: 'Không thể gửi thử: Kết nối SMTP chưa thành công. ' + smtpMessage,
          smtpErrorDetails,
        });
      }

      const recipient = targetEmail || rawUser || 'mkt.thecliffresort@gmail.com';
      try {
        const info = await transporter.sendMail({
          from: `"Kiến Học Diagnostic 🐜" <${rawUser || 'mkt.thecliffresort@gmail.com'}>`,
          to: recipient,
          subject: `[Kiến Học Production Test] Kiểm tra hệ thống lúc ${new Date().toLocaleTimeString('vi-VN')}`,
          text: `Chúc mừng! Hệ thống gửi email tự động của Vương Quốc Kiến Học đang hoạt động bình thường trên Production. Thời gian kiểm tra: ${now}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #FEF3C7; border-radius: 12px; border: 2px solid #FDE68A;">
              <h2 style="color: #B45309; margin-top: 0;">🐜 Kiểm tra gửi email Production Thành Công!</h2>
              <p>Email này được gửi trực tiếp từ máy chủ Vercel Serverless Function.</p>
              <ul>
                <li><strong>Thời gian:</strong> ${now}</li>
                <li><strong>Người gửi:</strong> ${rawUser}</li>
                <li><strong>Người nhận:</strong> ${recipient}</li>
                <li><strong>Cổng kết nối:</strong> smtp.gmail.com:465 (SSL)</li>
              </ul>
              <p style="color: #065F46; font-weight: bold;">Hệ thống xác thực OTP của bạn đã sẵn sàng phục vụ học sinh!</p>
            </div>
          `,
        });

        return res.status(200).json({
          success: true,
          message: `Đã gửi thành công email kiểm tra đến ${recipient}! Vui lòng kiểm tra hộp thư.`,
          messageId: info.messageId,
          response: info.response,
        });
      } catch (sendErr: any) {
        return res.status(500).json({
          success: false,
          message: `Thất bại khi gửi email test: ${sendErr.message}`,
          error: sendErr,
        });
      }
    }
  }

  // Ping Supabase
  let supabaseStatus: 'NOT_CONFIGURED' | 'CONNECTED' | 'ERROR' = 'NOT_CONFIGURED';
  let supabaseMessage = 'Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trên Vercel';
  if (supabaseUrl && supabaseKey) {
    try {
      const pingUrl = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/users?select=id&limit=1`;
      const pingRes = await fetch(pingUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (pingRes.ok) {
        supabaseStatus = 'CONNECTED';
        supabaseMessage = '✅ Kết nối Supabase REST API thành công!';
      } else {
        supabaseStatus = 'ERROR';
        supabaseMessage = `Supabase phản hồi mã HTTP ${pingRes.status}: ${pingRes.statusText}`;
      }
    } catch (sbErr: any) {
      supabaseStatus = 'ERROR';
      supabaseMessage = `Không thể kết nối tới Supabase: ${sbErr.message}`;
    }
  }

  // Diagnostic Checklist
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!rawPass) {
    issues.push('Thiếu biến môi trường GMAIL_APP_PASSWORD trên Vercel.');
    suggestions.push('Vào Vercel Project Settings -> Environment Variables, thêm GMAIL_APP_PASSWORD.');
  } else if (rawPass.includes(' ')) {
    suggestions.push('GMAIL_APP_PASSWORD đang chứa khoảng trắng; hệ thống đã tự động lọc sạch.');
  }

  if (!supabaseUrl || !supabaseKey) {
    issues.push('Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY trên Vercel.');
    suggestions.push('Cần thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào Vercel để ứng dụng có thể lưu tài khoản vào bảng public.users.');
  } else if (hadDoubledRestPath) {
    suggestions.push('Lưu ý: Biến VITE_SUPABASE_URL trên Vercel của bạn có chứa đuôi /rest/v1. Hệ thống đã tự động lọc sạch để tránh lỗi 404, bạn nên cập nhật lại trên Vercel chỉ lấy Project URL gốc (https://<project-ref>.supabase.co).');
  }

  return res.status(200).json({
    status: issues.length === 0 ? 'HEALTHY' : 'WARNING',
    timestamp: now,
    runtime: isVercel ? 'Vercel Serverless' : 'Local / Custom Node Container',
    diagnostics: {
      smtp: {
        configured: Boolean(rawPass),
        user: rawUser ? `${rawUser.slice(0, 3)}***@${rawUser.split('@')[1] || 'gmail.com'}` : 'Chưa thiết lập',
        passwordLength: rawPass ? rawPass.length : 0,
        sanitizedLength: sanitizedPass ? sanitizedPass.length : 0,
        status: smtpStatus,
        message: smtpMessage,
        details: smtpErrorDetails,
      },
      supabase: {
        configured: Boolean(supabaseUrl && supabaseKey),
        url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, '').split('.')[0] + '...' : 'Chưa thiết lập',
        keyLength: supabaseKey ? supabaseKey.length : 0,
        status: supabaseStatus,
        message: supabaseMessage,
      },
    },
    issues,
    suggestions,
  });
}
