/**
 * V80 POST-LAUNCH P1 — High-conversion entry points (API / PDF / workflow triggers)
 * Ranks PRODUCT P2 CONVERSION_TRIGGERS by revenue lift potential
 */
import { CONVERSION_TRIGGERS } from "@/lib/product/v80/growth.conversion.spec";
import type { HighConversionEntryPoint } from "./revenue.types";

export const HIGH_CONVERSION_ENTRY_POINTS: HighConversionEntryPoint[] = [
  {
    id: "REV-ENT-001",
    rank: 1,
    channel: "api",
    route: "/api/v80/budget/calculate",
    hook: "budget_gate",
    conversionTriggerRef: "PRD-CNV-001",
    expectedLift: "high",
    paywallMoment: "BASIC user sees equipment totals blocked — immediate PRO upsell",
    required: true,
  },
  {
    id: "REV-ENT-002",
    rank: 2,
    channel: "pdf",
    route: "/api/v80/proposal-pdf/render",
    hook: "proposal_gate",
    conversionTriggerRef: "PRD-CNV-003",
    expectedLift: "high",
    paywallMoment: "Client-ready PDF blocked — highest perceived value moment",
    required: true,
  },
  {
    id: "REV-ENT-003",
    rank: 3,
    channel: "workflow",
    route: "/api/v80/autopilot/job/run",
    hook: "tender_pack_complete",
    conversionTriggerRef: "PRD-CNV-004",
    expectedLift: "high",
    paywallMoment: "Monthly tender cap hit after successful pack — usage-based upgrade",
    required: true,
  },
  {
    id: "REV-ENT-004",
    rank: 4,
    channel: "api",
    route: "/api/v80/autopilot/job/run",
    hook: "autopilot_gate",
    conversionTriggerRef: "PRD-CNV-002",
    expectedLift: "medium",
    paywallMoment: "Full tender automation blocked on BASIC — workflow upsell",
    required: true,
  },
  {
    id: "REV-ENT-005",
    rank: 5,
    channel: "pdf",
    route: "/api/v80/pdf?type=budget",
    hook: "budget_pdf_preview",
    conversionTriggerRef: "PRD-CNV-005",
    expectedLift: "medium",
    paywallMoment: "Branded budget PDF preview — visual proof before checkout",
    required: true,
  },
  {
    id: "REV-ENT-006",
    rank: 6,
    channel: "pdf",
    route: "/api/v80/pdf?artifactId",
    hook: "bundle_download",
    conversionTriggerRef: "PRD-CNV-006",
    expectedLift: "high",
    paywallMoment: "Enterprise response pack — sales-assist ENTERPRISE trigger",
    required: true,
  },
  {
    id: "REV-ENT-007",
    rank: 7,
    channel: "api",
    route: "/api/v80/production/integrity",
    hook: "integrity_gate",
    conversionTriggerRef: "PRD-CNV-007",
    expectedLift: "medium",
    paywallMoment: "Governance dashboard — procurement compliance buyer trigger",
    required: true,
  },
];

export function isHighConversionEntryPointsComplete(): boolean {
  const triggerIds = new Set(CONVERSION_TRIGGERS.map((t) => t.id));
  const channels = new Set(HIGH_CONVERSION_ENTRY_POINTS.map((e) => e.channel));

  return (
    HIGH_CONVERSION_ENTRY_POINTS.length === 7 &&
    channels.has("api") &&
    channels.has("pdf") &&
    channels.has("workflow") &&
    HIGH_CONVERSION_ENTRY_POINTS.every((e, i) => e.rank === i + 1) &&
    HIGH_CONVERSION_ENTRY_POINTS.every((e) => triggerIds.has(e.conversionTriggerRef)) &&
    HIGH_CONVERSION_ENTRY_POINTS.filter((e) => e.expectedLift === "high").length >= 4
  );
}
