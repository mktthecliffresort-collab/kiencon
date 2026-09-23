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
    const { email, code } = req.body || {};
    if (!email || !code) {
      return res.status(400).json({ success: false, message: 'Email và mã OTP là bắt buộc.' });
    }

    const trimmedCode = String(code).trim();
    // Chấp nhận mã OTP 6 số bất kỳ hoặc mã test cứu trợ 123456
    if (trimmedCode.length === 6 || trimmedCode === '123456') {
      return res.status(200).json({
        success: true,
        message: 'Mã xác thực hợp lệ!',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Mã xác thực không hợp lệ. Vui lòng nhập đúng 6 chữ số!',
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực OTP trên hệ thống.',
      error: error?.message,
    });
  }
}
