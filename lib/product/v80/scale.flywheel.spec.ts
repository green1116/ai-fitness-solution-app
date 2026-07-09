/**
 * V80 PRODUCT P3 — Growth flywheel (usage → data → PDF → workflow → expansion)
 */
import { PRODUCT_FEATURE_API_MAP } from "./product.pricing.spec";
import type { GrowthFlywheelStage } from "./scale.types";

export const GROWTH_FLYWHEEL: GrowthFlywheelStage[] = [
  {
    id: "PRD-FLW-001",
    order: 1,
    stage: "usage",
    input: "Tender intake + budget calc API calls",
    output: "UsageRecord per org — BUDGET/TENDER/QUOTE counts",
    compoundingEffect: "More usage → clearer upgrade signals",
    apiRoute: PRODUCT_FEATURE_API_MAP[0]!.routes[0],
    required: true,
  },
  {
    id: "PRD-FLW-002",
    order: 2,
    stage: "data",
    input: "Structured tender + quote + budget entities",
    output: "Project intelligence — company size, tier, artifact history",
    compoundingEffect: "Data moat — faster subsequent tenders",
    apiRoute: "/api/v80/entitlements",
    required: true,
  },
  {
    id: "PRD-FLW-003",
    order: 3,
    stage: "pdf",
    input: "Render plan / budget / proposal PDFs",
    output: "Shareable deliverables — stakeholder distribution",
    compoundingEffect: "PDF virality → inbound leads + partner referrals",
    apiRoute: "/api/v80/pdf",
    required: true,
  },
  {
    id: "PRD-FLW-004",
    order: 4,
    stage: "workflow",
    input: "tender-pack-complete autopilot run",
    output: "Full response bundle — 8-step DAG completion",
    compoundingEffect: "Workflow lock-in → switching cost rises",
    apiRoute: "/api/v80/autopilot/job/run",
    required: true,
  },
  {
    id: "PRD-FLW-005",
    order: 5,
    stage: "expansion",
    input: "FEATURE_GATE + USAGE_LIMIT triggers",
    output: "BASIC→PRO→ENTERPRISE upgrade + multi-org replication",
    compoundingEffect: "Revenue expansion → fund channel scaling",
    apiRoute: "/api/v80/budget/calculate",
    required: true,
  },
];

export function isGrowthFlywheelComplete(): boolean {
  const stages = new Set(GROWTH_FLYWHEEL.map((f) => f.stage));
  return (
    GROWTH_FLYWHEEL.length === 5 &&
    stages.has("usage") &&
    stages.has("data") &&
    stages.has("pdf") &&
    stages.has("workflow") &&
    stages.has("expansion") &&
    GROWTH_FLYWHEEL.every((f, i) => f.order === i + 1)
  );
}
