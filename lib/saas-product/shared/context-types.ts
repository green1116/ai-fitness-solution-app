import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import type {
  ProductCode,
  ProductDefinition,
  WorkflowStageDefinition,
  WorkspaceProductBinding,
} from "./product-types";

export const SAAS_PRODUCT_P2_TAG = "v49-saas-product-p2" as const;

export interface TenantProductContext {
  userId: string;
  tenantId: string;
  organizationId?: string;
  portalType: PortalType;
  roleSystemCode?: string;
  membershipId?: string;
}

export interface WorkspaceProductContext {
  workspaceId: string;
  workspaceBinding: WorkspaceProductBinding;
}

export interface V47ModuleMapping {
  productModule: string;
  workflowModules: Record<string, string>;
}

export interface ProductFeatureFlags {
  required: Record<string, boolean>;
  enabled: Record<string, boolean>;
}

export interface ProductContextSource {
  tenantContextVersion: "v48-saas-runtime-p2";
  productRegistryVersion: "v49-saas-product-p1";
  resolver: "resolveProductContext";
  resolvedAt: string;
}

export interface ProductContext {
  tenantId: string;
  organizationId?: string;
  workspaceId: string;
  userId: string;
  portalType: PortalType;
  roleSystemCode?: string;
  productCode: ProductCode;
  productDefinition: ProductDefinition;
  workflowStages: WorkflowStageDefinition[];
  workspaceBinding: WorkspaceProductBinding;
  v47ModuleMapping: V47ModuleMapping;
  permissions: string[];
  featureFlags: ProductFeatureFlags;
  source: ProductContextSource;
}

export interface SaasProductP2Validation {
  valid: boolean;
  summary: string;
}
