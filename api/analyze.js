export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "Vercel 中未配置 API Key" });

  try {
    const { prompt } = req.body;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();

    // 如果 Google 返回了错误，直接把错误对象传给前端
    if (data.error) {
      return res.status(400).json({ googleError: data.error.message });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "后端逻辑崩溃: " + err.message });
  }
}
