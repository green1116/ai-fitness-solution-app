/**
 * V64 P1 — Quote demo engine (no billing, no V57 surface)
 */

import type { DemoCompanyInput, DemoQuoteOutput } from "./demo.types";
import { fallbackDemoQuote } from "./demo.fallback";
import { getDemoRuntimeStubLabel } from "./demo.v58-stub";

export function generateDemoQuote(input: DemoCompanyInput): DemoQuoteOutput {
  const name = input.companyName?.trim();
  if (!name) return fallbackDemoQuote("示例企业");

  const size = input.companySize ?? "200-500人";
  const goal = input.goal ?? "员工健康与福利提升";

  return {
    title: `${name} · AI 企业健身方案`,
    summary: `面向 ${size} 规模企业，目标：${goal}。方案包含有氧、力量与康复训练分区规划。`,
    equipment: [
      { name: "商用椭圆机", qty: size.includes("500") ? 8 : 5, zone: "有氧区" },
      { name: "哑铃套装", qty: 3, zone: "自由力量区" },
      { name: "动感单车", qty: 6, zone: "团课区" },
      { name: "拉伸康复器", qty: 2, zone: "康复区" },
    ],
    estimatedArea: size.includes("500") ? "450㎡" : "280㎡",
    mode: "demo-stub",
  };
}

export function getQuoteDemoMeta() {
  return { runtime: getDemoRuntimeStubLabel(), billing: "none" };
}
