/**
 * V80 CODE P1 — Scaffold module registry
 */
import { V80_PRISMA_SKELETON_PATH } from "./scaffold.prisma";
import type { ScaffoldModuleStub } from "./scaffold.types";

export const SCAFFOLD_MODULE_REGISTRY: ScaffoldModuleStub[] = [
  { id: "SCF-MOD-001", path: "lib/scaffold/v80/services/tenant.service.ts", exportName: "provisionTenant", apiRef: "BLP-API-001", kind: "service" },
  { id: "SCF-MOD-002", path: "lib/scaffold/v80/services/entitlement.service.ts", exportName: "resolveEntitlements", apiRef: "BLP-API-002", kind: "service" },
  { id: "SCF-MOD-003", path: "lib/scaffold/v80/services/budget.service.ts", exportName: "calculateBudgetScaffold", apiRef: "BLP-API-003", kind: "service" },
  { id: "SCF-MOD-004", path: "lib/scaffold/v80/services/tender-intake.service.ts", exportName: "createTenderFromIntake", apiRef: "BLP-API-005", kind: "service" },
  { id: "SCF-MOD-005", path: "lib/scaffold/v80/workflow/runner.service.ts", exportName: "enqueueWorkflowJob", apiRef: "BLP-API-004", kind: "workflow" },
  { id: "SCF-MOD-006", path: "lib/scaffold/v80/workflow/dag.registry.ts", exportName: "TENDER_PACK_DAG", apiRef: "BLP-WFL-001", kind: "workflow" },
  { id: "SCF-MOD-007", path: "lib/scaffold/v80/pdf/plan.render.ts", exportName: "renderPlanPdfScaffold", apiRef: "BLP-PDF-001", kind: "pdf" },
  { id: "SCF-MOD-008", path: "lib/scaffold/v80/pdf/budget.render.ts", exportName: "renderBudgetPdfScaffold", apiRef: "BLP-PDF-002", kind: "pdf" },
  { id: "SCF-MOD-009", path: "lib/scaffold/v80/pdf/proposal.render.ts", exportName: "renderProposalPdfScaffold", apiRef: "BLP-PDF-003", kind: "pdf" },
  { id: "SCF-MOD-010", path: "lib/scaffold/v80/pdf/bundle.merge.ts", exportName: "mergePdfBundleScaffold", apiRef: "BLP-PDF-004", kind: "pdf" },
  { id: "SCF-MOD-011", path: "lib/scaffold/v80/routes/tenant-run.route.ts", exportName: "POST", apiRef: "BLP-API-001", kind: "route" },
  { id: "SCF-MOD-012", path: "lib/scaffold/v80/routes/entitlements.route.ts", exportName: "GET", apiRef: "BLP-API-002", kind: "route" },
  { id: "SCF-MOD-013", path: "lib/scaffold/v80/routes/budget-calculate.route.ts", exportName: "POST", apiRef: "BLP-API-003", kind: "route" },
  { id: "SCF-MOD-014", path: "lib/scaffold/v80/routes/autopilot-job.route.ts", exportName: "POST", apiRef: "BLP-API-004", kind: "route" },
  { id: "SCF-MOD-015", path: "lib/scaffold/v80/routes/tender-intake.route.ts", exportName: "POST", apiRef: "BLP-API-005", kind: "route" },
  { id: "SCF-MOD-016", path: "lib/scaffold/v80/routes/integrity.route.ts", exportName: "GET", apiRef: "BLP-API-006", kind: "route" },
  { id: "SCF-MOD-017", path: "lib/scaffold/v80/routes/proposal-pdf.route.ts", exportName: "POST", apiRef: "BLP-API-007", kind: "route" },
  { id: "SCF-MOD-018", path: "lib/scaffold/v80/routes/pdf-gateway.route.ts", exportName: "GET", apiRef: "BLP-API-008", kind: "route" },
  { id: "SCF-MOD-019", path: V80_PRISMA_SKELETON_PATH, exportName: "v80Entities", apiRef: "BLP-REL-*", kind: "service" },
];

export function isScaffoldModuleRegistryComplete(): boolean {
  const routes = SCAFFOLD_MODULE_REGISTRY.filter((m) => m.kind === "route");
  return SCAFFOLD_MODULE_REGISTRY.length === 19 && routes.length === 8;
}

export function getScaffoldModulesByKind(kind: ScaffoldModuleStub["kind"]) {
  return SCAFFOLD_MODULE_REGISTRY.filter((m) => m.kind === kind);
}
