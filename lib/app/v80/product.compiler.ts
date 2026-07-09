/**
 * V80 APP P1 — System-to-product compiler types (design/spec only)
 */
import type { SystemVersionLock } from "@/lib/system/v80/system.closure";

export const V80_APP_PRODUCT_COMPILER_VERSION = "v80-app-product-compiler-1" as const;
export const V80_APP_PRODUCT_COMPILER_FREEZE_VERSION =
  "v80-app-product-compiler-freeze-1" as const;

export type ProductSaasPlan = "BASIC" | "PRO" | "ENTERPRISE";

export type ProductModuleEntry = {
  id: string;
  kernelPhase: string;
  closureRef: string;
  saasModule: string;
  prismaDomain: string;
  nextSurface: string;
  tiers: ProductSaasPlan[];
  required: boolean;
  description: string;
};

export type ProductApiEntry = {
  id: string;
  kernelRef: string;
  route: string;
  method: string;
  saasModule: string;
  entitlement: string;
  prismaModels: string[];
  required: boolean;
  description: string;
};

export type ProductWorkflowEntry = {
  id: string;
  kernelRef: string;
  workflowKey: string;
  steps: string[];
  domain: "gym" | "budget" | "pdf" | "enterprise";
  apiRoutes: string[];
  pdfOutputs: string[];
  required: boolean;
  description: string;
};

export type ProductOutputEntry = {
  id: string;
  outputKind: "pdf" | "dashboard" | "report" | "api";
  artifact: string;
  route: string;
  workflowRef: string;
  tier: ProductSaasPlan;
  required: boolean;
  description: string;
};

export type ProductCompilerManifest = {
  version: typeof V80_APP_PRODUCT_COMPILER_VERSION;
  kernelSeal: string;
  moduleCount: number;
  apiCount: number;
  workflowCount: number;
  outputCount: number;
  compilerComplete: boolean;
  summary: string;
};

export type ProductCompilerReport = {
  version: typeof V80_APP_PRODUCT_COMPILER_VERSION;
  freezeVersion: typeof V80_APP_PRODUCT_COMPILER_FREEZE_VERSION;
  reportId: string;
  generatedId: string;
  kernelVersionLock: SystemVersionLock;
  kernelSealed: boolean;
  manifest: ProductCompilerManifest;
  modules: ProductModuleEntry[];
  apis: ProductApiEntry[];
  workflows: ProductWorkflowEntry[];
  outputs: ProductOutputEntry[];
  compilerReady: boolean;
  readinessScore: number;
  summary: string;
};
