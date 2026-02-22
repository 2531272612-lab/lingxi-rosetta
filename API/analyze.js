export default async function handler(req, res) {
  // 解析前端发来的数据
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { prompt } = body;
  
  // 从 Vercel 的系统环境中读取 Key（这样最安全）
  const apiKey = process.env.GEMINI_API_KEY; 

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  res.status(200).json(data);
}
