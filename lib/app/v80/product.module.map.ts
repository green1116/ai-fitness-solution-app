/**
 * V80 APP P1 — Product module map (V80 kernel → SaaS modules)
 */
import { SYSTEM_CLOSURE_CATALOG } from "@/lib/system/v80/system.closure.catalog";
import type { ProductModuleEntry } from "./product.compiler";

export const PRODUCT_MODULE_MAP: ProductModuleEntry[] = [
  {
    id: "APP-MOD-001",
    kernelPhase: "P1",
    closureRef: "SYS-CLS-001",
    saasModule: "enterprise-saas",
    prismaDomain: "Tenant, User, Workspace",
    nextSurface: "app/api/enterprise-saas/**",
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    required: true,
    description: "Ontology → multi-tenant SaaS foundation (gym operator accounts)",
  },
  {
    id: "APP-MOD-002",
    kernelPhase: "P2",
    closureRef: "SYS-CLS-002",
    saasModule: "commercial-v64 + entitlements",
    prismaDomain: "Subscription, PlanFeature, UsageLedger",
    nextSurface: "app/api/entitlements/**, lib/commercial/v64/**",
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    required: true,
    description: "Policy → tier entitlements, RBAC, feature gates",
  },
  {
    id: "APP-MOD-003",
    kernelPhase: "P3",
    closureRef: "SYS-CLS-003",
    saasModule: "autopilot-workflow",
    prismaDomain: "AutopilotJob, WorkflowRun",
    nextSurface: "app/api/autopilot/**, lib/autopilot/workflow/**",
    tiers: ["PRO", "ENTERPRISE"],
    required: true,
    description: "Simulation → tender→proposal→PDF dry-run workflow paths",
  },
  {
    id: "APP-MOD-004",
    kernelPhase: "P4",
    closureRef: "SYS-CLS-004",
    saasModule: "production-integrity + launch",
    prismaDomain: "AuditLog, LaunchChecklist",
    nextSurface: "app/api/production/integrity/**, app/api/launch/**",
    tiers: ["ENTERPRISE"],
    required: true,
    description: "Integrity → drift/consistency gates before go-live",
  },
  {
    id: "APP-MOD-005",
    kernelPhase: "P5",
    closureRef: "SYS-CLS-006",
    saasModule: "portal-pilot + commercial-freeze",
    prismaDomain: "PilotProgram, CommercialSnapshot",
    nextSurface: "app/api/pilot/**, lib/portal/v62/**",
    tiers: ["PRO", "ENTERPRISE"],
    required: true,
    description: "Closure seal → pilot ops + commercial freeze manifest",
  },
  {
    id: "APP-MOD-006",
    kernelPhase: "P1-P5",
    closureRef: "SYS-CLS-005",
    saasModule: "proposal-pdf + budget-pdf + plan-pdf",
    prismaDomain: "TenderProject, BudgetRecord, DocumentArtifact",
    nextSurface: "app/api/proposal-pdf/**, app/api/pdf/**, lib/pdf/**",
    tiers: ["BASIC", "PRO", "ENTERPRISE"],
    required: true,
    description: "Stack completeness → core PDF product outputs (gym/budget/tender)",
  },
];

export function isProductModuleMapComplete(): boolean {
  const closureIds = new Set(SYSTEM_CLOSURE_CATALOG.map((c) => c.id));
  const phases = new Set(PRODUCT_MODULE_MAP.map((m) => m.kernelPhase));
  return (
    PRODUCT_MODULE_MAP.length === 6 &&
    PRODUCT_MODULE_MAP.every((m) => closureIds.has(m.closureRef)) &&
    phases.has("P1") &&
    phases.has("P5")
  );
}

export function getProductModuleByClosureRef(closureRef: string): ProductModuleEntry | undefined {
  return PRODUCT_MODULE_MAP.find((m) => m.closureRef === closureRef);
}
