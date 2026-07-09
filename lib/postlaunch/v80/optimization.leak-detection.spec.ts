/**
 * V80 POST-LAUNCH P2 — Revenue leak detection (drop points + fix surfaces)
 * Maps PRODUCT P2 SALES_FUNNEL + P1 REVENUE_ACTIVATION_LOOP gaps
 */
import { SALES_FUNNEL_STAGES } from "@/lib/product/v80/growth.funnel.spec";
import { REVENUE_ACTIVATION_LOOP } from "./revenue.loop.spec";
import type { RevenueLeakPoint } from "./optimization.types";

export const REVENUE_LEAK_DETECTION: RevenueLeakPoint[] = [
  {
    id: "REV-OPT-LK-001",
    funnelStage: "org",
    dropSignal: "Tenant provisioned — no intake within 72h",
    leakRoute: "/api/v80/tenant/run",
    fixPoint: "Post-provision redirect to tender/intake with sample project template",
    fixSurface: "api",
    p1LoopRef: "REV-ACT-001",
    required: true,
  },
  {
    id: "REV-OPT-LK-002",
    funnelStage: "intake",
    dropSignal: "Intake complete — no budget calc within 48h",
    leakRoute: "/api/v80/tender/intake",
    fixPoint: "Intake response embed budget/calculate deep link + estimated equipment range",
    fixSurface: "api",
    p1LoopRef: "REV-ACT-002",
    required: true,
  },
  {
    id: "REV-OPT-LK-003",
    funnelStage: "pdf",
    dropSignal: "Plan PDF never downloaded after workflow",
    leakRoute: "/api/v80/pdf?type=plan",
    fixPoint: "Autopilot step 8 artifact list includes one-click plan PDF download",
    fixSurface: "workflow",
    p1LoopRef: "REV-ACT-004",
    required: true,
  },
  {
    id: "REV-OPT-LK-004",
    funnelStage: "pdf",
    dropSignal: "Proposal PDF gate hit — user abandons on 403",
    leakRoute: "/api/v80/proposal-pdf/render",
    fixPoint: "Replace bare 403 with watermark preview + inline upgrade CTA (REV-OPT-CNV-002)",
    fixSurface: "pdf",
    p1LoopRef: "REV-ACT-005",
    required: true,
  },
  {
    id: "REV-OPT-LK-005",
    funnelStage: "budget",
    dropSignal: "Budget calculated — no autopilot workflow started",
    leakRoute: "/api/v80/budget/calculate",
    fixPoint: "Budget success response triggers autopilot/job/run suggestion with tenderId",
    fixSurface: "api",
    p1LoopRef: "REV-ACT-003",
    required: true,
  },
  {
    id: "REV-OPT-LK-006",
    funnelStage: "paid",
    dropSignal: "FEATURE_GATE seen — checkout not initiated within 7d",
    leakRoute: "/api/v80/budget/calculate",
    fixPoint: "Gate payload includes persistent upgrade URL + saved quote context",
    fixSurface: "cta",
    p1LoopRef: "REV-ACT-008",
    required: true,
  },
  {
    id: "REV-OPT-LK-007",
    funnelStage: "paid",
    dropSignal: "USAGE_LIMIT 429 — user churns vs upgrades",
    leakRoute: "/api/v80/autopilot/job/run",
    fixPoint: "429 response offers capacity add-on + PRO annual discount (REV-OPT-YLD-005)",
    fixSurface: "api",
    p1LoopRef: "REV-ACT-009",
    required: true,
  },
  {
    id: "REV-OPT-LK-008",
    funnelStage: "paid",
    dropSignal: "Enterprise bundle gate — no sales follow-up",
    leakRoute: "/api/v80/pdf?artifactId",
    fixPoint: "Bundle download logs sales-assist signal — 24h SLA on ENTERPRISE outreach",
    fixSurface: "workflow",
    p1LoopRef: "REV-ACT-010",
    required: true,
  },
];

export function isRevenueLeakDetectionComplete(): boolean {
  const funnelStages = new Set(SALES_FUNNEL_STAGES.map((s) => s.stage));
  const loopIds = new Set(REVENUE_ACTIVATION_LOOP.map((s) => s.id));
  const fixSurfaces = new Set(REVENUE_LEAK_DETECTION.map((l) => l.fixSurface));

  return (
    REVENUE_LEAK_DETECTION.length === 8 &&
    funnelStages.has("org") &&
    funnelStages.has("paid") &&
    fixSurfaces.has("api") &&
    fixSurfaces.has("pdf") &&
    fixSurfaces.has("workflow") &&
    fixSurfaces.has("cta") &&
    REVENUE_LEAK_DETECTION.filter((l) => l.p1LoopRef).every((l) => loopIds.has(l.p1LoopRef!))
  );
}
