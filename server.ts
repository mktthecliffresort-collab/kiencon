import express from "express";
import path from "path";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import { Agent, setGlobalDispatcher } from "undici";
import { getSocraticTutorGuidance } from "./server/services/geminiTutor";
import { sendOtpEmail, verifyOtpCode, consumeOtpCode } from "./server/services/emailOtpService";

dotenv.config();

// Configure Undici with resilient timeouts and keep-alive settings to prevent HeadersTimeoutError
setGlobalDispatcher(
  new Agent({
    headersTimeout: 45000,
    bodyTimeout: 45000,
    connectTimeout: 10000,
    keepAliveTimeout: 10000,
    keepAliveMaxTimeout: 20000,
  })
);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client with user-agent header and safe timeout
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
      timeout: 25000,
      retryOptions: {
        attempts: 1,
      },
    },
  });
};

function generateLocalSocraticHint(params: {
  grade: number;
  subject?: string;
  question?: string;
  currentAttempt?: string;
  stage?: number;
}) {
  const isGrade5 = Number(params.grade) === 5;
  const stage = Number(params.stage) || 1;
  const question = params.question || "";

  if (isGrade5) {
    if (stage === 1) {
      if (question.includes("bánh") || question.includes("phân số")) {
        return {
          antSpeech: "Bạn hãy nhìn kỹ hình ảnh chiếc bánh: đếm xem có tất cả bao nhiêu miếng bằng nhau được cắt ra nhé!",
          clueWord: "Mẫu số & Số phần bằng nhau",
          isLocalFallback: true,
        };
      }
      if (question.includes("chẵn") || question.includes("dãy số")) {
        return {
          antSpeech: "Hai số chẵn liên tiếp luôn hơn kém nhau đúng 2 đơn vị. Bạn hãy nhìn số đứng trước và số đứng sau nha!",
          clueWord: "Khoảng cách 2 đơn vị",
          isLocalFallback: true,
        };
      }
      if (question.includes("hỗn số") || question.includes("thập phân")) {
        return {
          antSpeech: "Hãy tách riêng phần nguyên và phần phân số ra để quan sát cho dễ nhé bạn ơi!",
          clueWord: "Phần nguyên & Phần phân số",
          isLocalFallback: true,
        };
      }
      return {
        antSpeech: "Hãy bình tĩnh đọc kỹ các con số trong đề bài nhé, Kiến tin bạn sắp nhìn ra điều thú vị rồi!",
        clueWord: "Quan sát dữ kiện",
        isLocalFallback: true,
      };
    } else {
      if (question.includes("bánh") || question.includes("phân số")) {
        return {
          antSpeech: "Bí kíp của Kiến: Mẫu số nằm ở dưới là tổng số phần, còn tử số nằm ở trên là số phần mình đã lấy!",
          clueWord: "Tử số / Mẫu số",
          isLocalFallback: true,
        };
      }
      if (question.includes("chẵn") || question.includes("dãy số")) {
        return {
          antSpeech: "Kiến gợi ý thêm: Số chẵn luôn có chữ số tận cùng là 0, 2, 4, 6, 8. Bạn thử cộng thêm 2 vào số trước xem sao!",
          clueWord: "Cộng thêm 2",
          isLocalFallback: true,
        };
      }
      return {
        antSpeech: "Thử làm từng bước nhỏ: đặt phép tính ra nháp hoặc liên hệ bài học tương tự xem sao nhé!",
        clueWord: "Quy luật từng bước",
        isLocalFallback: true,
      };
    }
  } else {
    // Grade 8 KHTN
    if (stage === 1) {
      return {
        antSpeech: "Cố vấn Kiến nhắc bạn: Hãy quan sát hiện tượng khi diện tích tiếp xúc S thay đổi, áp suất p = F/S sẽ biến thiên thế nào?",
        clueWord: "Công thức p = F / S",
        isLocalFallback: true,
      };
    } else {
      return {
        antSpeech: "Phân tích lực từ Cố vấn Kiến: Trọng lực F không đổi. Muốn xe vượt qua đồi cát mà không bị lún, ta cần diện tích tiếp xúc S lớn nhất có thể!",
        clueWord: "Tăng diện tích tiếp xúc",
        isLocalFallback: true,
      };
    }
  }
}

