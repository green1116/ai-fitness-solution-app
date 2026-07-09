/**
 * V80 GTM P2 — First deal execution flow (tender → PDF → budget → payment → upgrade)
 * End-to-end closing path — maps DEPLOY P2 FIRST_TENANT_LIVE_FLOW + GTM P1 validation
 */
import { FIRST_TENANT_LIVE_FLOW } from "@/lib/deploy/v80/deploy.first-tenant.spec";
import { REVENUE_VALIDATION_LOOP } from "./activation.validation-loop.spec";
import type { FirstDealExecutionStep } from "./execution.types";

export const FIRST_DEAL_EXECUTION_FLOW: FirstDealExecutionStep[] = [
  {
    id: "GTM-EXE-001",
    order: 1,
    phase: "tender",
    action: "AE identifies active RFP — provision PRO tenant for bid manager",
    apiRoute: "POST /api/v80/tenant/run",
    expectedOutcome: "{ organizationId, workspaceId, plan: PRO }",
    deployRef: "DEP-TNT-001",
    gtmRef: "GTM-FST-001",
    required: true,
  },
  {
    id: "GTM-EXE-002",
    order: 2,
    phase: "tender",
    action: "Confirm entitlements — full commercial loop unlocked",
    apiRoute: "GET /api/v80/entitlements?organizationId=",
    expectedOutcome: "tier=PRO; budgetGeneration+tenderPackage+proposalPdf=true",
    deployRef: "DEP-TNT-002",
    required: true,
  },
  {
    id: "GTM-EXE-003",
    order: 3,
    phase: "tender",
    action: "Submit live tender intake — customer's active RFP",
    apiRoute: "POST /api/v80/tender/intake",
    expectedOutcome: "{ tenderId, quoteId, status: draft }",
    deployRef: "DEP-TNT-003",
    gtmRef: "GTM-VAL-001",
    required: true,
  },
  {
    id: "GTM-EXE-004",
    order: 4,
    phase: "budget",
    action: "Calculate equipment budget — first billable event on demo call",
    apiRoute: "POST /api/v80/budget/calculate",
    expectedOutcome: "{ budgetId, totals.equipment > 0 }; BUDGET usage recorded",
    deployRef: "DEP-TNT-004",
    gtmRef: "GTM-VAL-002",
    required: true,
  },
  {
    id: "GTM-EXE-005",
    order: 5,
    phase: "pdf",
    action: "Deliver plan PDF to buyer stakeholder — value proof",
    apiRoute: "GET /api/v80/pdf?type=plan&projectId=",
    expectedOutcome: "application/pdf; bytes > 0",
    deployRef: "DEP-TNT-006",
    gtmRef: "GTM-VAL-003",
    required: true,
  },
  {
    id: "GTM-EXE-006",
    order: 6,
    phase: "pdf",
    action: "Run autopilot tender-pack — full response bundle",
    apiRoute: "POST /api/v80/autopilot/job/run",
    expectedOutcome: "status=completed; 8 steps; artifacts ≥ 3; TENDER ¢200",
    deployRef: "DEP-TNT-005",
    gtmRef: "GTM-VAL-005",
    required: true,
  },
  {
    id: "GTM-EXE-007",
    order: 7,
    phase: "pdf",
    action: "Render proposal PDF — client-ready deliverable for sign-off",
    apiRoute: "POST /api/v80/proposal-pdf/render",
    expectedOutcome: "{ artifactId, downloadUrl }; PDF chargeCents=25",
    deployRef: "DEP-TNT-007",
    gtmRef: "GTM-VAL-004",
    required: true,
  },
  {
    id: "GTM-EXE-008",
    order: 8,
    phase: "payment",
    action: "Close FitScale PRO subscription — $299/mo annual prepay offered",
    apiRoute: "POST /api/v80/budget/calculate",
    expectedOutcome: "Buyer accepts annual PRO; subscription invoice issued",
    gtmRef: "REV-OPT-YLD-008",
    required: true,
  },
  {
    id: "GTM-EXE-009",
    order: 9,
    phase: "payment",
    action: "Verify governance audit — entitlement trail proves delivery",
    apiRoute: "GET /api/v80/ops/governance/audit",
    expectedOutcome: "api.success + feature.access entries for org",
    deployRef: "DEP-TNT-008",
    gtmRef: "GTM-VAL-006",
    required: true,
  },
  {
    id: "GTM-EXE-010",
    order: 10,
    phase: "upgrade",
    action: "Metered usage compounds — upsell capacity or ENTERPRISE bridge at cap",
    apiRoute: "POST /api/v80/autopilot/job/run",
    expectedOutcome: "USAGE_LIMIT → capacity add-on or ENTERPRISE sales-assist",
    gtmRef: "REV-AUT-EXP-003",
    required: true,
  },
];

export function isFirstDealExecutionFlowComplete(): boolean {
  const deployIds = new Set(FIRST_TENANT_LIVE_FLOW.map((s) => s.id));
  const validationIds = new Set(REVENUE_VALIDATION_LOOP.map((v) => v.id));
  const phases = new Set(FIRST_DEAL_EXECUTION_FLOW.map((s) => s.phase));

  return (
    FIRST_DEAL_EXECUTION_FLOW.length === 10 &&
    phases.has("tender") &&
    phases.has("budget") &&
    phases.has("pdf") &&
    phases.has("payment") &&
    phases.has("upgrade") &&
    FIRST_DEAL_EXECUTION_FLOW.every((s, i) => s.order === i + 1) &&
    FIRST_DEAL_EXECUTION_FLOW.filter((s) => s.deployRef).every((s) => deployIds.has(s.deployRef!)) &&
    FIRST_DEAL_EXECUTION_FLOW.filter((s) => s.gtmRef?.startsWith("GTM-VAL")).length >= 5 &&
    validationIds.size >= 8
  );
}
