/**
 * V80 POST-LAUNCH P2 — Enterprise sales acceleration (tender → close cycle reduction)
 * Aligns PRODUCT P2 ENTERPRISE_GTM_MOTIONS + P1 enterprise triggers
 */
import { ENTERPRISE_GTM_MOTIONS } from "@/lib/product/v80/growth.gtm.spec";
import type { EnterpriseSalesAcceleration } from "./optimization.types";

export const ENTERPRISE_SALES_ACCELERATION: EnterpriseSalesAcceleration[] = [
  {
    id: "REV-OPT-ENT-001",
    gtmRef: "PRD-GTM-001",
    cycleStage: "rfp",
    apiRoute: "/api/v80/tender/intake",
    baselineDays: 14,
    targetDays: 3,
    accelerationTactic: "Same-session intake → autopilot trigger — skip manual handoff between bid team",
    deliverable: "quoteId + tenderId in single API chain",
    required: true,
  },
  {
    id: "REV-OPT-ENT-002",
    gtmRef: "PRD-GTM-002",
    cycleStage: "response",
    apiRoute: "/api/v80/autopilot/job/run",
    baselineDays: 7,
    targetDays: 1,
    accelerationTactic: "Pre-packaged tender-pack-complete on PRO demo — close technical response same day",
    deliverable: "plan+budget+proposal bundle (8 steps, ≥3 artifacts)",
    required: true,
  },
  {
    id: "REV-OPT-ENT-003",
    gtmRef: "PRD-GTM-003",
    cycleStage: "compliance",
    apiRoute: "/api/v80/ops/governance/audit",
    baselineDays: 21,
    targetDays: 5,
    accelerationTactic: "Attach entitlement audit export to proposal PDF — procurement DD pre-answered",
    deliverable: "api.success + feature.access audit log",
    required: true,
  },
  {
    id: "REV-OPT-ENT-004",
    gtmRef: "PRD-GTM-004",
    cycleStage: "compliance",
    apiRoute: "/api/v80/budget/calculate",
    baselineDays: 10,
    targetDays: 2,
    accelerationTactic: "Budget PDF as CFO sign-off artifact bundled with proposal — single download pack",
    deliverable: "Government-tier budget PDF (¢50 usage)",
    required: true,
  },
  {
    id: "REV-OPT-ENT-005",
    gtmRef: "PRD-GTM-005",
    cycleStage: "close",
    apiRoute: "/api/v80/tenant/run",
    baselineDays: 45,
    targetDays: 14,
    accelerationTactic: "Multi-workspace ENTERPRISE provision on bundle_download gate — sales-assist within 24h",
    deliverable: "ENTERPRISE tenant + unlimited workspaces",
    required: true,
  },
  {
    id: "REV-OPT-ENT-006",
    gtmRef: "PRD-GTM-006",
    cycleStage: "close",
    apiRoute: "/api/v80/production/integrity",
    baselineDays: 30,
    targetDays: 7,
    accelerationTactic: "Integrity score in executive review deck — governance SLA closes ACV objection",
    deliverable: "Production integrity score + release readiness",
    required: true,
  },
  {
    id: "REV-OPT-ENT-007",
    gtmRef: "PRD-GTM-002",
    cycleStage: "response",
    apiRoute: "/api/v80/pdf?artifactId",
    baselineDays: 5,
    targetDays: 1,
    accelerationTactic: "Enterprise response pack download triggers sales-assist — contract template attached",
    deliverable: "bundle download → ENTERPRISE CTA (PRD-CNV-006)",
    required: true,
  },
];

export function isEnterpriseSalesAccelerationComplete(): boolean {
  const gtmIds = new Set(ENTERPRISE_GTM_MOTIONS.map((m) => m.id));
  const stages = new Set(ENTERPRISE_SALES_ACCELERATION.map((a) => a.cycleStage));

  return (
    ENTERPRISE_SALES_ACCELERATION.length === 7 &&
    stages.has("rfp") &&
    stages.has("response") &&
    stages.has("compliance") &&
    stages.has("close") &&
    ENTERPRISE_SALES_ACCELERATION.every((a) => gtmIds.has(a.gtmRef)) &&
    ENTERPRISE_SALES_ACCELERATION.every((a) => a.targetDays < a.baselineDays)
  );
}
