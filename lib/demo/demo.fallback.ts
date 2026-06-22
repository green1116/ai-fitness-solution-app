/**
 * V64 P1 — Demo fallback responses
 */

import type { DemoBudgetOutput, DemoCompanyInput, DemoQuoteOutput, DemoTenderOutput } from "./demo.types";

export function fallbackDemoResponse(input?: Partial<DemoCompanyInput>) {
  const companyName = input?.companyName?.trim() || "示例企业";
  return {
    quote: fallbackDemoQuote(companyName),
    budget: fallbackDemoBudget(),
    tender: fallbackDemoTender(companyName),
  };
}

export function fallbackDemoQuote(companyName: string): DemoQuoteOutput {
  return {
    title: `${companyName} · 企业健身空间方案（Demo）`,
    summary: "AI 生成的企业健身房规划预览：有氧区 + 力量区 + 功能训练区。",
    equipment: [
      { name: "商用跑步机", qty: 6, zone: "有氧区" },
      { name: "史密斯训练架", qty: 2, zone: "力量区" },
      { name: "多功能训练器", qty: 4, zone: "功能训练区" },
    ],
    estimatedArea: "280㎡",
    mode: "demo-stub",
  };
}

export function fallbackDemoBudget(): DemoBudgetOutput {
  return {
    total: 1280000,
    currency: "CNY",
    breakdown: [
      { category: "有氧设备", amount: 420000 },
      { category: "力量设备", amount: 380000 },
      { category: "安装与辅材", amount: 280000 },
      { category: "运维预留", amount: 200000 },
    ],
    mode: "demo-stub",
  };
}

export function fallbackDemoTender(companyName: string): DemoTenderOutput {
  return {
    title: `${companyName} · 健身空间采购标书（预览）`,
    sections: ["项目概述", "技术方案", "设备清单", "商务条款", "交付计划"],
    complianceScore: 92,
    preview: "本标书由 AI 根据企业需求自动生成，包含完整技术响应与预算论证。",
    mode: "demo-stub",
  };
}