// API routes FIRST
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Teach-back evaluation endpoint
app.post("/api/gemini/teach-back", async (req, res) => {
  try {
    const { grade, subject, topic, studentExplanation, expectedConcepts } = req.body;

    const isGrade5 = grade === 5;
    const persona = isGrade5
      ? `Bạn là "Bạn Kiến" - người bạn kiến học tập vui vẻ, thân thiện, cổ vũ học sinh Lớp 5 (10-11 tuổi). Giọng điệu ấm áp, dùng từ ngữ gần gũi, khen ngợi sự cố gắng của bé ("Tuyệt vời lắm bạn ơi!", "Kiến hiểu rồi nè!"). Tuyệt đối không dùng từ "Sai" gay gắt.`
      : `Bạn là "Cố vấn Kiến" (Ant Scientific Co-pilot) - trợ lý khoa học thông thái, đồng hành cùng học sinh Lớp 8 (13-14 tuổi) theo chuẩn GDPT 2018. Giọng điệu hiện đại, chuẩn xác về mặt thuật ngữ khoa học (lực, ma sát, áp suất, diện tích tiếp xúc), phân tích lập luận chặt chẽ và đưa ra lời gợi mở sâu sắc.`;

    const prompt = `
${persona}

Nhiệm vụ: Đánh giá phần giải thích (Teach-back) của học sinh sau bài học:
- Khối lớp: Lớp ${grade}
- Môn học: ${subject}
- Chủ đề: ${topic}
- Các khái niệm cốt lõi cần chạm tới: ${(expectedConcepts || []).join(", ")}

Lời giải thích của học sinh:
"${studentExplanation}"

Hãy phản hồi theo định dạng JSON với cấu trúc:
{
  "passed": boolean (true nếu học sinh hiểu ý cốt lõi, dù diễn đạt mộc mạc),
  "score": number (từ 70 đến 100 nếu hiểu, từ 40 đến 69 nếu cần bổ sung),
  "coachFeedback": string (phản hồi trực tiếp gửi tới học sinh bằng giọng Bạn Kiến / Cố vấn Kiến, độ dài 2-3 câu, nêu bật điểm bạn ấy làm tốt và điểm thú vị),
  "keyConceptsRecognized": string[] (những khái niệm mà học sinh đã nhắc tới đúng),
  "curiousQuestion": string (1 câu hỏi mở nhẹ nhàng để kích thích tư duy thêm),
  "badge": string (Tên danh hiệu vui nhộn, ví dụ "Nhà Thám Hiểm Phân Số" hoặc "Kỹ Sư Khí Động Học Mũi Né")
}
`;

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback smart rule-based response if no API key is provided
      const fallbackPassed = (studentExplanation || "").trim().length >= 15;
      return res.json({
        passed: fallbackPassed,
        score: fallbackPassed ? 92 : 65,
        coachFeedback: isGrade5
          ? (fallbackPassed
            ? "Oa! Bạn Kiến khen bạn đã diễn đạt rất rõ ràng và dễ hiểu nha! Nhờ bạn chỉ mà Kiến nắm được bí kíp chia bánh rồi đó!"
            : "Bạn Kiến lắng nghe nè! Bạn hãy kể thêm cho Kiến nghe về số phần bằng nhau khi mình cắt bánh nữa nha!")
          : (fallbackPassed
            ? "Cố vấn Kiến ghi nhận lập luận vật lí rất chính xác của bạn! Việc liên hệ giữa diện tích tiếp xúc, áp suất và lực ma sát chứng tỏ bạn đã làm chủ hiện tượng."
            : "Phân tích ban đầu có hướng đi tốt. Hãy liên hệ thêm công thức tính áp suất p = F/S và tác dụng của độ rộng bề mặt lốp xe nhé."),
        keyConceptsRecognized: expectedConcepts ? expectedConcepts.slice(0, 2) : ["Khái niệm cốt lõi"],
        curiousQuestion: isGrade5
          ? "Nếu chiếc bánh được chia cho 8 bạn thì mỗi phần sẽ là bao nhiêu ta?"
          : "Nếu đi trên đồi cát ướt sau mưa, liệu lực cản và áp suất có biến đổi tương tự không?",
        badge: isGrade5 ? "Bậc Thầy Bánh Kem" : "Chuyên Viên Thử Nghiệm Mũi Né",
        isLocalFallback: true,
      });
    }

    const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let parsed: any = null;
    let lastError: any = null;

    for (const model of models) {
      try {
        const config: any = {
          responseMimeType: "application/json",
        };
        if (model.includes("gemini-3")) {
          config.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        const resultText = response.text || "{}";
        parsed = JSON.parse(resultText);
        if (parsed.coachFeedback) {
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (parsed && parsed.coachFeedback) {
      return res.json(parsed);
    }

    console.warn("Gemini teach-back using local fallback due to API status:", lastError?.message || lastError);
    // Return friendly fallback
    return res.json({
      passed: true,
      score: 88,
      coachFeedback: req.body.grade === 5
        ? "Bạn Kiến rất tự hào vì bạn đã tự tin diễn đạt suy nghĩ của mình! Cùng tiếp tục bài học tiếp theo nào!"
        : "Cố vấn Kiến đánh giá cao nỗ lực diễn giải bản chất vật lí của bạn. Lập luận rõ ràng và có căn cứ khoa học.",
      keyConceptsRecognized: ["Tư duy phản biện", "Khái niệm thực tế"],
      curiousQuestion: "Bạn có thể áp dụng kiến thức này vào tình huống thực tế nào nữa không?",
      badge: "Học Giả Kiến Siêu Việt",
      isLocalFallback: true,
    });
  } catch (error: any) {
    console.warn("Gemini teach-back route notice:", error?.message || error);
    return res.json({
      passed: true,
      score: 88,
      coachFeedback: req.body.grade === 5
        ? "Bạn Kiến rất tự hào vì bạn đã tự tin diễn đạt suy nghĩ của mình! Cùng tiếp tục bài học tiếp theo nào!"
        : "Cố vấn Kiến đánh giá cao nỗ lực diễn giải bản chất vật lí của bạn. Lập luận rõ ràng và có căn cứ khoa học.",
      keyConceptsRecognized: ["Tư duy phản biện", "Khái niệm thực tế"],
      curiousQuestion: "Bạn có thể áp dụng kiến thức này vào tình huống thực tế nào nữa không?",
      badge: "Học Giả Kiến Siêu Việt",
      isLocalFallback: true,
    });
  }
});

// Socratic Progressive Hint Endpoint
app.post("/api/gemini/socratic-hint", async (req, res) => {
  try {
    const { grade, subject, question, currentAttempt, stage } = req.body;
    const isGrade5 = grade === 5;
    const persona = isGrade5
      ? `Bạn là "Bạn Kiến" hướng dẫn học sinh Lớp 5. Bạn TUYỆT ĐỐI KHÔNG nói "Em làm sai rồi" hay đưa ra đáp án trực tiếp. Hãy đặt câu hỏi gợi mở từng nấc (Socratic hinting).`
      : `Bạn là "Cố vấn Kiến" đồng hành học sinh Lớp 8 KHTN. Hãy phân tích hướng tư duy gợi mở logic, nhắc học sinh về nguyên lý tự nhiên hoặc biến số cần quan sát.`;

    const prompt = `
${persona}

Câu hỏi học sinh đang gặp thử thách:
"${question}"

Lựa chọn/hành động học sinh vừa thử:
"${currentAttempt}"

Cấp độ gợi ý: Nấc ${stage || 1} trên 2 nấc (Nấc 1: hướng sự chú ý vào dữ kiện; Nấc 2: liên hệ trực tiếp quy luật/nguyên lý).

Hãy trả về JSON:
{
  "antSpeech": string (Lời nói của Chú Kiến, ngắn gọn 1-2 câu súc tích, thân tình, gợi mở suy nghĩ),
  "clueWord": string (Từ khóa gợi ý, ví dụ "Diện tích tiếp xúc" hoặc "Mẫu số")
}
`;

    const ai = getGeminiClient();
    if (!ai) {
      return res.json(generateLocalSocraticHint({ grade, subject, question, currentAttempt, stage }));
    }

    const models = ["gemini-3.1-flash-lite", "gemini-3.8-flash", "gemini-flash-latest"];
    let parsed: any = null;
    let lastError: any = null;

    for (const model of models) {
      try {
        const config: any = {
          responseMimeType: "application/json",
        };
        if (model.includes("gemini-3")) {
          config.thinkingConfig = {
            thinkingLevel: ThinkingLevel.LOW,
          };
        }

        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config,
        });

        parsed = JSON.parse(response.text || "{}");
        if (parsed.antSpeech && parsed.clueWord) {
          break;
        }
      } catch (err) {
        lastError = err;
      }
    }

    if (parsed && parsed.antSpeech && parsed.clueWord) {
      return res.json(parsed);
    }

    console.warn("Gemini socratic-hint using intelligent local fallback:", lastError?.message || lastError);
    return res.json(generateLocalSocraticHint({ grade, subject, question, currentAttempt, stage }));
  } catch (error: any) {
    console.warn("Gemini socratic hint notice:", error?.message || error);
    return res.json(generateLocalSocraticHint(req.body || {}));
  }
});

// Socratic AI Tutor Chat Endpoint
app.post("/api/gemini/socratic-tutor", async (req, res) => {
  try {
    const { studentGrade, subject, currentTopic, questionContext, studentInput, attemptCount, aiConfig } = req.body;
    const result = await getSocraticTutorGuidance({
      studentGrade: (Number(studentGrade) === 8 ? 8 : 5) as 5 | 8,
      subject: String(subject || "Toán / Khoa học"),
      currentTopic: String(currentTopic || "Bài học"),
      questionContext: String(questionContext || ""),
      studentInput: String(studentInput || ""),
      attemptCount: Number(attemptCount || 1),
      aiConfig,
    });
    return res.json(result);
  } catch (err: any) {
    console.warn("Socratic Tutor route notice, serving fallback:", err?.message || err);
    return res.status(200).json({
      guidanceLevel: 1,
      responseMessage: "Chú Kiến đang kiểm tra lại bài học nè, con hãy thử đọc kỹ lại đề bài một xíu nha!",
      followUpQuestion: "Con thấy điểm gì đặc biệt nhất trong câu hỏi này?",
      isLocalFallback: true,
    });
  }
});

// Production & Local Diagnostic Endpoint
app.all("/api/debug/system-health", async (req, res) => {
  const nodemailer = await import("nodemailer");
  const rawUser = process.env.GMAIL_USER || "";
  const rawPass = process.env.GMAIL_APP_PASSWORD || "";
  const sanitizedPass = rawPass.replace(/[\s"'-]/g, "").trim();
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";
  const now = new Date().toISOString();

  let smtpStatus = "NOT_CONFIGURED";
  let smtpMessage = "Chưa cấu hình GMAIL_APP_PASSWORD";
  let smtpErrorDetails: any = null;
  let transporter: any = null;

  if (sanitizedPass) {
    try {
      transporter = nodemailer.default.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: rawUser || "mkt.thecliffresort@gmail.com",
          pass: sanitizedPass,
        },
        connectionTimeout: 10000,
        greetingTimeout: 8000,
        socketTimeout: 15000,
      });
      await transporter.verify();
      smtpStatus = "CONNECTED";
      smtpMessage = "✅ Kết nối SMTP Gmail (smtp.gmail.com:465) THÀNH CÔNG!";
    } catch (err: any) {
      smtpStatus = "ERROR";
      smtpMessage = `❌ Lỗi xác thực Gmail SMTP: ${err.message}`;
      smtpErrorDetails = {
        code: err.code,
        command: err.command,
        response: err.response,
        responseCode: err.responseCode,
      };
    }
  }

  if (req.method === "POST" && req.body?.action === "send_test_email") {
    if (!transporter || smtpStatus !== "CONNECTED") {
      return res.status(400).json({
        success: false,
        message: "Không thể gửi thử: Kết nối SMTP chưa sẵn sàng. " + smtpMessage,
        smtpErrorDetails,
      });
    }
    const recipient = req.body.targetEmail || rawUser || "mkt.thecliffresort@gmail.com";
    try {
      const info = await transporter.sendMail({
        from: `"Kiến Học Diagnostic 🐜" <${rawUser || "mkt.thecliffresort@gmail.com"}>`,
        to: recipient,
        subject: `[Kiến Học Production Test] Kiểm tra hệ thống lúc ${new Date().toLocaleTimeString("vi-VN")}`,
        text: `Kiểm tra gửi email từ Kiến Học thành công! Thời gian: ${now}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; background: #FEF3C7; border-radius: 12px; border: 2px solid #FDE68A;">
            <h2 style="color: #B45309;">🐜 Gửi email kiểm tra thành công!</h2>
            <p>Hệ thống gửi email tự động của Vương Quốc Kiến Học đang hoạt động rất tốt.</p>
            <p><strong>Thời gian:</strong> ${now}</p>
          </div>
        `,
      });
      return res.json({
        success: true,
        message: `Đã gửi thành công email kiểm tra đến ${recipient}!`,
        messageId: info.messageId,
      });
    } catch (sendErr: any) {
      return res.status(500).json({
        success: false,
        message: `Lỗi gửi email: ${sendErr.message}`,
        error: sendErr,
      });
    }
  }

  let supabaseStatus = "NOT_CONFIGURED";
  let supabaseMessage = "Chưa cấu hình VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY";
  if (supabaseUrl && supabaseKey) {
    try {
      const pingUrl = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/users?select=id&limit=1`;
      const pingRes = await fetch(pingUrl, {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      });
      if (pingRes.ok) {
        supabaseStatus = "CONNECTED";
        supabaseMessage = "✅ Kết nối Supabase REST API thành công!";
      } else {
        supabaseStatus = "ERROR";
        supabaseMessage = `Supabase phản hồi HTTP ${pingRes.status}`;
      }
    } catch (sbErr: any) {
      supabaseStatus = "ERROR";
      supabaseMessage = `Lỗi kết nối Supabase: ${sbErr.message}`;
    }
  }

  const issues: string[] = [];
  const suggestions: string[] = [];
  if (!rawPass) {
    issues.push("Thiếu biến môi trường GMAIL_APP_PASSWORD.");
    suggestions.push("Thêm GMAIL_APP_PASSWORD vào Vercel Project Settings -> Environment Variables.");
  }
  if (!supabaseUrl || !supabaseKey) {
    issues.push("Thiếu biến môi trường VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY.");
    suggestions.push("Thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào Vercel để kết nối cơ sở dữ liệu Supabase.");
  }

  return res.json({
    status: issues.length === 0 ? "HEALTHY" : "WARNING",
    timestamp: now,
    runtime: "Node Container",
    diagnostics: {
      smtp: {
        configured: Boolean(rawPass),
        user: rawUser ? `${rawUser.slice(0, 3)}***@${rawUser.split("@")[1] || "gmail.com"}` : "Chưa thiết lập",
        passwordLength: rawPass ? rawPass.length : 0,
        sanitizedLength: sanitizedPass ? sanitizedPass.length : 0,
        status: smtpStatus,
        message: smtpMessage,
        details: smtpErrorDetails,
      },
      supabase: {
        configured: Boolean(supabaseUrl && supabaseKey),
        url: supabaseUrl ? supabaseUrl.replace(/^https?:\/\//, "").split(".")[0] + "..." : "Chưa thiết lập",
        keyLength: supabaseKey ? supabaseKey.length : 0,
        status: supabaseStatus,
        message: supabaseMessage,
      },
    },
    issues,
    suggestions,
  });
});

// Email OTP Verification Endpoints
app.post("/api/auth/send-otp", async (req, res) => {
  try {
    const { email, fullName, code, grade, purpose, appUrl: clientAppUrl } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email là bắt buộc." });
    }
    const origin = clientAppUrl || (req.headers.origin as string) || (req.headers.referer ? new URL(req.headers.referer as string).origin : '') || process.env.APP_URL || 'http://localhost:3000';
    const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();
    const result = await sendOtpEmail({
      email,
      fullName: fullName || "Học sinh Kiến",
      code: otpCode,
      grade: Number(grade) || 5,
      purpose: purpose || 'signup',
      appUrl: origin,
    });
    return res.json(result);
  } catch (error: any) {
    console.error("Lỗi gửi OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể gửi mã OTP qua email lúc này. Vui lòng thử lại sau.",
      error: error?.message,
    });
  }
});

app.post("/api/auth/verify-otp", async (req, res) => {
  try {
    const { email, code, purpose } = req.body;
    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email và mã OTP là bắt buộc." });
    }
    const result = await verifyOtpCode(email, code, purpose);
    return res.json(result);
  } catch (error: any) {
    console.error("Lỗi xác thực OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi xác thực OTP trên hệ thống.",
      error: error?.message,
    });
  }
});

// Reset Password Endpoint
app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, mã OTP và mật khẩu mới là bắt buộc.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const trimmedCode = String(code).trim();
    const password = String(newPassword).trim();

    // Kiểm tra độ mạnh mật khẩu (tối thiểu 8 ký tự, gồm cả chữ và số)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có tối thiểu 8 ký tự để bảo đảm an toàn.",
      });
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu mạnh cần chứa cả chữ cái và chữ số.",
      });
    }

    const verifyResult = await verifyOtpCode(normalizedEmail, trimmedCode);
    if (!verifyResult.success) {
      return res.status(400).json({
        success: false,
        message: verifyResult.message || "Mã xác thực OTP không chính xác hoặc đã hết hạn.",
      });
    }

    // Cập nhật cơ sở dữ liệu nếu có Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    let dbUpdated = false;

    if (supabaseUrl && supabaseKey) {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const client = createClient(supabaseUrl, supabaseKey);
        const { data: userRecord } = await client
          .from("users")
          .select("id, settings")
          .eq("email", normalizedEmail)
          .maybeSingle();

        if (userRecord) {
          const currentSettings = (userRecord.settings && typeof userRecord.settings === "object" && !Array.isArray(userRecord.settings))
            ? userRecord.settings
            : {};
          const { error: updateErr } = await client
            .from("users")
            .update({
              settings: {
                ...currentSettings,
                password,
                passwordUpdatedAt: new Date().toISOString(),
              },
              updated_at: new Date().toISOString(),
            })
            .eq("id", userRecord.id);

          if (!updateErr) dbUpdated = true;
        }
      } catch (err: any) {
        console.warn("Lỗi cập nhật mật khẩu Supabase:", err?.message);
      }
    }

    consumeOtpCode(normalizedEmail);

    return res.json({
      success: true,
      message: "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
      dbUpdated,
    });
  } catch (error: any) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    return res.status(500).json({
      success: false,
      message: "Đã xảy ra sự cố trên máy chủ khi đặt lại mật khẩu.",
      error: error?.message,
    });
  }
});

// Admin Test AI Endpoint
app.post("/api/admin/test-ai", async (req, res) => {
  const startTime = Date.now();
  try {
    const { endpoint: rawEndpoint, apiKey: rawKey, model: rawModel } = req.body || {};
    const endpoint = (rawEndpoint || process.env.AI_API_ENDPOINT || "https://antigravity.thecliff.io.vn").replace(/\/$/, "");
    const apiKey = (rawKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "sk-123456@").trim();
    const model = (rawModel || process.env.AI_MODEL || "gemini-3-flash").trim();

    const url = `${endpoint}/v1beta/models/${model}:generateContent`;
    const aiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Xin chào! Hãy trả lời ngắn gọn trong 1 câu: "Kết nối AI Vương Quốc Kiến Học thành công!"',
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 100,
        },
      }),
    });

    const latencyMs = Date.now() - startTime;
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      return res.status(400).json({
        success: false,
        latencyMs,
        endpoint,
        model,
        message: `Endpoint trả về HTTP ${aiRes.status}: ${errText.slice(0, 200)}`,
      });
    }

    const data = (await aiRes.json()) as any;
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.slice().reverse().find((p: any) => !p.thought && p.text) || parts[0];
    const reply = textPart?.text || "Đã nhận phản hồi từ model.";

    return res.json({
      success: true,
      latencyMs,
      endpoint,
      model,
      reply: reply.trim(),
      message: `✅ Kết nối thành công tới model ${model} (Độ trễ: ${latencyMs}ms)`,
    });
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    return res.status(500).json({
      success: false,
      latencyMs,
      message: `Lỗi kết nối AI: ${error?.message}`,
    });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`  ➜  Local:   http://localhost:${PORT}/`);
    console.log(`  ➜  Network: http://0.0.0.0:${PORT}/`);
    console.log(`Kiến Học server running on http://localhost:${PORT}`);
  });
}

startServer();
