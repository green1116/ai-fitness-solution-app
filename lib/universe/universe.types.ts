/**
 * V65 — Business Universe types
 */

import type { VerticalIndustry } from "@/lib/expansion/expansion.types";

export type SaaSInstanceStatus = "draft" | "deployed" | "scaling" | "optimized";

export type SaaSInstance = {
  id: string;
  industry: VerticalIndustry;
  name: string;
  slug: string;
  status: SaaSInstanceStatus;
  mrr: number;
  modules: string[];
  revenueStreamId: string;
  createdAt: string;
  deployedAt?: string;
};

export type IndustryUniverse = {
  id: string;
  industry: VerticalIndustry;
  label: string;
  instances: SaaSInstance[];
  totalMrr: number;
};

export type UniverseRevenueNode = {
  instanceId: string;
  industry: VerticalIndustry;
  name: string;
  mrr: number;
  arr: number;
  sharePct: number;
};

export type UniverseRevenueGraph = {
  nodes: UniverseRevenueNode[];
  totalMrr: number;
  totalArr: number;
  streamCount: number;
};

export type UniverseThresholds = {
  mrrScaleMin: number;
  industryGapMin: number;
  resourceAllocationCap: number;
};

export type UniverseLoopResult = {
  traceId: string;
  instances: SaaSInstance[];
  universes: IndustryUniverse[];
  revenueGraph: UniverseRevenueGraph;
  thresholds: UniverseThresholds;
  actions: string[];
  optimizations: string[];
  generatedAt: string;
};

export const UNIVERSE_INDUSTRY_CATALOG: { industry: VerticalIndustry; label: string }[] = [
  { industry: "fitness", label: "AI Fitness SaaS" },
  { industry: "education", label: "AI Education SaaS" },
  { industry: "procurement", label: "AI Procurement SaaS" },
  { industry: "hr_admin", label: "AI HR SaaS" },
  { industry: "enterprise", label: "AI Enterprise SaaS" },
];

export function computeUniverseThresholds(metrics: { totalMrr: number; instanceCount: number }): UniverseThresholds {
  return {
    mrrScaleMin: metrics.instanceCount > 3 ? 500 : 200,
    industryGapMin: metrics.instanceCount > 5 ? 2 : 1,
    resourceAllocationCap: Math.min(10, Math.max(3, metrics.instanceCount + 2)),
  };
}
