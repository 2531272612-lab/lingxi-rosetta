export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ error: "环境变量中没有找到有效的 API Key，请检查 Vercel 设置并 Redeploy。" });
  }

  try {
    const { prompt } = req.body;
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // 【关键修复点】：将 URL 中的引擎名称升级为最新的 gemini-2.0-flash
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: `Google 报错: ${data.error.message}` });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "连接超时或后端崩溃: " + err.message });
  }
}
