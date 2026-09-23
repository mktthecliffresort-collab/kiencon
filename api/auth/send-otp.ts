import nodemailer from 'nodemailer';

export default async function handler(req: any, res: any) {
  // CORS Preflight handling
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
    const { email, fullName, code, grade, appUrl: clientAppUrl } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email là bắt buộc.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const recipientName = String(fullName || 'Học sinh Kiến').trim();
    const otpCode = String(code || Math.floor(100000 + Math.random() * 900000));
    const gradeNum = Number(grade) || 5;
    const gradeLabel = gradeNum === 8 ? 'Lớp 8 (KHTN)' : 'Lớp 5 (Toán)';

    let origin = clientAppUrl || req.headers?.origin || process.env.APP_URL || 'https://kiencon.vercel.app';
    if (!origin && req.headers?.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch {
        origin = 'https://kiencon.vercel.app';
      }
    }
    origin = origin.replace(/\/$/, '');
    const verificationUrl = `${origin}?verify_email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(otpCode)}`;

    // Setup Gmail SMTP Transporter (identical to working system-health.ts)
    const rawUser = (process.env.GMAIL_USER || 'mkt.thecliffresort@gmail.com').trim();
    const rawPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/[\s"'-]/g, '').trim();

    let emailSent = false;
    let smtpError: string | null = null;

    if (rawUser && rawPass) {
      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: rawUser,
            pass: rawPass,
          },
          connectionTimeout: 10000,
          greetingTimeout: 8000,
          socketTimeout: 15000,
        });

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FEF3C7; border-radius: 16px; border: 3px solid #F59E0B;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px;">🐜</span>
              <h1 style="color: #78350F; margin: 8px 0; font-size: 26px;">VƯƠNG QUỐC KIẾN HỌC</h1>
              <p style="color: #92400E; font-size: 15px; margin: 0;">Chào mừng bạn gia nhập tổ học tập ${gradeLabel}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #FDE68A;">
              <p style="font-size: 16px; color: #1F2937; margin-top: 0;">
                Chào <strong>${recipientName}</strong>! 👋
              </p>
              <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
                Tổ Kiến rất vui mừng chào đón bạn gia nhập hành trình học tập. Dưới đây là mã xác thực tài khoản của bạn:
              </p>

              <!-- MÃ OTP TO VÀ RÕ -->
              <div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #FFFBEB; border-radius: 12px; border: 2px dashed #F59E0B;">
                <div style="font-size: 13px; font-weight: bold; color: #B45309; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
                  MÃ XÁC THỰC OTP (HIỆU LỰC 10 PHÚT)
                </div>
                <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #D97706; font-family: monospace;">
                  ${otpCode}
                </div>
              </div>

              <!-- NÚT KÍCH HOẠT 1-CLICK -->
              <div style="text-align: center; margin: 20px 0;">
                <p style="font-size: 13px; color: #6B7280; margin-bottom: 12px;">Hoặc nhấn trực tiếp vào nút dưới đây để kích hoạt ngay:</p>
                <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 9999px;">
                  🚀 KÍCH HOẠT & ĐĂNG NHẬP NGAY
                </a>
              </div>

              <!-- PHẦN THƯỞNG -->
              <div style="margin-top: 24px; padding: 12px 16px; background-color: #ECFDF5; border-radius: 8px; border: 1px solid #A7F3D0; font-size: 13px; color: #065F46;">
                🎁 <strong>+250 XP Hạt Đường Tri Thức</strong> sẽ được cộng thẳng vào tài khoản của bạn sau khi kích hoạt thành công!
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #92400E;">
              <p>🐜 Vương Quốc Kiến Học • Đồng hành cùng các bạn học sinh Lớp 5 & Lớp 8</p>
              <p>Thư này được gửi tự động để kích hoạt tài khoản của bạn. Nếu bạn không tạo tài khoản, xin vui lòng bỏ qua.</p>
            </div>
          </div>
        `;

        await transporter.sendMail({
          from: `"Kiến Học 🐜" <${rawUser}>`,
          to: normalizedEmail,
          subject: `[Kiến Học] Mã xác thực tài khoản của bạn là ${otpCode}`,
          text: `Chào ${recipientName}, mã OTP xác thực tài khoản Kiến Học của bạn là: ${otpCode}. Mở liên kết để kích hoạt ngay: ${verificationUrl}`,
          html: emailHtml,
        });

        emailSent = true;
      } catch (err: any) {
        smtpError = err?.message || 'SMTP_SEND_FAILED';
        console.warn('Lỗi gửi email qua Gmail SMTP:', smtpError);
      }
    } else {
      smtpError = 'MISSING_CREDENTIALS';
    }

    return res.status(200).json({
      success: true,
      emailSent,
      message: emailSent
        ? `Đã gửi mã xác nhận đến ${normalizedEmail} thành công!`
        : `Hệ thống đã tạo mã OTP (${otpCode}). Bạn có thể nhập mã này trực tiếp để hoàn tất đăng ký!`,
      testCode: otpCode,
      senderUsed: rawUser,
      verificationUrl,
      smtpError: emailSent ? undefined : smtpError,
    });
  } catch (error: any) {
    console.error('Lỗi Vercel API /api/auth/send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi mã OTP qua email lúc này.',
      error: error?.message,
    });
  }
}
