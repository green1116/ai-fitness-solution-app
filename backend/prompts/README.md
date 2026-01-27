# GPT 报告生成服务

## 概述

本目录包含用于生成 AI 判断报告的 Prompt 模板和相关工具函数。

## 文件说明

- **`report-generation.md`** - Prompt 模板和使用说明
- **`gpt-service.js`** - GPT API 调用和解析工具

## 使用方法

### 方式 1：手动使用（ChatGPT Web）

1. 打开 `report-generation.md`
2. 复制系统 Prompt 和用户 Prompt 模板
3. 将用户的 10 个问题答案转换为 JSON，替换 `{answers}` 占位符
4. 在 ChatGPT 中输入完整的 Prompt
5. 复制模型输出并手动解析为报告结构

### 方式 2：程序化调用（OpenAI API）

```javascript
const { generateReportWithOpenAI } = require('./gpt-service');

const answers = {
  q1: "我现在最真实想解决的问题是什么？",
  q2: "这件事成功对你意味着什么？",
  // ... 其他问题
};

const apiKey = process.env.OPENAI_API_KEY;
const report = await generateReportWithOpenAI(answers, apiKey);

console.log(report);
// {
//   summary: "...",
//   dims: [...],
//   risks: [...],
//   ...
// }
```

### 方式 3：自定义 LLM 提供商

```javascript
const { generateReport } = require('./gpt-service');

// 定义你自己的 LLM 调用函数
async function myLLMCall(prompt) {
  // 调用你的 LLM API
  const response = await fetch('https://your-llm-api.com', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });
  const data = await response.json();
  return data.text;
}

const answers = { /* ... */ };
const report = await generateReport(answers, myLLMCall);
```

## 集成到 Express 后端

在 `backend/app.js` 中的 `/api/submissions/:id/generate` 路由中：

```javascript
const { generateReportWithOpenAI } = require('./prompts/gpt-service');

app.post('/api/submissions/:id/generate', async (req, res) => {
  // ... 获取 submission 数据
  
  // 解析 answers
  const answers = JSON.parse(row.answers || '{}');
  
  // 调用 GPT 生成报告
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const report = await generateReportWithOpenAI(answers, apiKey);
    
    // 使用 report 数据生成 HTML/PDF
    // ...
  } catch (err) {
    // 错误处理
  }
});
```

## 环境变量

在 `.env` 文件中添加：

```env
OPENAI_API_KEY=sk-...
```

## 报告结构

生成的报告包含以下字段：

- **summary** (string) - 最终判断结论（一句话）
- **dims** (string[]) - 判断依据（最多 3 条）
- **risks** (string[]) - 最大风险拆解（最多 3 条）
- **ignoredVars** (string[]) - 被忽略但很重要的变量（最多 3 条）
- **lightPaths** (string[]) - 更轻量的验证路径（1-3 条）
- **actions** (string[]) - 下一步建议（1-3 条）

## 注意事项

1. **API 费用**：每次调用都会产生费用，建议在生产环境中添加缓存机制
2. **响应时间**：GPT API 调用可能需要几秒钟，考虑添加超时和重试机制
3. **错误处理**：API 可能失败，需要做好错误处理和降级方案
4. **隐私安全**：确保 API Key 安全存储，不要提交到代码仓库

## 替代方案

如果不想使用 OpenAI API，可以考虑：

- **Claude API** (Anthropic)
- **通义千问 API** (阿里云)
- **文心一言 API** (百度)
- **本地部署的 LLM** (如 Llama, ChatGLM)

只需修改 `gpt-service.js` 中的 `generateReportWithOpenAI` 函数或创建新的调用函数即可。

