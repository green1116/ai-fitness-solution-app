# LLM Prompt 集成文档

## 概述

Next.js API (`/app/api/plan/route.ts`) 会向 Java LLM API 发送包含 JSON schema 要求的完整 prompt，确保 LLM 输出标准的 plan.json 格式。

## 请求格式

Next.js API 会发送以下格式的请求到 Java API：

```json
{
  "companySize": "150",
  "area": "200",
  "scenario": "企业办公楼",
  "goal": "提升员工健康",
  "budget": "5-10万",
  "email": "user@example.com",
  "system_prompt": "...",
  "user_prompt": "...",
  "response_format": "json"
}
```

## Prompt 结构

### System Prompt

包含：
1. 角色定义（健身空间规划顾问）
2. 任务说明
3. **JSON schema 要求**（关键部分）

### User Prompt

包含：
1. 用户输入的企业信息
2. **JSON schema 要求**（关键部分）

### JSON Schema 要求（关键）

在 system prompt 和 user prompt 的结尾，都会添加：

```
请严格以 JSON 输出，不要包含任何解释文字。
JSON 结构必须完全符合以下 schema（字段不得缺失、不得新增）：

{
  "meta": {
    "plan_id": "ATG-20260120-2744",
    "generated_at": "2026-01-20",
    "version": "v1"
  },
  "client_profile": {
    "company_size": 150,
    "industry": "企业办公",
    "space_area": 200,
    "scene": "办公楼",
    "budget_range": "5-10万"
  },
  "solution_summary": {
    "management_conclusion": [
      "适用于150人规模企业",
      "200㎡可落地基础有氧+力量",
      "预算控制在5-10万"
    ]
  },
  "equipment_plan": [
    {
      "category": "有氧",
      "items": [
        {
          "name": "跑步机",
          "qty": 1,
          "price_level": "中",
          "purpose": "适合有氧训练"
        }
      ]
    }
  ],
  "implementation": {
    "phase_1": "方案确认（7天）",
    "phase_2": "采购与安装（30天）",
    "phase_3": "运营优化（90天）"
  },
  "upsell_modules": {
    "layout_design": true,
    "3d_render": false,
    "rehab_module": false
  },
  "next_actions": [
    "提交平面图深化",
    "获取精确报价",
    "联系顾问"
  ]
}

重要提示：
1. 只输出 JSON，不要有任何前缀或后缀文字（如 "```json" 或 "```"）
2. 所有字段必须存在，不得缺失
3. 不得添加 schema 中未定义的字段
4. plan_id 格式：ATG-YYYYMMDD-XXXX（日期+4位随机数）
5. generated_at 格式：YYYY-MM-DD
6. equipment_plan 必须按 category 分组
7. management_conclusion 必须是字符串数组
8. implementation 的三个阶段必须都有值
```

## Java API 端实现建议

### 1. 使用 system_prompt 和 user_prompt

```java
// Java 代码示例
public class PlanGenerationRequest {
    private String companySize;
    private String area;
    private String scenario;
    private String goal;
    private String budget;
    private String email;
    private String systemPrompt;  // 使用这个
    private String userPrompt;     // 使用这个
    private String responseFormat; // 应该是 "json"
}

// 调用 LLM 时
String fullPrompt = systemPrompt + "\n\n" + userPrompt;
LLMResponse response = llmService.generate(fullPrompt, "json");
```

### 2. 处理 LLM 响应

LLM 可能返回：
- 纯 JSON（理想情况）
- 带 markdown 代码块的 JSON（如 ````json ... ```）
- 带解释文字的 JSON

**建议处理方式：**

```java
public Plan parseLLMResponse(String llmOutput) {
    // 1. 清理 markdown 代码块
    String cleaned = llmOutput.trim();
    if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replaceFirst("^```json\\s*", "")
                        .replaceFirst("\\s*```$", "");
    } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replaceFirst("^```\\s*", "")
                        .replaceFirst("\\s*```$", "");
    }
    
    // 2. 尝试提取 JSON（如果前面有解释文字）
    int jsonStart = cleaned.indexOf("{");
    if (jsonStart > 0) {
        cleaned = cleaned.substring(jsonStart);
    }
    
    // 3. 解析 JSON
    try {
        return objectMapper.readValue(cleaned, Plan.class);
    } catch (Exception e) {
        throw new RuntimeException("Failed to parse LLM response as JSON", e);
    }
}
```

### 3. 验证 JSON 结构

确保返回的 JSON 符合 schema：
- 所有必需字段都存在
- 字段类型正确
- 数组格式正确

## 测试建议

### 测试用例 1：标准输入
```json
{
  "companySize": "150",
  "area": "200",
  "scenario": "企业办公楼",
  "budget": "5-10万"
}
```

**期望输出：**
- 完整的 plan.json 结构
- 所有字段都存在
- 没有额外字段

### 测试用例 2：边界情况
- 空值处理
- 超大数字处理
- 特殊字符处理

### 测试用例 3：LLM 响应格式
- 纯 JSON
- 带 markdown 代码块的 JSON
- 带解释文字的 JSON

## 错误处理

如果 LLM 返回的 JSON 不符合 schema：
1. 记录错误日志（包含原始响应）
2. 返回明确的错误信息
3. Next.js API 会使用 mock 数据作为 fallback

## 后续优化

1. **使用 JSON Schema 验证库**：在 Java 端使用 JSON Schema 验证器
2. **重试机制**：如果 JSON 格式不正确，可以请求 LLM 重新生成
3. **流式输出**：如果 LLM 支持流式输出，可以实时验证 JSON 结构

