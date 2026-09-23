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

  const startTime = Date.now();
  try {
    const { endpoint: rawEndpoint, apiKey: rawKey, model: rawModel } = req.body || {};

    const endpoint = (rawEndpoint || process.env.AI_API_ENDPOINT || 'https://antigravity.thecliff.io.vn').replace(/\/$/, '');
    const apiKey = (rawKey || process.env.AI_API_KEY || process.env.GEMINI_API_KEY || 'sk-123456@').trim();
    const model = (rawModel || process.env.AI_MODEL || 'gemini-3-flash').trim();

    const url = `${endpoint}/v1beta/models/${model}:generateContent`;

    const aiRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Xin chào! Hãy phản hồi ngắn gọn trong 1 câu: "Kết nối Kiến Học AI thành công!" kèm thời gian hiện tại.',
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
        message: `Endpoint phản hồi HTTP ${aiRes.status}: ${errText.slice(0, 200)}`,
      });
    }

    const data = (await aiRes.json()) as any;
    const parts = data.candidates?.[0]?.content?.parts || [];
    const textPart = parts.slice().reverse().find((p: any) => !p.thought && p.text) || parts[0];
    const replyText = textPart?.text || 'Đã nhận phản hồi thành công từ model.';

    return res.status(200).json({
      success: true,
      latencyMs,
      endpoint,
      model,
      reply: replyText.trim(),
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
}
