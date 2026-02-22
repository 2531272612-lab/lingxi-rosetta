export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  // 1. 检查 Key 是否成功注入
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ error: "环境变量中没有找到有效的 API Key，请检查 Vercel 设置并 Redeploy。" });
  }

  try {
    const { prompt } = req.body;
    
    // 2. 呼叫 Google，并设置 10 秒超时防止卡死
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    // 3. 如果 Google 返回了错误信息（如 Key 无效）
    if (data.error) {
      return res.status(400).json({ error: `Google 报错: ${data.error.message}` });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "连接超时或后端崩溃: " + err.message });
  }
}
