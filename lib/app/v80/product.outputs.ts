/**
 * V80 APP P1 — Core product outputs (PDF, dashboard, reports, APIs)
 */
import { PRODUCT_WORKFLOW_MAP } from "./product.workflow.map";
import type { ProductOutputEntry } from "./product.compiler";

export const PRODUCT_OUTPUT_CATALOG: ProductOutputEntry[] = [
  {
    id: "APP-OUT-001",
    outputKind: "pdf",
    artifact: "proposal-pdf",
    route: "/api/proposal-pdf/render",
    workflowRef: "APP-WFL-004",
    tier: "PRO",
    required: true,
    description: "Branded proposal PDF — tender response document",
  },
  {
    id: "APP-OUT-002",
    outputKind: "pdf",
    artifact: "budget-pdf",
    route: "/api/pdf?type=budget",
    workflowRef: "APP-WFL-003",
    tier: "PRO",
    required: true,
    description: "Budget PDF — brand 2-page or government 4-6 page",
  },
  {
    id: "APP-OUT-003",
    outputKind: "pdf",
    artifact: "plan-pdf",
    route: "/api/pdf?type=plan",
    workflowRef: "APP-WFL-002",
    tier: "BASIC",
    required: true,
    description: "Fitness floor plan PDF — gym layout deliverable",
  },
  {
    id: "APP-OUT-004",
    outputKind: "dashboard",
    artifact: "operations-dashboard",
    route: "/api/dashboard/overview",
    workflowRef: "APP-WFL-005",
    tier: "ENTERPRISE",
    required: true,
    description: "Operations dashboard — tenant health + usage",
  },
  {
    id: "APP-OUT-005",
    outputKind: "dashboard",
    artifact: "proposal-pdf-dashboard",
    route: "/api/proposal-pdf/dashboard/run",
    workflowRef: "APP-WFL-004",
    tier: "PRO",
    required: true,
    description: "Proposal PDF builder dashboard — section preview",
  },
  {
    id: "APP-OUT-006",
    outputKind: "report",
    artifact: "tender-response-pack",
    route: "/api/tender-response-pack/report/run",
    workflowRef: "APP-WFL-006",
    tier: "ENTERPRISE",
    required: true,
    description: "Tender response pack report — full enterprise bundle",
  },
  {
    id: "APP-OUT-007",
    outputKind: "report",
    artifact: "integrity-report",
    route: "/api/production/integrity",
    workflowRef: "APP-WFL-005",
    tier: "ENTERPRISE",
    required: true,
    description: "Production integrity report — drift/consistency status",
  },
  {
    id: "APP-OUT-008",
    outputKind: "api",
    artifact: "entitlements-api",
    route: "/api/entitlements",
    workflowRef: "APP-WFL-001",
    tier: "BASIC",
    required: true,
    description: "Entitlements API — programmatic tier/capability lookup",
  },
];

export function isProductOutputCatalogComplete(): boolean {
  const kinds = new Set(PRODUCT_OUTPUT_CATALOG.map((o) => o.outputKind));
  const workflowIds = new Set(PRODUCT_WORKFLOW_MAP.map((w) => w.id));
  return (
    PRODUCT_OUTPUT_CATALOG.length === 8 &&
    kinds.has("pdf") &&
    kinds.has("dashboard") &&
    kinds.has("report") &&
    kinds.has("api") &&
    PRODUCT_OUTPUT_CATALOG.every((o) => workflowIds.has(o.workflowRef))
  );
}

export function getProductOutputsByKind(
  kind: ProductOutputEntry["outputKind"],
): ProductOutputEntry[] {
  return PRODUCT_OUTPUT_CATALOG.filter((o) => o.outputKind === kind);
}
