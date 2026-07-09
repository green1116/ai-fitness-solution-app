/**
 * V80 DEPLOY P2 — First tenant live flow (org → intake → PDF → billing)
 */
import type { FirstTenantLiveStep } from "./cutover.types";

export const FIRST_TENANT_LIVE_FLOW: FirstTenantLiveStep[] = [
  {
    id: "DEP-TNT-001",
    order: 1,
    action: "Provision first production tenant (FitScale PRO)",
    apiRoute: "POST /api/v80/tenant/run",
    expected: "{ organizationId, workspaceId, plan: PRO }",
    required: true,
  },
  {
    id: "DEP-TNT-002",
    order: 2,
    action: "Resolve entitlements for live org",
    apiRoute: "GET /api/v80/entitlements?organizationId=",
    expected: "tier=PRO, budgetGeneration=true, tenderPackage=true",
    required: true,
  },
  {
    id: "DEP-TNT-003",
    order: 3,
    action: "Submit first live tender intake",
    apiRoute: "POST /api/v80/tender/intake",
    expected: "{ tenderId, quoteId, status: draft }",
    required: true,
  },
  {
    id: "DEP-TNT-004",
    order: 4,
    action: "Calculate budget for live quote",
    apiRoute: "POST /api/v80/budget/calculate",
    expected: "{ budgetId, totals.equipment > 0 }",
    billingCheck: "usage BUDGET recorded; charge mapping returned",
    required: true,
  },
  {
    id: "DEP-TNT-005",
    order: 5,
    action: "Run tender-pack-complete workflow",
    apiRoute: "POST /api/v80/autopilot/job/run",
    expected: "status=completed, 8 steps done, artifacts ≥ 3",
    required: true,
  },
  {
    id: "DEP-TNT-006",
    order: 6,
    action: "Download live plan PDF",
    apiRoute: "GET /api/v80/pdf?type=plan&projectId=",
    expected: "Content-Type: application/pdf, bytes > 0",
    required: true,
  },
  {
    id: "DEP-TNT-007",
    order: 7,
    action: "Render proposal PDF artifact",
    apiRoute: "POST /api/v80/proposal-pdf/render",
    expected: "{ artifactId, downloadUrl }",
    billingCheck: "usage PDF; chargeCents=25 per mapping",
    required: true,
  },
  {
    id: "DEP-TNT-008",
    order: 8,
    action: "Verify commercial audit trail",
    apiRoute: "GET /api/v80/ops/governance/audit",
    expected: "api.success + feature.access entries for org",
    billingCheck: "entitlement trail logged",
    required: true,
  },
];

export function isFirstTenantFlowComplete(): boolean {
  return (
    FIRST_TENANT_LIVE_FLOW.length === 8 &&
    FIRST_TENANT_LIVE_FLOW.every((s, i) => s.order === i + 1) &&
    FIRST_TENANT_LIVE_FLOW.filter((s) => s.billingCheck).length >= 2
  );
}
