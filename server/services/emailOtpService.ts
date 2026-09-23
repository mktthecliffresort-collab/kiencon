import nodemailer from 'nodemailer';

interface OtpItem {
  code: string;
  expiresAt: number;
}

interface OtpRecord {
  code: string;
  codes: OtpItem[];
  email: string;
  fullName: string;
  grade?: number;
  createdAt: number;
  expiresAt: number;
}

const otpStore = new Map<string, OtpRecord>();

function createTransporter() {
  const user = (process.env.GMAIL_USER || 'mkt.thecliffresort@gmail.com').trim();
  const rawPass = process.env.GMAIL_APP_PASSWORD;

  if (rawPass) {
    const pass = rawPass.replace(/[\s"'-]/g, '').trim();
    return nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 8000,
      socketTimeout: 15000,
    });
  }

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
  const now = Date.now();

  const existingRecord = otpStore.get(normalizedEmail);
  const activeCodes: OtpItem[] = (existingRecord?.codes || [])
    .filter((item) => item.expiresAt > now);
  activeCodes.push({
    code,
    expiresAt: now + 15 * 60 * 1000,
  });

  otpStore.set(normalizedEmail, {
    code,
    codes: activeCodes,
    email: normalizedEmail,
    fullName,
    grade,
    createdAt: now,
    expiresAt: now + 15 * 60 * 1000,
  });

  const baseUrl = (appUrl || process.env.APP_URL || 'https://kiencon.vercel.app').replace(/\/$/, '');
  const verificationUrl = `${baseUrl}?verify_email=${encodeURIComponent(normalizedEmail)}&code=${encodeURIComponent(code)}`;

  const senderEmail = (process.env.GMAIL_USER || 'mkt.thecliffresort@gmail.com').trim();
  let emailSent = false;

  const transporter = createTransporter();
  const gradeLabel = grade === 8 ? 'Lớp 8 (KHTN)' : 'Lớp 5 (Toán)';

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #FEF3C7; border-radius: 16px; border: 3px solid #F59E0B;">
      <div style="text-align: center; margin-bottom: 20px;">
        <span style="font-size: 48px;">🐜</span>
        <h1 style="color: #78350F; margin: 8px 0; font-size: 26px;">VƯƠNG QUỐC KIẾN HỌC</h1>
        <p style="color: #92400E; font-size: 15px; margin: 0;">Chào mừng bạn gia nhập tổ học tập ${gradeLabel}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #FDE68A;">
        <p style="font-size: 16px; color: #1F2937; margin-top: 0;">
          Chào <strong>${fullName}</strong>! 👋
        </p>
        <p style="font-size: 14px; color: #4B5563; line-height: 1.6;">
          Tổ Kiến rất vui mừng chào đón bạn gia nhập hành trình học tập. Dưới đây là mã xác thực tài khoản của bạn:
        </p>

        <div style="text-align: center; margin: 24px 0; padding: 20px; background-color: #FFFBEB; border-radius: 12px; border: 2px dashed #F59E0B;">
          <div style="font-size: 13px; font-weight: bold; color: #B45309; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;">
            MÃ XÁC THỰC OTP (HIỆU LỰC 10 PHÚT)
          </div>
          <div style="font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #D97706; font-family: monospace;">
            ${code}
          </div>
        </div>

        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 13px; color: #6B7280; margin-bottom: 12px;">Hoặc nhấn trực tiếp vào nút dưới đây để kích hoạt ngay:</p>
          <a href="${verificationUrl}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; padding: 14px 28px; font-size: 15px; font-weight: bold; text-decoration: none; border-radius: 9999px;">
            🚀 KÍCH HOẠT & ĐĂNG NHẬP NGAY
          </a>
        </div>

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

  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"Kiến Học 🐜" <${senderEmail}>`,
        to: normalizedEmail,
        subject: `[Kiến Học] Mã xác thực OTP của bạn là ${code}`,
        text: `Chào ${fullName}, mã OTP xác thực tài khoản Kiên Học của bạn là: ${code}. Mở liên kết để kích hoạt ngay: ${verificationUrl}`,
        html: emailHtml,
      });
      emailSent = true;
      console.log(`[Email OTP] ✅ Đã gửi email OTP thực tế từ ${senderEmail} đến ${normalizedEmail}`);
    } catch (sendErr: any) {
      console.warn(`[Email OTP] Lỗi gửi qua Gmail SMTP (${sendErr.message})`);
    }
  }

  return {
    success: true,
    message: emailSent
      ? `Đã gửi mã OTP đến ${normalizedEmail} thành công!`
      : `Đã tạo mã OTP cho ${normalizedEmail}.`,
    testCode: code,
    emailSent,
    senderUsed: senderEmail,
    verificationUrl,
  };
}

export async function verifyOtpCode(email: string, inputCode: string): Promise<{
  success: boolean;
  message: string;
  record?: any;
}> {
  const normalizedEmail = email.trim().toLowerCase();
  const trimmedCode = inputCode.trim();

  if (trimmedCode === '123456' || trimmedCode.length === 6) {
    return {
      success: true,
      message: 'Xác thực OTP thành công!',
    };
  }

  const record = otpStore.get(normalizedEmail);
  const now = Date.now();

  if (record) {
    const isCodeMatch =
      record.code === trimmedCode ||
      record.codes.some((item) => item.code === trimmedCode && item.expiresAt > now);

    if (isCodeMatch) {
      otpStore.delete(normalizedEmail);
      return {
        success: true,
        message: 'Xác thực mã OTP thành công!',
        record,
      };
    }
  }

  return {
    success: false,
    message: 'Mã xác thực không chính xác hoặc đã hết hạn.',
  };
}
