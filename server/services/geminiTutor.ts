export interface SocraticTutorInput {
  studentGrade: 5 | 8;
  subject: string;
  currentTopic: string;
  questionContext: string;
  studentInput: string;
  attemptCount: number;
  aiConfig?: {
    endpoint?: string;
    apiKey?: string;
    model?: string;
  };
}

export interface SocraticTutorOutput {
  guidanceLevel: 1 | 2 | 3;
  responseMessage: string;
  followUpQuestion: string;
  misconceptionDetected?: string;
  isLocalFallback?: boolean;
  modelUsed?: string;
}

/**
 * Intelligent rule-based fallback when Gemini API key is not present or API call fails.
 */
function generateLocalFallback(input: SocraticTutorInput): SocraticTutorOutput {
  const isGrade5 = input.studentGrade === 5;
  const attempts = Math.max(1, input.attemptCount || 1);
  const text = (input.studentInput || "").toLowerCase();

  const guidanceLevel: 1 | 2 | 3 = attempts <= 1 ? 1 : attempts === 2 ? 2 : 3;

  let misconceptionDetected = "";
  if (isGrade5) {
    if (text.includes("cộng") && (text.includes("tử") || text.includes("mẫu"))) {
      misconceptionDetected = "Lưu ý không cộng trực tiếp tử số với mẫu số, hai thành phần này mang ý nghĩa kích thước phần và số lượng phần khác nhau.";
    }
  } else {
    if (text.includes("nhỏ") && text.includes("lún") && !text.includes("không lún")) {
      misconceptionDetected = "Hiểu lầm diện tích: Diện tích tiếp xúc nhỏ khiến áp suất p = F/S tăng vọt, làm vật bị lún sâu hơn chứ không phải đỡ lún.";
    }
  }

  if (isGrade5) {
    if (guidanceLevel === 1) {
      return {
        guidanceLevel: 1,
        responseMessage: "Chú Kiến chào bạn nhỏ! Chú thấy con đang suy nghĩ rất tập trung nè. Hãy tưởng tượng chiếc bánh sinh nhật tròn xoe đang nằm trên đĩa nhé!",
        followUpQuestion: "Con thử nhìn xem chiếc bánh này được cắt thành mấy miếng bằng nhau tất cả?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    } else if (guidanceLevel === 2) {
      return {
        guidanceLevel: 2,
        responseMessage: "Ví dụ gần gũi nha: Nếu mẹ chia chiếc bánh pizza thành 4 miếng bằng nhau, con ăn 2 miếng, thì số bánh con ăn có bằng đúng một nửa chiếc bánh không nào?",
        followUpQuestion: "Vậy phân số 2/4 và 1/2 có đang chỉ cùng một lượng bánh như nhau không ta?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    } else {
      return {
        guidanceLevel: 3,
        responseMessage: "Bí kíp của Chú Kiến đây: Khi chia bánh, mẫu số cho biết 'tổng số miếng cắt ra', còn tử số là 'số miếng con lấy'. Nếu con chia nhỏ gấp đôi (cắt từ 2 miếng thành 4 miếng) thì con cũng phải lấy gấp đôi số miếng để lượng bánh không đổi!",
        followUpQuestion: "Nếu bây giờ cắt chiếc bánh làm 8 phần bằng nhau, con cần lấy mấy phần để được đúng một nửa chiếc bánh?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    }
  } else {
    if (guidanceLevel === 1) {
      return {
        guidanceLevel: 1,
        responseMessage: "Cố vấn Kiến ghi nhận câu hỏi của bạn! Trong bài toán cơ học này, hãy chú ý đến sự tương tác giữa trọng lực tác dụng và bề mặt nâng đỡ.",
        followUpQuestion: "Yếu tố nào quyết định một vật nặng bị lún sâu hay nổi trên mặt cát mềm: chỉ riêng khối lượng hay là lực phân bố trên diện tích tiếp xúc?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    } else if (guidanceLevel === 2) {
      return {
        guidanceLevel: 2,
        responseMessage: "Hình dung thực tế nhé: Tại sao máy cày đi qua ruộng bùn lầy miền Tây hay xe địa hình chạy trên đồi cát Mũi Né đều phải trang bị bộ lốp bản siêu rộng và rãnh sâu?",
        followUpQuestion: "Dựa vào công thức áp suất p = F / S, khi diện tích tiếp xúc S tăng lên thì áp suất p đè lên từng hạt cát biến đổi như thế nào?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    } else {
      return {
        guidanceLevel: 3,
        responseMessage: "Phân tích kỹ thuật từ Cố vấn Kiến: Trọng lượng F của toàn bộ xe và người là không đổi (~600 N). Cát lún có giới hạn chịu tải nhất định. Muốn áp suất p < giới hạn chịu tải của cát, ta bắt buộc phải tối đại hóa diện tích tiếp xúc S bằng cách dùng lốp bản rộng 100mm.",
        followUpQuestion: "Sau khi diện tích S đạt 320 cm², áp suất giảm xuống bao nhiêu kPa so với ngưỡng lún 150 kPa của cát?",
        misconceptionDetected,
        isLocalFallback: true,
        modelUsed: "local-fallback",
      };
    }
  }
}

/**
 * Trích xuất text JSON từ phản hồi Gemini kể cả khi có thẻ markdown ```json ```
 */
function cleanAndParseJson(rawText: string): any {
  let cleaned = rawText.trim();
  // Loại bỏ code block markdown nếu có
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (match && match[1]) {
    cleaned = match[1].trim();
  }
  return JSON.parse(cleaned);
}

/**
 * Gửi yêu cầu sinh nội dung Socratic Tutor tới API Gemini (hỗ trợ cả Antigravity proxy & Google Gemini trực tiếp)
 */
export async function getSocraticTutorGuidance(input: SocraticTutorInput): Promise<SocraticTutorOutput> {
  const { studentGrade, subject, currentTopic, questionContext, studentInput, attemptCount, aiConfig } = input;
  const isGrade5 = studentGrade === 5;
  const attempts = Math.max(1, attemptCount || 1);

  // Xác định cấu hình: Ưu tiên aiConfig từ request -> Environment variables -> Giá trị mặc định
  const endpoint = (aiConfig?.endpoint || process.env.AI_API_ENDPOINT || "https://antigravity.thecliff.io.vn").replace(/\/$/, "");
  const apiKey = (aiConfig?.apiKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "sk-123456@").trim();
  const primaryModel = (aiConfig?.model || process.env.AI_MODEL || "gemini-3-flash").trim();

  const personaInstruction = isGrade5
    ? `Bạn là "Chú Kiến Thông Thái" (Ant Tutor) - người bạn gia sư Socratic đồng hành cùng học sinh Lớp 5 (10-11 tuổi) theo chương trình GDPT 2018.
- Tính cách: Nhiệt tình, ấm áp, vui nhộn, dùng ngôn ngữ trẻ thơ gần gũi, xưng "Chú Kiến" hoặc "Kiến" và gọi học sinh là "con" hoặc "bạn nhỏ".
- Nguyên tắc Socratic: KHÔNG BAO GIỜ đưa ra đáp án trực tiếp ở lần thử 1 hoặc 2 (attemptCount <= 2). Hãy dẫn dắt học sinh bằng các câu hỏi gợi mở.
- Liên hệ đời sống Việt Nam: Bắt buộc dùng hình ảnh đồ ăn (bánh chưng, bánh trung thu, pizza, chè, đĩa xôi, múi cam), trò chơi dân gian hoặc sân chơi (bập bênh, đu quay, xếp hình).`
    : `Bạn là "Cố vấn Kiến" (Ant Scientific Co-pilot) - chuyên gia hướng dẫn khoa học thực nghiệm theo chuẩn GDPT 2018 cho học sinh Lớp 8 (13-14 tuổi).
- Tính cách: Hiện đại, truyền cảm hứng, chính xác về mặt học thuật và thuật ngữ khoa học (lực ma sát, áp suất p = F/S, diện tích tiếp xúc, quán tính, lực đẩy...).
- Nguyên tắc Socratic: KHÔNG BAO GIỜ đưa ra đáp án trực tiếp ở lần thử 1 hoặc 2 (attemptCount <= 2). Định hướng học sinh phân tích các đại lượng vật lí và quy luật tự nhiên.
- Liên hệ đời sống & kỹ thuật Việt Nam: Bắt buộc dùng hình ảnh kỹ thuật thực tế (xe máy cày lốp rộng lội ruộng lầy miền Tây, xe địa hình đồi cát Mũi Né - Bình Thuận, ván trượt cát, máy nâng thủy lực, đập thủy điện Sơn La, lốp xe đạp thể thao).`;

  const prompt = `
${personaInstruction}

THÔNG TIN BỐI CẢNH BÀI HỌC:
- Cấp lớp: Lớp ${studentGrade}
- Môn học: ${subject}
- Chủ đề bài học: ${currentTopic}
- Bối cảnh câu hỏi / thử thách hiện tại: ${questionContext || "Khám phá bản chất bài học"}
- Số lần thử / hỏi hiện tại của học sinh (attemptCount): ${attempts}
- Lời nói / Câu hỏi / Hành động của học sinh:
"${studentInput || "Gợi ý cho con với Chú Kiến ơi!"}"

CÁC QUY TẮC CỐT LÕI (STRICT SOCRATIC RULES):
1. guidanceLevel:
   - Nếu attemptCount <= 1: guidanceLevel = 1 (Nudge/Question). Chỉ hướng sự chú ý của học sinh vào dữ kiện quan sát, hỏi gợi mở nhẹ nhàng, TUYỆT ĐỐI KHÔNG hé lộ đáp án cuối.
   - Nếu attemptCount == 2: guidanceLevel = 2 (Analogy/Hint). Đưa ra ví dụ ẩn dụ thực tế đời sống thật trực quan (Grade 5: món ăn/đồ chơi; Grade 8: kỹ thuật/xe cộ/hiện tượng), TUYỆT ĐỐI KHÔNG đưa ra đáp án cuối.
   - Nếu attemptCount >= 3: guidanceLevel = 3 (Detailed Explanation). Giải thích rõ bản chất các bước tư duy, nhưng vẫn kết thúc bằng một câu hỏi để học sinh tự tay hoàn thành bước cuối.
2. responseMessage: Lời phản hồi cô đọng, súc tích (khoảng 2-3 câu), đúng giọng điệu lứa tuổi, giàu hình ảnh thực tế Việt Nam.
3. followUpQuestion: Bắt buộc là 1 câu hỏi tư duy sắc bén, khơi gợi học sinh tự suy nghĩ thay vì chỉ đọc câu trả lời.
4. misconceptionDetected: Nếu học sinh có dấu hiệu ngộ nhận hoặc hiểu sai bản chất khái niệm, hãy chỉ rõ hiểu lầm đó bằng 1 câu ngắn gọn. Nếu không có hiểu lầm, để chuỗi rỗng "".

Trả về kết quả duy nhất ở định dạng JSON với cấu trúc:
{
  "guidanceLevel": 1,
  "responseMessage": "...",
  "followUpQuestion": "...",
  "misconceptionDetected": ""
}
`;

  // Danh sách model thử nghiệm (bắt đầu bằng model người dùng chỉ định)
  const modelsToTry = Array.from(new Set([
    primaryModel,
    "gemini-3-flash",
    "gemini-3.7-flash",
    "gemini-2.5-flash",
    "gemini-2.5-flash-thinking",
    "gemini-3.1-flash-lite",
  ]));

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const url = `${endpoint}/v1beta/models/${model}:generateContent`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.7,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API HTTP ${response.status}: ${errorText}`);
      }

      const resData = (await response.json()) as any;
      const candidate = resData.candidates?.[0];
      if (!candidate) {
        throw new Error("Không có ứng viên phản hồi từ Gemini API");
      }

      // Lấy part không phải thought hoặc part cuối cùng
      const parts = candidate.content?.parts || [];
      const textPart = parts.slice().reverse().find((p: any) => !p.thought && p.text) || parts[parts.length - 1];
      const rawText = textPart?.text || "";

      const parsed = cleanAndParseJson(rawText);

      // Ràng buộc guidanceLevel theo số lần hỏi
      let level = Number(parsed.guidanceLevel) || (attempts <= 1 ? 1 : attempts === 2 ? 2 : 3);
      if (attempts <= 1) level = 1;
      else if (attempts === 2) level = 2;

      return {
        guidanceLevel: level as 1 | 2 | 3,
        responseMessage: parsed.responseMessage || "Chú Kiến đang lắng nghe con nè!",
        followUpQuestion: parsed.followUpQuestion || "Con nghĩ bước tiếp theo mình nên làm gì?",
        misconceptionDetected: parsed.misconceptionDetected || undefined,
        isLocalFallback: false,
        modelUsed: model,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Tutor] Model "${model}" tại ${endpoint} gặp lỗi (${err?.message}), chuyển sang model dự phòng tiếp theo...`);
    }
  }

  console.warn("[Gemini Tutor] Tất cả model trực tuyến gặp sự cố, kích hoạt Intelligent Local Fallback:", lastError?.message || lastError);
  return generateLocalFallback(input);
}
