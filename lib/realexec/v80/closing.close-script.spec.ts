/**
 * V80 REAL EXEC P2 — Closing script (payment ask + PRO/ENTERPRISE conversion)
 * Maps GTM P2 REVENUE_CAPTURE_MECHANISM + offer pack SKUs
 */
import { REVENUE_CAPTURE_MECHANISM } from "@/lib/gtm/v80/execution.revenue-capture.spec";
import type { ClosingScriptBeat } from "./closing.types";

export const CLOSING_SCRIPT: ClosingScriptBeat[] = [
  {
    id: "REX-CLS-001",
    order: 1,
    moment: "trial_close",
    script:
      "Based on what we built today — budget, plan PDF, and full proposal — does this meet what procurement needs for [RFP name]?",
    targetPlan: "PRO",
    apiRoute: "/api/v80/proposal-pdf/render",
    revenueRef: "GTM-RCV-005",
    required: true,
  },
  {
    id: "REX-CLS-002",
    order: 2,
    moment: "trial_close",
    script:
      "If I keep this workspace active for your team through [deadline], can we move forward with FitScale PRO today?",
    targetPlan: "PRO",
    apiRoute: "/api/v80/entitlements",
    required: true,
  },
  {
    id: "REX-CLS-003",
    order: 3,
    moment: "offer",
    script:
      "FitScale PRO: $299/mo — 5 workspaces, 50 tenders/mo, unlimited proposal PDFs. Annual prepay $3,588 saves you $598 vs monthly.",
    targetPlan: "PRO",
    apiRoute: "/api/v80/tenant/run",
    revenueRef: "GTM-RCV-001",
    required: true,
  },
  {
    id: "REX-CLS-004",
    order: 4,
    moment: "offer",
    script:
      "Everything you saw today — budget calc, tender pack, proposal PDF — stays in your workspace. Metered usage: ¢50/budget, ¢200/tender pack, ¢25/proposal.",
    targetPlan: "PRO",
    apiRoute: "/api/v80/budget/calculate",
    revenueRef: "GTM-RCV-002",
    required: true,
  },
  {
    id: "REX-CLS-005",
    order: 5,
    moment: "payment_ask",
    script:
      "I'll send the annual invoice now — $3,588 for 12 months. Confirm billing email and we'll activate PRO entitlements immediately. Your demo project stays live.",
    targetPlan: "PRO",
    apiRoute: "/api/v80/tenant/run",
    revenueRef: "GTM-RCV-001",
    required: true,
  },
  {
    id: "REX-CLS-006",
    order: 6,
    moment: "payment_ask",
    script:
      "Once payment clears, I'll pull the governance audit export — that's your procurement DD packet bundled with today's proposal.",
    targetPlan: "PRO",
    apiRoute: "/api/v80/ops/governance/audit",
    revenueRef: "GTM-RCV-007",
    required: true,
  },
  {
    id: "REX-CLS-007",
    order: 7,
    moment: "enterprise_bridge",
    script:
      "If you're bidding across multiple sites or regions, FitEnterprise adds unlimited workspaces, cross-region audit rollup, and governance SLA. Let's scope that after PRO is live.",
    targetPlan: "ENTERPRISE",
    apiRoute: "/api/v80/production/integrity",
    revenueRef: "GTM-RCV-008",
    required: true,
  },
  {
    id: "REX-CLS-008",
    order: 8,
    moment: "enterprise_bridge",
    script:
      "For enterprise response packs with bundle download, we attach an annual contract template — sales-assist within 24h. That's the path when you outgrow 50 tenders/mo.",
    targetPlan: "ENTERPRISE",
    apiRoute: "/api/v80/pdf?artifactId",
    revenueRef: "GTM-RCV-008",
    required: true,
  },
];

export function isClosingScriptComplete(): boolean {
  const captureIds = new Set(REVENUE_CAPTURE_MECHANISM.map((r) => r.id));
  const moments = new Set(CLOSING_SCRIPT.map((c) => c.moment));

  return (
    CLOSING_SCRIPT.length === 8 &&
    moments.has("trial_close") &&
    moments.has("offer") &&
    moments.has("payment_ask") &&
    moments.has("enterprise_bridge") &&
    CLOSING_SCRIPT.every((c, i) => c.order === i + 1) &&
    CLOSING_SCRIPT.filter((c) => c.targetPlan === "PRO").length >= 6 &&
    CLOSING_SCRIPT.filter((c) => c.revenueRef).every((c) => captureIds.has(c.revenueRef!))
  );
}
