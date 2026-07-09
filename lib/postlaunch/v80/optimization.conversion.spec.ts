/**
 * V80 POST-LAUNCH P2 — Conversion rate optimization (API / PDF / workflow entry tuning)
 * Tunes P1 HIGH_CONVERSION_ENTRY_POINTS + PRODUCT P2 CONVERSION_TRIGGERS
 */
import { HIGH_CONVERSION_ENTRY_POINTS } from "./revenue.entrypoints.spec";
import type { ConversionRateTuning } from "./optimization.types";

export const CONVERSION_RATE_TUNING: ConversionRateTuning[] = [
  {
    id: "REV-OPT-CNV-001",
    channel: "api",
    route: "/api/v80/budget/calculate",
    p1EntryRef: "REV-ENT-001",
    triggerRef: "PRD-CNV-001",
    tuning: "Show equipment subtotals before gate — CTA inline on partial response, not blank 403",
    expectedCrLift: "+12–18% gate→checkout",
    required: true,
  },
  {
    id: "REV-OPT-CNV-002",
    channel: "pdf",
    route: "/api/v80/proposal-pdf/render",
    p1EntryRef: "REV-ENT-002",
    triggerRef: "PRD-CNV-003",
    tuning: "Render 1-page watermark preview on BASIC — upgrade CTA on download click",
    expectedCrLift: "+20–25% pdf→paid",
    required: true,
  },
  {
    id: "REV-OPT-CNV-003",
    channel: "workflow",
    route: "/api/v80/autopilot/job/run",
    p1EntryRef: "REV-ENT-003",
    triggerRef: "PRD-CNV-004",
    tuning: "Post-completion upsell at step 8/8 — surface capacity add-on before hard USAGE_LIMIT",
    expectedCrLift: "+15% limit-hit→upgrade",
    required: true,
  },
  {
    id: "REV-OPT-CNV-004",
    channel: "api",
    route: "/api/v80/autopilot/job/run",
    p1EntryRef: "REV-ENT-004",
    triggerRef: "PRD-CNV-002",
    tuning: "Expose step-1 progress on BASIC — gate at step 3 with visible value earned",
    expectedCrLift: "+10% workflow-start→PRO",
    required: true,
  },
  {
    id: "REV-OPT-CNV-005",
    channel: "pdf",
    route: "/api/v80/pdf?type=budget",
    p1EntryRef: "REV-ENT-005",
    triggerRef: "PRD-CNV-005",
    tuning: "Budget PDF thumbnail in intake success — one-click preview reduces drop to paid",
    expectedCrLift: "+8% intake→budget-pdf",
    required: true,
  },
  {
    id: "REV-OPT-CNV-006",
    channel: "pdf",
    route: "/api/v80/pdf?type=plan",
    p1EntryRef: "REV-ACT-004",
    triggerRef: "PRD-FUN-004",
    tuning: "Plan PDF success → immediate budget/calculate CTA (same session activation)",
    expectedCrLift: "+14% pdf→budget",
    required: true,
  },
  {
    id: "REV-OPT-CNV-007",
    channel: "api",
    route: "/api/v80/tender/intake",
    p1EntryRef: "REV-ACT-001",
    triggerRef: "PRD-FUN-003",
    tuning: "Intake response includes next-step deep link to budget/calculate — reduce idle PQL",
    expectedCrLift: "+9% intake→usage",
    required: true,
  },
];

export function isConversionRateTuningComplete(): boolean {
  const entryIds = new Set(HIGH_CONVERSION_ENTRY_POINTS.map((e) => e.id));
  const channels = new Set(CONVERSION_RATE_TUNING.map((t) => t.channel));

  return (
    CONVERSION_RATE_TUNING.length === 7 &&
    channels.has("api") &&
    channels.has("pdf") &&
    channels.has("workflow") &&
    CONVERSION_RATE_TUNING.every((t) => t.p1EntryRef.startsWith("REV-")) &&
    CONVERSION_RATE_TUNING.filter((t) => entryIds.has(t.p1EntryRef) || t.p1EntryRef.startsWith("REV-ACT")).length >= 5
  );
}
