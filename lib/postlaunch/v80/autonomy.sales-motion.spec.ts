/**
 * V80 POST-LAUNCH P4 — Self-generating sales motion (PDF → proposal → follow-up automation)
 * Extends P3 SALES_AUTOMATION_ENGINE — no human sales initiation
 */
import { SALES_AUTOMATION_ENGINE } from "./scaling.sales-automation.spec";
import type { SelfGeneratingSalesStep } from "./autonomy.types";

export const SELF_GENERATING_SALES_MOTION: SelfGeneratingSalesStep[] = [
  {
    id: "REV-AUT-SLS-001",
    order: 1,
    motion: "pdf",
    trigger: "Plan PDF auto-rendered post-intake",
    apiRoute: "/api/v80/pdf?type=plan",
    p3Ref: "REV-SCL-AUT-005",
    autonomousAction: "Intake success → auto-generate plan PDF — no user click required",
    required: true,
  },
  {
    id: "REV-AUT-SLS-002",
    order: 2,
    motion: "pdf",
    trigger: "Budget calc complete — equipment totals ready",
    apiRoute: "/api/v80/budget/calculate",
    p3Ref: "REV-SCL-AUT-004",
    autonomousAction: "Budget success → auto-queue budget PDF + watermark on BASIC",
    required: true,
  },
  {
    id: "REV-AUT-SLS-003",
    order: 3,
    motion: "proposal",
    trigger: "Autopilot workflow step 8/8 complete",
    apiRoute: "/api/v80/autopilot/job/run",
    p3Ref: "REV-SCL-AUT-007",
    autonomousAction: "Workflow done → auto-render proposal PDF artifact",
    required: true,
  },
  {
    id: "REV-AUT-SLS-004",
    order: 4,
    motion: "proposal",
    trigger: "Proposal PDF rendered — client-ready",
    apiRoute: "/api/v80/proposal-pdf/render",
    p3Ref: "REV-SCL-AUT-007",
    autonomousAction: "Render success → auto-deliver downloadUrl to stakeholder list",
    required: true,
  },
  {
    id: "REV-AUT-SLS-005",
    order: 5,
    motion: "followup",
    trigger: "48h elapsed — no proposal download",
    apiRoute: "/api/v80/entitlements",
    p3Ref: "REV-SCL-AUT-005",
    autonomousAction: "Idle PQL → auto-send budget PDF CTA + upgrade link with quote context",
    required: true,
  },
  {
    id: "REV-AUT-SLS-006",
    order: 6,
    motion: "followup",
    trigger: "FEATURE_GATE hit — checkout not initiated 7d",
    apiRoute: "/api/v80/budget/calculate",
    p3Ref: "REV-OPT-LK-006",
    autonomousAction: "Gate persistence → auto-retry upgrade email with saved partial totals",
    required: true,
  },
  {
    id: "REV-AUT-SLS-007",
    order: 7,
    motion: "close",
    trigger: "Proposal delivered + governance audit logged",
    apiRoute: "/api/v80/ops/governance/audit",
    p3Ref: "REV-SCL-AUT-008",
    autonomousAction: "Audit trail complete → auto-issue renewal quote + annual offer",
    required: true,
  },
  {
    id: "REV-AUT-SLS-008",
    order: 8,
    motion: "close",
    trigger: "Tender pack bundle ready — enterprise response pack",
    apiRoute: "/api/v80/pdf?artifactId",
    p3Ref: "REV-SCL-CHA-004",
    autonomousAction: "Bundle download → auto-trigger sales-assist contract template (24h SLA)",
    required: true,
  },
];

export function isSelfGeneratingSalesMotionComplete(): boolean {
  const automationIds = new Set(SALES_AUTOMATION_ENGINE.map((s) => s.id));
  const motions = new Set(SELF_GENERATING_SALES_MOTION.map((s) => s.motion));

  return (
    SELF_GENERATING_SALES_MOTION.length === 8 &&
    motions.has("pdf") &&
    motions.has("proposal") &&
    motions.has("followup") &&
    motions.has("close") &&
    SELF_GENERATING_SALES_MOTION.every((s, i) => s.order === i + 1) &&
    SELF_GENERATING_SALES_MOTION.filter((s) => s.p3Ref?.startsWith("REV-SCL-AUT")).length >= 5 &&
    automationIds.size >= 8
  );
}
