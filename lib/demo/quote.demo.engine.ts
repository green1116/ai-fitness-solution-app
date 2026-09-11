/**
 * V64 P1 — Quote demo engine (equipment from canonical gym-budget items;
 * solution preview from formal pure buildPlan — no DB/auth).
 */

import { buildBudgetSummary } from "@/lib/gym-budget";
import { buildPlan } from "@/lib/plan/builder";
import type { CompanySize } from "@/lib/types/gym-budget";

import type {
  DemoCompanyInput,
  DemoQuoteOutput,
  DemoSolutionPreview,
} from "./demo.types";
import { fallbackDemoQuote } from "./demo.fallback";
import { solutionPreviewFromPlan } from "./demo.solution-preview";
import { getDemoRuntimeStubLabel } from "./demo.v58-stub";
import {
  demoEstimatedAreaForSize,
  mapDemoSizeBandToCompanySize,
  zoneFromBudgetCategory,
} from "./demo.size-map";

const DEMO_BUDGET_TIER = "mid" as const;

function demoAreaM2(companySizeBand?: string): number {
  const n = mapDemoSizeBandToCompanySize(companySizeBand);
  if (n >= 300) return 450;
  if (n >= 200) return 350;
  return 280;
}

function buildDemoSolutionPreview(input: {
  companyName: string;
  companySizeBand: string;
  industry?: string;
}): DemoSolutionPreview {
  const headcount = mapDemoSizeBandToCompanySize(input.companySizeBand);
  const plan = buildPlan(
    {
      planId: `demo-${input.companyName}`,
      industry: input.industry?.trim() || "企业",
      companySize: headcount,
      areaSize: demoAreaM2(input.companySizeBand),
      budgetRange: "10-20万",
    },
    "standard",
  );
  return solutionPreviewFromPlan(plan);
}

export function generateDemoQuote(input: DemoCompanyInput): DemoQuoteOutput {
  const name = input.companyName?.trim();
  if (!name) return fallbackDemoQuote("示例企业");

  const size = input.companySize ?? "200-500人";
  const goal = input.goal ?? "员工健康与福利提升";
  const companySize = mapDemoSizeBandToCompanySize(size) as CompanySize;
  const summary = buildBudgetSummary(DEMO_BUDGET_TIER, companySize);
  const items = summary.items ?? [];

  return {
    title: `${name} · AI 企业健身方案`,
    summary: `面向 ${size} 规模企业，目标：${goal}。方案包含有氧、力量与康复训练分区规划。`,
    equipment: items.map((item) => ({
      name: item.name,
      qty: item.qty,
      zone: zoneFromBudgetCategory(item.category),
    })),
    estimatedArea: demoEstimatedAreaForSize(size),
    solutionPreview: buildDemoSolutionPreview({
      companyName: name,
      companySizeBand: size,
      industry: input.industry,
    }),
    mode: "demo-stub",
  };
}

export function getQuoteDemoMeta() {
  return { runtime: getDemoRuntimeStubLabel(), billing: "none" };
}
