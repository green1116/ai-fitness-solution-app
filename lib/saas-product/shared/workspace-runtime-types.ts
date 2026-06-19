import type { ProductContext } from "./context-types";
import type { ProductCode, ProductDefinition } from "./product-types";

export const SAAS_PRODUCT_P3_TAG = "v49-saas-product-p3" as const;

export const WORKSPACE_PRODUCT_INSTANCE_STATUSES = ["draft", "active", "suspended", "archived"] as const;
export type WorkspaceProductInstanceStatus = (typeof WORKSPACE_PRODUCT_INSTANCE_STATUSES)[number];

export interface V47CustomerWorkspaceSkeleton {
  workspaceId: string;
  customerId: string;
  customerName?: string;
  projects: unknown[];
  history: unknown[];
  createdAt: number;
  updatedAt: number;
}

export interface V47CustomerWorkspaceMapping {
  v47WorkspaceId: string;
  customerId: string;
  customerName?: string;
  sku: ProductCode;
  saasWorkspaceId: string;
  tenantId: string;
}

export interface WorkspaceProductMetadata {
  portalType?: string;
  roleSystemCode?: string;
  organizationId?: string;
  createdByUserId?: string;
  [key: string]: string | undefined;
}

export interface WorkspaceProductInstance {
  workspaceProductId: string;
  tenantId: string;
  workspaceId: string;
  productCode: ProductCode;
  productDefinition: ProductDefinition;
  productContextSnapshot: ProductContext;
  v47CustomerWorkspaceMapping: V47CustomerWorkspaceMapping;
  status: WorkspaceProductInstanceStatus;
  createdAt: string;
  updatedAt: string;
  metadata: WorkspaceProductMetadata;
}

export interface CreateProductWorkspaceInput {
  context: ProductContext;
  status?: WorkspaceProductInstanceStatus;
  metadata?: WorkspaceProductMetadata;
}

export interface BindWorkspaceProductInput {
  context: ProductContext;
  workspaceProductId: string;
  status?: WorkspaceProductInstanceStatus;
}

export interface SaasProductP3Validation {
  valid: boolean;
  summary: string;
}
