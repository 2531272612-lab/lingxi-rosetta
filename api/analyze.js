export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.length < 10) {
    return res.status(500).json({ error: "环境变量中没有找到有效的 API Key" });
  }

  try {
    const { type, prompt, intel } = req.body;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let finalPrompt = "";

    // 模式一：【战争迷雾侧写引擎】
    if (type === "profile") {
        finalPrompt = `你现在是顶尖的临床心理学家和FBI行为侧写师。
        [情报档案]：${intel.join(' | ')}
        
        任务：基于情报进行多维深度侧写。
        请严格按JSON格式返回：
        {
          "tags": ["核心标签1", "防御机制", "依恋倾向"],
          "decoding_rate": 20, 
          "summary": "专业临床视角的简练人物定性",
          "radar": {
            "开放与接受度": 80,
            "情绪稳定性": null,
            "心理防御机制": null,
            "人际依恋类型": null,
            "核心社交动机": null
          }
        }
        【极度严格的迷雾规则】：radar中的5个维度，分值为0-100。但是！如果没有明确的情报证据支撑某个维度，绝对不许瞎猜！必须严格返回 null（代表该区域处于战争迷雾中）。`;
    } 
    // 模式二：【金刚菩萨破译引擎】
    else {
        finalPrompt = prompt; 
    }

    // 换回对免费账号最宽容的 2.5-flash-lite 引擎！
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    
    // 把错误信息原封不动传给前端
    if (data.error) {
      return res.status(400).json({ error: data.error.message });
    }
    
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "连接超时或内部错误: " + err.message });
  }
}
