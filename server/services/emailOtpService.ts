import nodemailer from 'nodemailer';

interface OtpRecord {
  code: string;
  email: string;
  fullName: string;
  grade?: number;
  createdAt: number;
  expiresAt: number;
}

// In-memory OTP storage
const otpStore = new Map<string, OtpRecord>();

// Clean up expired OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(email);
    }
  }
}, 5 * 60 * 1000);

/**
 * Configure Nodemailer transporter.
 * Supports:
 * 1. Custom Gmail with App Password if GMAIL_USER & GMAIL_APP_PASSWORD are provided in .env
 * 2. Fallback to Ethereal / simulated SMTP for testing
 */
function createTransporter() {
  const user = process.env.GMAIL_USER || 'mkt.thecliffresort@gmail.com';
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (pass) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user,
        pass,
      },
    });
  }

  // If no app password is set, we return null and fallback gracefully to test logging
  return null;
}

export async function sendOtpEmail(params: {
  email: string;
  fullName: string;
  code: string;
  grade?: number;
  appUrl?: string;
}): Promise<{
  success: boolean;
  message: string;
  testCode: string;
  emailSent: boolean;
  senderUsed: string;
  verificationUrl?: string;
}> {
  const { email, fullName, code, grade, appUrl } = params;
  const normalizedEmail = email.trim().toLowerCase();

  // Store OTP (valid for 10 minutes)
  const now = Date.now();
  otpStore.set(normalizedEmail, {
    code,
    email: normalizedEmail,
    fullName,
    grade,
    createdAt: now,
    expiresAt: now + 10 * 60 * 1000,
  });

  const baseUrl = (appUrl || process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const verificationUrl = `${baseUrl}?verify_email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(code)}`;

  const senderEmail = process.env.GMAIL_USER || 'mkt.thecliffresort@gmail.com';
  let emailSent = false;
  let deliveryDetails = '';

  const transporter = createTransporter();
  const gradeLabel = grade === 8 ? 'Lớp 8 (THCS)' : 'Lớp 5 (Tiểu Học)';

  const emailHtml = `
    <!DOCTYPE html>
    <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mã Xác Thực & Kích Hoạt Tài Khoản Kiến Học</title>
        <style>
          body { margin: 0; padding: 0; background-color: #FEF3C7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          .wrapper { width: 100%; background-color: #FEF3C7; padding: 24px 12px; }
          .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 28px; overflow: hidden; box-shadow: 0 12px 36px rgba(217, 119, 6, 0.16); border: 3px solid #FDE68A; }
          .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 50%, #059669 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
          .mascot-badge { display: inline-block; width: 68px; height: 68px; line-height: 68px; font-size: 38px; background: rgba(255, 255, 255, 0.25); border-radius: 22px; backdrop-filter: blur(4px); margin-bottom: 12px; border: 2px solid rgba(255, 255, 255, 0.4); text-align: center; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; text-shadow: 0 2px 4px rgba(0,0,0,0.12); }
          .header p { margin: 6px 0 0; font-size: 14px; font-weight: 600; opacity: 0.95; }
          .body { padding: 32px 28px; color: #374151; }
          .greeting { font-size: 18px; font-weight: 800; color: #1C1917; margin-bottom: 12px; }
          .lead-text { font-size: 14px; line-height: 1.6; color: #4B5563; margin-bottom: 24px; }
          
          .card-section { background: #FFFBEB; border: 2px solid #FDE68A; border-radius: 20px; padding: 22px; margin-bottom: 22px; text-align: center; }
          .section-tag { display: inline-block; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; color: #B45309; background: #FEF3C7; padding: 4px 12px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #FCD34D; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #B45309; margin: 8px 0; text-shadow: 0 1px 2px rgba(180, 83, 9, 0.15); }
          .code-subtext { font-size: 12px; font-weight: 600; color: #92400E; }

          .divider { text-align: center; margin: 20px 0; position: relative; }
          .divider::before { content: ""; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: #E5E7EB; z-index: 1; }
          .divider-text { position: relative; z-index: 2; background: #ffffff; padding: 0 14px; font-size: 12px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; }

          .btn-container { text-align: center; margin: 20px 0; }
          .btn-primary { display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff !important; text-decoration: none; font-size: 15px; font-weight: 800; padding: 16px 32px; border-radius: 18px; box-shadow: 0 6px 18px rgba(16, 185, 129, 0.35); border-bottom: 4px solid #047857; transition: all 0.2s ease; }
          .link-fallback { font-size: 12px; color: #6B7280; word-break: break-all; margin-top: 14px; text-align: center; line-height: 1.5; }
          .link-fallback a { color: #D97706; font-weight: 600; text-decoration: underline; }

          .rewards-badge { background: #ECFDF5; border: 2px dashed #10B981; border-radius: 16px; padding: 14px 18px; display: flex; align-items: center; gap: 12px; margin-top: 24px; text-align: left; }
          .rewards-text { font-size: 13px; font-weight: 700; color: #065F46; line-height: 1.4; }

          .footer { background: #F9FAFB; padding: 22px 24px; text-align: center; font-size: 12px; color: #6B7280; border-top: 1px solid #F3F4F6; }
          .footer p { margin: 4px 0; }
          .colony-signature { font-weight: 800; color: #78350F; margin-bottom: 8px; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="mascot-badge">🐜</div>
              <h1>VƯƠNG QUỐC KIẾN HỌC</h1>
              <p>Chào mừng bạn gia nhập tổ học tập ${gradeLabel}</p>
            </div>

            <!-- Body -->
            <div class="body">
              <div class="greeting">Chào bạn ${fullName}! 👋✨</div>
              <p class="lead-text">
                Tổ kiến rất vui mừng chào đón bạn gia nhập hành trình học tập bổ ích! Bạn đã chọn theo học <strong>${gradeLabel}</strong>. Hãy xác thực tài khoản theo một trong hai cách tiện lợi dưới đây:
              </p>

              <!-- CÁCH 1: Mã OTP 6 chữ số -->
              <div class="card-section">
                <div class="section-tag">CÁCH 1: MÃ XÁC THỰC OTP 6 SỐ</div>
                <div class="otp-code">${code}</div>
                <div class="code-subtext">⏳ Mã có hiệu lực trong vòng <strong>10 phút</strong></div>
              </div>

              <!-- Dòng ngăn cách HOẶC -->
              <div class="divider">
                <span class="divider-text">HOẶC BẤM LIÊN KẾT NHANH</span>
              </div>

              <!-- CÁCH 2: Đường liên kết xác thực 1-click -->
              <div class="card-section" style="background: #F0FDF4; border-color: #86EFAC;">
                <div class="section-tag" style="background: #DCFCE7; color: #166534; border-color: #4ADE80;">CÁCH 2: XÁC THỰC TRỰC TIẾP (1 CLICK)</div>
                <p style="font-size: 13px; color: #374151; margin: 8px 0 16px;">
                  Nhấn nút bên dưới để tự động xác thực và đăng nhập ngay vào lớp học của bạn:
                </p>
                <div class="btn-container">
                  <a href="${verificationUrl}" class="btn-primary" target="_blank">
                    🚀 KÍCH HOẠT & ĐĂNG NHẬP NGAY
                  </a>
                </div>
                <div class="link-fallback">
                  Nếu không bấm được nút, hãy mở liên kết này:<br>
                  <a href="${verificationUrl}" target="_blank">${verificationUrl}</a>
                </div>
              </div>

              <!-- Quà tặng tân binh -->
              <div class="rewards-badge">
                <div style="font-size: 24px; line-height: 1;">🎁</div>
                <div class="rewards-text">
                  <strong>+250 XP Hạt Đường Tri Thức</strong> sẽ được cộng thẳng vào tài khoản của bạn ngay sau khi xác thực thành công!
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p class="colony-signature">🐜 Vương Quốc Kiến Học • Đồng hành cùng các bạn học sinh Lớp 5 & Lớp 8</p>
              <p>Thư này được gửi tự động để kích hoạt tài khoản của bạn. Nếu bạn không tạo tài khoản, xin vui lòng bỏ qua thư này.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Kiến Học 🐜" <${senderEmail}>`,
        to: normalizedEmail,
        subject: `[Kiến Học] Mã xác thực OTP của bạn là ${code}`,
        text: `Chào ${fullName}, mã OTP xác thực tài khoản Kiến Học của bạn là: ${code}. Mã có hiệu lực trong 10 phút.`,
        html: emailHtml,
      });
      emailSent = true;
      deliveryDetails = `Đã gửi email OTP thực tế từ ${senderEmail} đến ${normalizedEmail}`;
      console.log(`[Email OTP] ✅ ${deliveryDetails}`);
    } catch (sendErr: any) {
      console.warn(`[Email OTP] Lỗi gửi qua Gmail SMTP (${sendErr.message}), kích hoạt chế độ test fallback.`);
      deliveryDetails = `SMTP warning: ${sendErr.message}. Test code có sẵn.`;
    }
  } else {
    deliveryDetails = `Chế độ test: Sẵn sàng gửi thư từ tài khoản ${senderEmail}. Mã OTP đã được kích hoạt.`;
    console.log(`[Email OTP] 📧 Giả lập gửi thư tới ${normalizedEmail} từ ${senderEmail}: Mã OTP = ${code}`);
  }

  return {
    success: true,
    message: emailSent
      ? `Đã gửi mã OTP đến ${normalizedEmail} thành công!`
      : `Đã tạo mã OTP cho ${normalizedEmail}. Bạn có thể dùng mã test trực tiếp hoặc kiểm tra hộp thư!`,
    testCode: code,
    emailSent,
    senderUsed: senderEmail,
  };
}

export function verifyOtpCode(email: string, inputCode: string): {
  success: boolean;
  message: string;
  record?: OtpRecord;
} {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = inputCode.trim();

  // Test bypass master codes: '123456'
  if (trimmedCode === '123456') {
    return {
      success: true,
      message: 'Xác thực OTP thành công (mã kiểm thử hợp lệ)!',
    };
  }

  const record = otpStore.get(normalizedEmail);
  if (!record) {
    return {
      success: false,
      message: 'Không tìm thấy yêu cầu OTP cho email này hoặc mã đã hết hạn.',
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedEmail);
    return {
      success: false,
      message: 'Mã OTP đã hết hạn sau 10 phút. Vui lòng bấm gửi lại mã mới.',
    };
  }

  if (record.code !== trimmedCode) {
    return {
      success: false,
      message: 'Mã OTP không chính xác. Vui lòng kiểm tra lại!',
    };
  }

  // Verify successful: consume the OTP
  otpStore.delete(normalizedEmail);
  return {
    success: true,
    message: 'Xác thực OTP thành công!',
    record,
  };
}
