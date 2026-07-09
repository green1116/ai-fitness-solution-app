/**
 * V80 GTM P2 — Revenue capture mechanism (how money is triggered + collected)
 * Aligns V80_COMMERCIAL_ROUTES mapUsageToCharge + PRODUCT billing refs
 */
import { V80_COMMERCIAL_ROUTES, mapUsageToCharge } from "@/lib/scaffold/v80/ops/commercial";
import { BILLING_FEATURE_GATING_MATRIX } from "@/lib/app/v80/production.billing.spec";
import type { RevenueCapturePoint } from "./execution.types";

export const REVENUE_CAPTURE_MECHANISM: RevenueCapturePoint[] = [
  {
    id: "GTM-RCV-001",
    order: 1,
    trigger: "PRO annual subscription accepted at close",
    apiRoute: "/api/v80/tenant/run",
    usageType: null,
    chargeCents: 358800,
    collectionMethod: "subscription",
    billingRef: "PRD-BIL-003",
    required: true,
  },
  {
    id: "GTM-RCV-002",
    order: 2,
    trigger: "First budget calculate on live quote",
    apiRoute: "/api/v80/budget/calculate",
    usageType: "BUDGET",
    chargeCents: 50,
    collectionMethod: "metered",
    billingRef: "PRD-BIL-003",
    required: true,
  },
  {
    id: "GTM-RCV-003",
    order: 3,
    trigger: "Tender intake — quote usage recorded",
    apiRoute: "/api/v80/tender/intake",
    usageType: "QUOTE",
    chargeCents: 0,
    collectionMethod: "metered",
    required: true,
  },
  {
    id: "GTM-RCV-004",
    order: 4,
    trigger: "Autopilot workflow complete — tender pack",
    apiRoute: "/api/v80/autopilot/job/run",
    usageType: "TENDER",
    chargeCents: 200,
    collectionMethod: "metered",
    billingRef: "PRD-BIL-003",
    required: true,
  },
  {
    id: "GTM-RCV-005",
    order: 5,
    trigger: "Proposal PDF rendered — client deliverable",
    apiRoute: "/api/v80/proposal-pdf/render",
    usageType: "PDF",
    chargeCents: 25,
    collectionMethod: "metered",
    billingRef: "PRD-BIL-003",
    required: true,
  },
  {
    id: "GTM-RCV-006",
    order: 6,
    trigger: "Plan PDF download — included in PRO (no extra charge)",
    apiRoute: "/api/v80/pdf",
    usageType: "PDF",
    chargeCents: 25,
    collectionMethod: "metered",
    required: true,
  },
  {
    id: "GTM-RCV-007",
    order: 7,
    trigger: "Entitlement trail logged — billing dispute defense",
    apiRoute: "/api/v80/ops/governance/audit",
    usageType: null,
    chargeCents: null,
    collectionMethod: "subscription",
    required: true,
  },
  {
    id: "GTM-RCV-008",
    order: 8,
    trigger: "USAGE_LIMIT hit — capacity add-on or ENTERPRISE bridge",
    apiRoute: "/api/v80/autopilot/job/run",
    usageType: "TENDER",
    chargeCents: 200,
    collectionMethod: "annual-contract",
    billingRef: "PRD-BIL-005",
    required: true,
  },
];

export function isRevenueCaptureMechanismComplete(): boolean {
  const commercialEndpoints = new Set(V80_COMMERCIAL_ROUTES.map((r) => r.endpoint));
  const billingIds = new Set(BILLING_FEATURE_GATING_MATRIX.map((b) => b.id));
  const methods = new Set(REVENUE_CAPTURE_MECHANISM.map((r) => r.collectionMethod));

  const budgetCharge = mapUsageToCharge({ usageType: "BUDGET", units: 1, plan: "PRO" });
  const tenderCharge = mapUsageToCharge({ usageType: "TENDER", units: 1, plan: "PRO" });
  const pdfCharge = mapUsageToCharge({ usageType: "PDF", units: 1, plan: "PRO" });

  return (
    REVENUE_CAPTURE_MECHANISM.length === 8 &&
    methods.has("subscription") &&
    methods.has("metered") &&
    methods.has("annual-contract") &&
    REVENUE_CAPTURE_MECHANISM.every((r, i) => r.order === i + 1) &&
    REVENUE_CAPTURE_MECHANISM.filter((r) => r.billingRef).every((r) => billingIds.has(r.billingRef!)) &&
    REVENUE_CAPTURE_MECHANISM.every((r) => commercialEndpoints.has(r.apiRoute.split("?")[0]!) || r.apiRoute.includes("/ops/")) &&
    budgetCharge.chargeCents === 50 &&
    tenderCharge.chargeCents === 200 &&
    pdfCharge.chargeCents === 25
  );
}
