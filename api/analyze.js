export default async function handler(req, res) {
  // 增加对 GET 请求的友好提示
  if (req.method !== 'POST') {
    return res.status(200).json({ message: "罗塞塔引擎大脑已就绪，请从首页点击按钮开始分析。" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  
  try {
    // 兼容不同的数据格式
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { prompt } = body || {};

    if (!prompt) {
      return res.status(400).json({ error: "未接收到有效的情报数据" });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: "引擎内部逻辑错误: " + error.message });
  }
}
