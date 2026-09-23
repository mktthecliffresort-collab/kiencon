import { sendOtpEmail } from '../_lib/emailOtpService';

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

    let origin = clientAppUrl || req.headers?.origin || process.env.APP_URL || 'https://kiencon.vercel.app';
    if (!origin && req.headers?.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch {
        origin = 'https://kiencon.vercel.app';
      }
    }

    const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();

    const result = await sendOtpEmail({
      email,
      fullName: fullName || 'Học sinh Kiến',
      code: otpCode,
      grade: Number(grade) || 5,
      appUrl: origin,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Lỗi Vercel API /api/auth/send-otp:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể gửi mã OTP qua email lúc này.',
      error: error?.message,
    });
  }
}
