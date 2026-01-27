/**
 * LLM Prompt 构建函数
 * 
 * 确保 LLM 输出标准的 plan.json 格式
 */

import { Plan } from "@/lib/types/plan";

/**
 * 生成 JSON Schema 字符串（用于 prompt）
 */
export function getPlanJsonSchema(): string {
  return `{
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
    "budget_range": "5-10万",
    "potential_scope": [
      "企业健身空间",
      "室外篮球场",
      "运动地坪施工"
    ]
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
  "pricing_summary": {
    "confidence": "中",
    "range_total": "5-10万",
    "breakdown": [
      { "name": "设备", "range": "3-6万" },
      { "name": "运输安装", "range": "0.5-1.5万" },
      { "name": "基础运维", "range": "0.5-1万" }
    ],
    "assumptions": [
      "不含硬装改造与强电增容",
      "设备品牌为主流商用入门-中端"
    ]
  },
  "next_actions": [
    "提交平面图深化",
    "获取精确报价",
    "联系顾问"
  ]
}`;
}

/**
 * 构建完整的 LLM prompt（强制只输出 JSON）
 */
export function buildPlanPrompt(
  systemPrompt: string,
  userPrompt: string
): { system: string; user: string } {
  // 直接返回，不再追加额外内容（prompt 已包含所有必要信息）
  return {
    system: systemPrompt,
    user: userPrompt,
  };
}

/**
 * 构建默认的 system prompt（强制只输出 JSON）
 */
export function getDefaultSystemPrompt(): string {
  return `你是一个企业办公健身空间方案生成器。输出将被程序解析并用于生成 PDF。
你必须严格只输出 JSON（UTF-8），不允许输出任何解释、前后缀、Markdown 代码块、注释或多余文字。
字段不得缺失、不得新增、不得改名。数值字段必须为 number。price_level 只能为：低/中/高。
如果信息不足，做最保守的可落地假设补齐，不要写"未知/—/待定"。`;
}

/**
 * 构建默认的 user prompt（基于表单输入）
 */
export function buildUserPrompt(input: {
  companySize?: string | number;
  area?: string | number;
  scenario?: string;
  goal?: string;
  budget?: string;
  budgetRange?: string;
  industry?: string;
  preference?: string;
  potential_scope?: string[];
}): string {
  // 提取字段值，处理各种可能的字段名
  const company_size = input.companySize || "";
  const space_area = input.area || "";
  const scene = input.scenario || "";
  const budget_range = input.budget || input.budgetRange || "";
  const potential_scope = input.potential_scope || [];

  // JSON Schema 示例（使用 JSON.stringify 格式化）
  const jsonSchemaExample = JSON.stringify(
    {
      meta: { plan_id: "ATG-YYYYMMDD-0000", generated_at: "YYYY-MM-DD", version: "v1" },
      client_profile: {
        company_size: 150,
        industry: "企业办公",
        space_area: 200,
        scene: "办公楼",
        budget_range: "5-10万",
        potential_scope: ["企业健身空间"],
      },
      solution_summary: { management_conclusion: ["一句话1", "一句话2", "一句话3"] },
      equipment_plan: [
        { category: "有氧", items: [{ name: "跑步机", qty: 1, price_level: "中" }] },
      ],
      implementation: {
        phase_1: "方案确认（7天）",
        phase_2: "采购与安装（30天）",
        phase_3: "运营优化（90天）",
      },
      upsell_modules: { layout_design: true, "3d_render": false, rehab_module: false },
      next_actions: ["行动1", "行动2", "行动3"],
    },
    null,
    2
  );

  return `客户信息：
- 公司规模（人）：${company_size}
- 场地面积（㎡）：${space_area}
- 使用场景：${scene}
- 预算范围：${budget_range}
- 潜在范围（可选）：${potential_scope.join("、") || "无"}

输出 JSON 必须严格符合以下结构（schema），字段不得缺失、不得新增：

${jsonSchemaExample}`;
}

