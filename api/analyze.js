export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.length < 10) return res.status(500).json({ error: "API Key 缺失" });

  try {
    const { type, prompt, intel } = req.body;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    let finalPrompt = "";

    // 【新增架构】如果是情报侧写模式
    if (type === "profile") {
        finalPrompt = `你现在是顶尖的心理学和人物侧写专家“罗塞塔”。
        [当前收集到的全部碎片情报汇总]：${intel.join(' | ')}
        
        任务：根据这些长短不一、可能矛盾的情报，进行深度人物侧写。
        请严格按JSON格式返回：
        {
          "tags": ["特征1", "特征2", "潜在心理", "外在表现", "性别(若能推测)"],
          "decoding_rate": 25, 
          "summary": "简短的一句话人物侧写结论（如：一个外表高冷但内心极度缺乏安全感的慢热型人格）"
        }
        
        【解码率(decoding_rate)打分极其严格的规则(0-100)】：
        - 只有性别或模糊的只言片语：0%-10%
        - 有具体的喜好、职业或单次行为：15%-30%
        - 有深度社交表现、朋友圈细节、能看出性格矛盾点：35%-60%
        - 极度详尽的生活切片、价值观展现：70%以上
        请注意：人是复杂矛盾的，情报越多、维度越深，分数才能给高。如果情报很肤浅，务必给低分！不要轻易给出高分！`;
    } 
    // 原有的聊天破译模式
    else {
        finalPrompt = prompt; 
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: finalPrompt }] }] }),
      signal: controller.signal
    });

    clearTimeout(timeout);
    const data = await response.json();
    if (data.error) return res.status(400).json({ error: `Google 报错: ${data.error.message}` });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: "连接超时或内部错误: " + err.message });
  }
}
