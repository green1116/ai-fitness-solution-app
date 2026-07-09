/**
 * V80 APP P2 — Folder structure spec (Next.js / lib / api / prisma / pdf / workflow)
 */
import { PRODUCT_MODULE_MAP } from "./product.module.map";
import type { EngineeringFolderEntry } from "./engineering.types";

export const ENGINEERING_FOLDER_STRUCTURE: EngineeringFolderEntry[] = [
  {
    id: "ENG-FLD-001",
    kind: "app",
    path: "app/(dashboard)/",
    productModuleRef: "APP-MOD-004",
    required: true,
    description: "Dashboard UI — operations + integrity views",
  },
  {
    id: "ENG-FLD-002",
    kind: "api",
    path: "app/api/enterprise-saas/",
    productModuleRef: "APP-MOD-001",
    apiRef: "APP-API-001",
    required: true,
    description: "SaaS tenant API routes",
  },
  {
    id: "ENG-FLD-003",
    kind: "api",
    path: "app/api/budget/ | app/api/entitlements/",
    productModuleRef: "APP-MOD-002",
    apiRef: "APP-API-002",
    required: true,
    description: "Commercial + entitlement API routes",
  },
  {
    id: "ENG-FLD-004",
    kind: "api",
    path: "app/api/tender/ | app/api/autopilot/",
    productModuleRef: "APP-MOD-003",
    apiRef: "APP-API-004",
    required: true,
    description: "Tender intake + workflow orchestration routes",
  },
  {
    id: "ENG-FLD-005",
    kind: "lib",
    path: "lib/commercial/v64/ | lib/feature-flags/ | lib/saas/",
    productModuleRef: "APP-MOD-002",
    required: true,
    description: "Commercial policy + entitlement engines",
  },
  {
    id: "ENG-FLD-006",
    kind: "workflow",
    path: "lib/autopilot/workflow/",
    productModuleRef: "APP-MOD-003",
    required: true,
    description: "Workflow DAG builders + step registry",
  },
  {
    id: "ENG-FLD-007",
    kind: "pdf",
    path: "lib/pdf/budget/ | lib/pdf/renderBudgetPdf.ts | lib/pdf/tender/",
    productModuleRef: "APP-MOD-006",
    apiRef: "APP-API-008",
    required: true,
    description: "pdf-lib render pipeline — budget/plan/proposal",
  },
  {
    id: "ENG-FLD-008",
    kind: "prisma",
    path: "prisma/schema.prisma | prisma/patches/",
    productModuleRef: "APP-MOD-001",
    required: true,
    description: "Prisma schema + idempotent domain patches",
  },
];

export function isEngineeringFolderStructureComplete(): boolean {
  const kinds = new Set(ENGINEERING_FOLDER_STRUCTURE.map((f) => f.kind));
  const moduleRefs = new Set(PRODUCT_MODULE_MAP.map((m) => m.id));
  return (
    ENGINEERING_FOLDER_STRUCTURE.length === 8 &&
    kinds.has("app") &&
    kinds.has("api") &&
    kinds.has("lib") &&
    kinds.has("pdf") &&
    kinds.has("prisma") &&
    kinds.has("workflow") &&
    ENGINEERING_FOLDER_STRUCTURE.every((f) => moduleRefs.has(f.productModuleRef))
  );
}

export function getEngineeringFoldersByKind(
  kind: EngineeringFolderEntry["kind"],
): EngineeringFolderEntry[] {
  return ENGINEERING_FOLDER_STRUCTURE.filter((f) => f.kind === kind);
}
