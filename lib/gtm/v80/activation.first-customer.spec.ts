/**
 * V80 GTM P1 — First customer acquisition strategy (who pays first + why now)
 * Real-world ICP aligned with PRODUCT P2 GTM + POST P1 first-customer path
 */
import { ENTERPRISE_GTM_MOTIONS } from "@/lib/product/v80/growth.gtm.spec";
import type { FirstCustomerTarget } from "./activation.types";

export const FIRST_CUSTOMER_ACQUISITION: FirstCustomerTarget[] = [
  {
    id: "GTM-FST-001",
    rank: 1,
    segment: "Mid-size gym equipment integrator",
    buyerRole: "Bid manager — active RFP pipeline",
    whyNow: "Active government gym RFP season — tender response deadline <14 days",
    targetPlan: "PRO",
    apiEntry: "/api/v80/tender/intake",
    postRef: "REV-FST-003",
    required: true,
  },
  {
    id: "GTM-FST-002",
    rank: 2,
    segment: "Regional gym chain (3–10 sites)",
    buyerRole: "Operations director — multi-site rollout",
    whyNow: "Consolidating vendor responses — needs standardized tender pack per site",
    targetPlan: "PRO",
    apiEntry: "/api/v80/autopilot/job/run",
    postRef: "PRD-GTM-002",
    required: true,
  },
  {
    id: "GTM-FST-003",
    rank: 3,
    segment: "Government procurement contractor",
    buyerRole: "Procurement officer — compliance-first buyer",
    whyNow: "Audit trail + budget PDF required for vendor shortlist — FitScale closes DD gap",
    targetPlan: "ENTERPRISE",
    apiEntry: "/api/v80/ops/governance/audit",
    postRef: "PRD-GTM-003",
    required: true,
  },
  {
    id: "GTM-FST-004",
    rank: 4,
    segment: "Fitness OEM distributor",
    buyerRole: "Channel partner — co-sell motion",
    whyNow: "White-label proposal PDF under partner brand — rev-share on first PRO seat",
    targetPlan: "PRO",
    apiEntry: "/api/v80/proposal-pdf/render",
    postRef: "REV-SCL-CHA-005",
    required: true,
  },
  {
    id: "GTM-FST-005",
    rank: 5,
    segment: "Independent gym consultant",
    buyerRole: "Solo integrator — high tender volume",
    whyNow: "Manual Excel budgets failing — autopilot workflow saves 2 days per bid",
    targetPlan: "PRO",
    apiEntry: "/api/v80/budget/calculate",
    postRef: "REV-ENT-001",
    required: true,
  },
  {
    id: "GTM-FST-006",
    rank: 6,
    segment: "National gym franchise HQ",
    buyerRole: "Executive sponsor — enterprise ACV",
    whyNow: "Multi-region rollout requires integrity score + unlimited workspaces",
    targetPlan: "ENTERPRISE",
    apiEntry: "/api/v80/production/integrity",
    postRef: "PRD-GTM-006",
    required: true,
  },
];

export function isFirstCustomerAcquisitionComplete(): boolean {
  const gtmIds = new Set(ENTERPRISE_GTM_MOTIONS.map((m) => m.id));
  const plans = new Set(FIRST_CUSTOMER_ACQUISITION.map((t) => t.targetPlan));

  return (
    FIRST_CUSTOMER_ACQUISITION.length === 6 &&
    plans.has("PRO") &&
    plans.has("ENTERPRISE") &&
    FIRST_CUSTOMER_ACQUISITION.every((t, i) => t.rank === i + 1) &&
    FIRST_CUSTOMER_ACQUISITION.filter((t) => t.postRef?.startsWith("PRD-GTM")).length >= 2 &&
    FIRST_CUSTOMER_ACQUISITION[0]!.rank === 1 &&
    gtmIds.size >= 6
  );
}
