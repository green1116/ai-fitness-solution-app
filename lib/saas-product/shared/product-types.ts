import type { PortalType } from "@/lib/saas-portal/shared/portal-types";

export const SAAS_PRODUCT_P1_TAG = "v49-saas-product-p1" as const;
export const SAAS_PRODUCT_VERSION = "v49-saas-product-p1" as const;

export const PRODUCT_CODES = [
  "kickstart-package",
  "tender-ready-package",
  "delivery-intelligence-package",
] as const;

export type ProductCode = (typeof PRODUCT_CODES)[number];

export type WorkspaceProductStatus = "draft" | "active" | "archived";

export interface ProductDefinition {
  productCode: ProductCode;
  displayName: string;
  v47Sku: ProductCode;
  workflowKeys: string[];
  portalTypes: PortalType[];
  requiredFeatures: string[];
}

export interface WorkflowStageDefinition {
  workflowKey: string;
  stages: string[];
  v47Module: string;
  requiredPermissions: string[];
  requiredFeature: string;
}

export interface WorkspaceProductBinding {
  saasWorkspaceId: string;
  productCode: ProductCode;
  v47ProjectId?: string;
  status: WorkspaceProductStatus;
}

export interface SaasProductP1Validation {
  valid: boolean;
  productCount: number;
  workflowCount: number;
  v47SkuAligned: boolean;
  boundaryClean: boolean;
  summary: string;
}
