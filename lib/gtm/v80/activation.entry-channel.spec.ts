/**
 * V80 GTM P1 — Go-to-market entry point (highest probability conversion channel)
 * Primary: tender marketplace intake — ranked alternatives from POST P3/P4
 */
import { HIGH_CONVERSION_ENTRY_POINTS } from "@/lib/postlaunch/v80/revenue.entrypoints.spec";
import type { GtmEntryPoint } from "./activation.types";

export const GTM_ENTRY_POINTS: GtmEntryPoint[] = [
  {
    id: "GTM-ENT-001",
    rank: 1,
    channel: "tender-marketplace",
    apiRoute: "/api/v80/tender/intake",
    conversionProbability: "highest",
    executionPlay: "List on procurement portal → auto-intake on RFP match → autopilot demo same day",
    postRef: "REV-SCL-CHA-007",
    required: true,
  },
  {
    id: "GTM-ENT-002",
    rank: 2,
    channel: "outbound-abm-integrator",
    apiRoute: "/api/v80/autopilot/job/run",
    conversionProbability: "high",
    executionPlay: "Target bid managers with live 30min tender-pack demo on their active RFP",
    postRef: "REV-ENT-003",
    required: true,
  },
  {
    id: "GTM-ENT-003",
    rank: 3,
    channel: "budget-gate-plg",
    apiRoute: "/api/v80/budget/calculate",
    conversionProbability: "high",
    executionPlay: "SEO budget calculator → trial → FEATURE_GATE upsell with partial totals",
    postRef: "REV-ENT-001",
    required: true,
  },
  {
    id: "GTM-ENT-004",
    rank: 4,
    channel: "partner-co-sell",
    apiRoute: "/api/v80/proposal-pdf/render",
    conversionProbability: "medium",
    executionPlay: "OEM white-label proposal → partner referral → PRO seat rev-share",
    postRef: "REV-SCL-CHA-005",
    required: true,
  },
];

export function isGtmEntryPointsComplete(): boolean {
  const entryIds = new Set(HIGH_CONVERSION_ENTRY_POINTS.map((e) => e.id));

  return (
    GTM_ENTRY_POINTS.length === 4 &&
    GTM_ENTRY_POINTS.every((e, i) => e.rank === i + 1) &&
    GTM_ENTRY_POINTS[0]!.conversionProbability === "highest" &&
    GTM_ENTRY_POINTS[0]!.apiRoute.includes("tender/intake") &&
    GTM_ENTRY_POINTS.filter((e) => e.postRef?.startsWith("REV-ENT")).length >= 2 &&
    entryIds.size >= 7
  );
}
