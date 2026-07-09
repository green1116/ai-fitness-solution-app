/**
 * V80 PRODUCT P2 — Enterprise GTM motion (tender-driven sales + procurement)
 */
import type { EnterpriseGtmMotion } from "./growth.types";

export const ENTERPRISE_GTM_MOTIONS: EnterpriseGtmMotion[] = [
  {
    id: "PRD-GTM-001",
    motion: "tender-procurement",
    buyerRole: "Enterprise procurement officer",
    procurementStep: "RFP issued → vendor shortlist",
    apiRoute: "/api/v80/tender/intake",
    deliverable: "Structured tender project + quoteId",
    salesPlay: "Land with FitStart trial on single RFP; expand to FitScale for bid team",
    required: true,
  },
  {
    id: "PRD-GTM-002",
    motion: "tender-procurement",
    buyerRole: "Bid manager / integrator",
    procurementStep: "Technical + commercial response due",
    apiRoute: "/api/v80/autopilot/job/run",
    deliverable: "tender-pack-complete bundle (plan+budget+proposal)",
    salesPlay: "PRO demo → autopilot workflow closes deal cycle in <1 day",
    required: true,
  },
  {
    id: "PRD-GTM-003",
    motion: "compliance-sale",
    buyerRole: "Compliance / legal reviewer",
    procurementStep: "Vendor due diligence + audit trail",
    apiRoute: "/api/v80/ops/governance/audit",
    deliverable: "Entitlement enforcement audit log",
    salesPlay: "Enterprise gate — integrity + audit as procurement differentiator",
    required: true,
  },
  {
    id: "PRD-GTM-004",
    motion: "compliance-sale",
    buyerRole: "CFO / finance approver",
    procurementStep: "Budget approval gate",
    apiRoute: "/api/v80/budget/calculate",
    deliverable: "Government-tier budget PDF for sign-off",
    salesPlay: "Budget PDF as financial artifact in procurement packet",
    required: true,
  },
  {
    id: "PRD-GTM-005",
    motion: "multi-site-rollout",
    buyerRole: "National gym chain ops director",
    procurementStep: "Multi-site tender program",
    apiRoute: "/api/v80/tenant/run",
    deliverable: "Multiple workspaces under ENTERPRISE contract",
    salesPlay: "FitEnterprise — unlimited workspaces + dedicated CSM",
    required: true,
  },
  {
    id: "PRD-GTM-006",
    motion: "multi-site-rollout",
    buyerRole: "Executive sponsor",
    procurementStep: "Go-live readiness review",
    apiRoute: "/api/v80/production/integrity",
    deliverable: "Production integrity score + release readiness",
    salesPlay: "Close enterprise ACV with governance SLA in contract",
    required: true,
  },
];

export function isEnterpriseGtmComplete(): boolean {
  const motions = new Set(ENTERPRISE_GTM_MOTIONS.map((m) => m.motion));
  return (
    ENTERPRISE_GTM_MOTIONS.length === 6 &&
    motions.has("tender-procurement") &&
    motions.has("compliance-sale") &&
    motions.has("multi-site-rollout")
  );
}
