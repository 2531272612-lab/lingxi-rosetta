export default async function handler(req, res) {
  // 1. 检查保险柜里有没有钥匙
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ error: "环境变量中没有找到有效的 API Key，请检查 Vercel 设置并 Redeploy。" });
  }

  try {
    // 2. 接收你的前端网页发过来的情报
    const { prompt } = req.body;
    
    // 设置一个 10 秒倒计时，防止网络卡住一直转圈
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    // 3. 【核心变更】呼叫对免费账号最友好的轻量级引擎：gemini-1.5-flash-8b
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    
    // 4. 解析 Google 的回信
    const data = await response.json();

    // 5. 如果 Google 依然有意见，把原话告诉屏幕
    if (data.error) {
      return res.status(400).json({ error: `Google 报错: ${data.error.message}` });
    }

    // 6. 成功！把推演结果原封不动传给你的 iPad
    return res.status(200).json(data);
    
  } catch (err) {
    return res.status(500).json({ error: "连接超时或后端内部错误: " + err.message });
  }
}
