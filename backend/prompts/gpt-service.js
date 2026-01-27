// GPT 报告生成服务
// 用于调用 OpenAI API 或其他 LLM 生成判断报告

const SYSTEM_PROMPT = `你是资深商业咨询师 + 产品经理，擅长把用户提供的背景信息转为"结构化判断报告"。输出遵循固定格式：结论（Yes/No/Conditional）、判断依据（3条）、风险拆解（3条）、被忽略但重要的变量（最多3条）、可替代的低成本验证路径（1-3条）、1-3 条可执行建议（不要写代码实现细节）。语言专业但通俗，尽量短句，使用项目符号。`;

function buildUserPrompt(answers) {
  return `以下是用户提交的答案（JSON）：
${JSON.stringify(answers, null, 2)}

请基于这些信息，生成一份判断报告，严格遵循以下结构并用中文输出：

1) 最终判断结论（一句话）  
2) 判断依据（每条一句话，最多3条）  
3) 最大风险拆解（列出最多3个风险，每个风险说明为何发生及后果）  
4) 被忽略但很重要的变量（最多3条）  
5) 更轻量的验证路径（给出 1-3 个可在 2 周内完成的低成本验证方案）  
6) 下一步 1-3 条建议（不要写执行脚本或代码，保持判断者视角）

注意：结论部分要明确（"推荐继续/不推荐/在满足 X 条件下继续"）。保持格式清晰，便于直接复制到 PDF 报告模板。`;
}

/**
 * 解析 GPT 输出的文本，提取报告结构
 * @param {string} text - GPT 返回的文本
 * @returns {Object} 结构化的报告数据
 */
function parseGPTResponse(text) {
  const result = {
    summary: '',
    dims: [],
    risks: [],
    ignoredVars: [],
    lightPaths: [],
    actions: []
  };

  // 提取最终判断结论
  const summaryMatch = text.match(/1[)）]\s*最终判断结论[：:]\s*([^\n]+)/);
  if (summaryMatch) {
    result.summary = summaryMatch[1].trim();
  }

  // 提取判断依据
  const dimsMatch = text.match(/2[)）]\s*判断依据[：:]([\s\S]*?)(?=3[)）]|$)/);
  if (dimsMatch) {
    const dimsText = dimsMatch[1];
    result.dims = dimsText
      .split(/[•·\-*]\s*/)
      .map(d => d.trim())
      .filter(d => d.length > 0)
      .slice(0, 3);
  }

  // 提取最大风险拆解
  const risksMatch = text.match(/3[)）]\s*最大风险拆解[：:]([\s\S]*?)(?=4[)）]|$)/);
  if (risksMatch) {
    const risksText = risksMatch[1];
    result.risks = risksText
      .split(/[•·\-*]\s*/)
      .map(r => r.trim())
      .filter(r => r.length > 0)
      .slice(0, 3);
  }

  // 提取被忽略但很重要的变量
  const ignoredMatch = text.match(/4[)）]\s*被忽略但很重要的变量[：:]([\s\S]*?)(?=5[)）]|$)/);
  if (ignoredMatch) {
    const ignoredText = ignoredMatch[1];
    result.ignoredVars = ignoredText
      .split(/[•·\-*]\s*/)
      .map(v => v.trim())
      .filter(v => v.length > 0)
      .slice(0, 3);
  }

  // 提取更轻量的验证路径
  const pathsMatch = text.match(/5[)）]\s*更轻量的验证路径[：:]([\s\S]*?)(?=6[)）]|$)/);
  if (pathsMatch) {
    const pathsText = pathsMatch[1];
    result.lightPaths = pathsText
      .split(/[•·\-*]\s*/)
      .map(p => p.trim())
      .filter(p => p.length > 0)
      .slice(0, 3);
  }

  // 提取下一步建议
  const actionsMatch = text.match(/6[)）]\s*下一步[^：:]*[：:]([\s\S]*?)$/);
  if (actionsMatch) {
    const actionsText = actionsMatch[1];
    result.actions = actionsText
      .split(/[•·\-*]\s*/)
      .map(a => a.trim())
      .filter(a => a.length > 0)
      .slice(0, 3);
  }

  return result;
}

/**
 * 调用 OpenAI API 生成报告
 * @param {Object} answers - 用户答案对象
 * @param {string} apiKey - OpenAI API Key
 * @returns {Promise<Object>} 结构化的报告数据
 */
async function generateReportWithOpenAI(answers, apiKey) {
  const fetch = require('node-fetch'); // 需要安装 node-fetch 或使用内置 fetch（Node 18+）

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4', // 或 'gpt-3.5-turbo'
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(answers) }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
  }

  const text = data.choices[0].message.content;
  return parseGPTResponse(text);
}

/**
 * 生成报告（通用函数，可适配不同的 LLM 提供商）
 * @param {Object} answers - 用户答案对象
 * @param {Function} llmCall - LLM 调用函数 (answers) => Promise<string>
 * @returns {Promise<Object>} 结构化的报告数据
 */
async function generateReport(answers, llmCall) {
  const prompt = buildUserPrompt(answers);
  const text = await llmCall(prompt);
  return parseGPTResponse(text);
}

module.exports = {
  SYSTEM_PROMPT,
  buildUserPrompt,
  parseGPTResponse,
  generateReportWithOpenAI,
  generateReport
};

