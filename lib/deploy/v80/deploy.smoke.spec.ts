/**
 * V80 DEPLOY P2 — Smoke test suite (critical API + workflow + PDF)
 */
import { buildV80DeploymentBinding } from "@/lib/scaffold/v80/ops/deployment.model";
import type { SmokeTestCase } from "./cutover.types";

const routes = buildV80DeploymentBinding().routes;

export const SMOKE_TEST_SUITE: SmokeTestCase[] = [
  {
    id: "DEP-SMK-001",
    category: "ops",
    name: "health probe",
    routeOrFn: "GET /api/v80/ops/health",
    assert: "ok=true, persistence mode reported",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-002",
    category: "api",
    name: "tenant provision",
    routeOrFn: "provisionTenant()",
    assert: "organizationId + workspaceId returned",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-003",
    category: "api",
    name: "entitlements",
    routeOrFn: "resolveEntitlements()",
    assert: "features + limits populated",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-004",
    category: "api",
    name: "tender intake",
    routeOrFn: "createTenderFromIntake()",
    assert: "tenderId + quoteId",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-005",
    category: "api",
    name: "budget calculate",
    routeOrFn: "calculateBudgetScaffold()",
    assert: "budgetId + totals",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-006",
    category: "workflow",
    name: "tender-pack-complete",
    routeOrFn: "enqueueWorkflowJob()",
    assert: "status=completed, all steps completed",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-007",
    category: "pdf",
    name: "proposal render",
    routeOrFn: "renderProposalPdfScaffold()",
    assert: "PDFDocument pageCount >= 1",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-008",
    category: "pdf",
    name: "artifact persist",
    routeOrFn: "v80Persist.listArtifactsByProject()",
    assert: "artifacts.length >= 3",
    critical: true,
    required: true,
  },
  {
    id: "DEP-SMK-009",
    category: "ops",
    name: "metrics snapshot",
    routeOrFn: "GET /api/v80/ops/metrics",
    assert: "metrics.endpoints populated after requests",
    critical: false,
    required: true,
  },
  {
    id: "DEP-SMK-010",
    category: "billing",
    name: "commercial gate PRO",
    routeOrFn: "enforceV80CommercialGate()",
    assert: "BASIC blocked on budget; PRO allowed",
    critical: true,
    required: true,
  },
  ...routes.slice(0, 3).map(
    (route, i): SmokeTestCase => ({
      id: `DEP-SMK-RT-${String(i + 1).padStart(2, "0")}`,
      category: "api",
      name: `route registered ${route}`,
      routeOrFn: route,
      assert: "route in deployment binding",
      critical: false,
      required: true,
    }),
  ),
];

export function isSmokeSuiteComplete(): boolean {
  const cats = new Set(SMOKE_TEST_SUITE.map((t) => t.category));
  const critical = SMOKE_TEST_SUITE.filter((t) => t.critical);
  return (
    SMOKE_TEST_SUITE.length >= 10 &&
    cats.has("api") &&
    cats.has("workflow") &&
    cats.has("pdf") &&
    cats.has("billing") &&
    critical.length >= 7
  );
}

export function getCriticalSmokeTests() {
  return SMOKE_TEST_SUITE.filter((t) => t.critical);
}
