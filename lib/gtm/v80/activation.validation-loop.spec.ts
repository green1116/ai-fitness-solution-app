/**
 * V80 GTM P1 — Revenue validation loop (first deal → PDF → expansion → case study)
 * Real-world proof chain — maps DEPLOY P2 first-tenant + POST P1 revenue path
 */
import { FIRST_TENANT_LIVE_FLOW } from "@/lib/deploy/v80/deploy.first-tenant.spec";
import { FIRST_CUSTOMER_REVENUE_PATH } from "@/lib/postlaunch/v80/revenue.first-customer.spec";
import type { RevenueValidationStep } from "./activation.types";

export const REVENUE_VALIDATION_LOOP: RevenueValidationStep[] = [
  {
    id: "GTM-VAL-001",
    order: 1,
    milestone: "first_deal",
    action: "Close first paying PRO customer — live tender intake",
    apiRoute: "/api/v80/tender/intake",
    validationProof: "quoteId issued + org on PRO tier — DEP-TNT-003",
    postRef: "REV-FST-003",
    required: true,
  },
  {
    id: "GTM-VAL-002",
    order: 2,
    milestone: "first_deal",
    action: "First billable usage — budget calculate on live quote",
    apiRoute: "/api/v80/budget/calculate",
    validationProof: "BUDGET usage recorded; chargeCents=50 — DEP-TNT-004",
    postRef: "REV-FST-004",
    required: true,
  },
  {
    id: "GTM-VAL-003",
    order: 3,
    milestone: "pdf",
    action: "Deliver plan PDF to customer stakeholder",
    apiRoute: "/api/v80/pdf?type=plan",
    validationProof: "Content-Type application/pdf; bytes>0 — DEP-TNT-006",
    postRef: "REV-FST-006",
    required: true,
  },
  {
    id: "GTM-VAL-004",
    order: 4,
    milestone: "pdf",
    action: "Render + deliver proposal PDF — client-ready artifact",
    apiRoute: "/api/v80/proposal-pdf/render",
    validationProof: "artifactId + downloadUrl; PDF chargeCents=25 — DEP-TNT-007",
    postRef: "REV-FST-007",
    required: true,
  },
  {
    id: "GTM-VAL-005",
    order: 5,
    milestone: "expansion",
    action: "Complete tender-pack workflow — highest unit charge",
    apiRoute: "/api/v80/autopilot/job/run",
    validationProof: "status=completed; 8 steps; artifacts≥3 — DEP-TNT-005",
    postRef: "REV-FST-005",
    required: true,
  },
  {
    id: "GTM-VAL-006",
    order: 6,
    milestone: "expansion",
    action: "Verify governance audit trail — renewal defense",
    apiRoute: "/api/v80/ops/governance/audit",
    validationProof: "entitlement trail logged — DEP-TNT-008",
    postRef: "REV-FST-008",
    required: true,
  },
  {
    id: "GTM-VAL-007",
    order: 7,
    milestone: "case_study",
    action: "Document tender→PDF→paid timeline as reference deal",
    apiRoute: "/api/v80/production/integrity",
    validationProof: "Integrity score + release readiness for sales deck",
    postRef: "REV-OPT-ENT-006",
    required: true,
  },
  {
    id: "GTM-VAL-008",
    order: 8,
    milestone: "case_study",
    action: "Publish case study — feed inbound PLG + outbound ABM",
    apiRoute: "/api/v80/tenant/run",
    validationProof: "New org signups attributed to case study channel",
    postRef: "REV-SCL-CHA-001",
    required: true,
  },
];

export function isRevenueValidationLoopComplete(): boolean {
  const tenantIds = new Set(FIRST_TENANT_LIVE_FLOW.map((s) => s.id));
  const revenueRefs = new Set(FIRST_CUSTOMER_REVENUE_PATH.map((s) => s.id));
  const milestones = new Set(REVENUE_VALIDATION_LOOP.map((v) => v.milestone));

  return (
    REVENUE_VALIDATION_LOOP.length === 8 &&
    milestones.has("first_deal") &&
    milestones.has("pdf") &&
    milestones.has("expansion") &&
    milestones.has("case_study") &&
    REVENUE_VALIDATION_LOOP.every((v, i) => v.order === i + 1) &&
    REVENUE_VALIDATION_LOOP.filter((v) => v.postRef?.startsWith("REV-FST")).length >= 6 &&
    tenantIds.size >= 8 &&
    revenueRefs.size >= 8
  );
}
