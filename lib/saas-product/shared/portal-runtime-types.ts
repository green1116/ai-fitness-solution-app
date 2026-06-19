import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import type { ProductContext } from "./context-types";
import type { ProductCode } from "./product-types";
import type { WorkspaceProductInstance } from "./workspace-runtime-types";
import type { WorkflowInstance, WorkflowType } from "./workflow-runtime-types";

export const SAAS_PRODUCT_P6_TAG = "v49-saas-product-p6" as const;

export const PORTAL_ROUTE_TYPES = ["workspace", "product", "workflow"] as const;
export type PortalRouteType = (typeof PORTAL_ROUTE_TYPES)[number];

export interface PortalContextSource {
  resolver: "resolvePortalContext";
  portalRuntimeVersion: typeof SAAS_PRODUCT_P6_TAG;
  resolvedAt: string;
}

export interface PortalContext {
  tenantId: string;
  workspaceId: string;
  userId: string;
  portalType: PortalType;
  productContext?: ProductContext;
  workspaceProducts: WorkspaceProductInstance[];
  workflows: WorkflowInstance[];
  source: PortalContextSource;
}

export interface PortalProductView {
  workspaceProductId: string;
  productCode: ProductCode;
  displayName: string;
  status: WorkspaceProductInstance["status"];
  tenantId: string;
  workspaceId: string;
  workflowStageCount: number;
  permissionCount: number;
}

export interface PortalWorkspaceView {
  workspaceId: string;
  tenantId: string;
  productCount: number;
  activeProductCount: number;
  products: PortalProductView[];
}

export interface PortalWorkflowSummary {
  workflowId: string;
  workspaceProductId: string;
  workflowType: WorkflowType;
  currentState: string;
  historyLength: number;
  updatedAt: string;
}

export interface PortalWorkflowView {
  workspaceProductId?: string;
  instances: PortalWorkflowSummary[];
  byType: Partial<Record<WorkflowType, PortalWorkflowSummary>>;
}

export interface PortalCapabilities {
  canCreateQuote: boolean;
  canApprove: boolean;
  canDeliver: boolean;
  canRelease: boolean;
  reasons: {
    canCreateQuote?: string;
    canApprove?: string;
    canDeliver?: string;
    canRelease?: string;
  };
}

export interface PortalRouteEntry {
  pattern: string;
  routeType: PortalRouteType;
  paramName: string;
  logicalPath: string;
}

export interface PortalRoutingMap {
  routes: PortalRouteEntry[];
}

export interface PortalMetadata {
  tag: typeof SAAS_PRODUCT_P6_TAG;
  tenantId: string;
  workspaceId: string;
  workspaceProductCount: number;
  workflowCount: number;
  composedAt: string;
}

export interface PortalViewModel {
  productView: PortalProductView;
  workspaceView: PortalWorkspaceView;
  workflowView: PortalWorkflowView;
  capabilities: PortalCapabilities;
  routingMap: PortalRoutingMap;
  metadata: PortalMetadata;
}

export interface PortalModel {
  context: PortalContext;
  primaryWorkspaceProduct?: WorkspaceProductInstance;
  workflowByType: Partial<Record<WorkflowType, WorkflowInstance>>;
}

export interface PortalRouteResolution {
  routeType: PortalRouteType | "unknown";
  path: string;
  params: Record<string, string>;
  matched: boolean;
  workspaceId?: string;
  workspaceProductId?: string;
  workflowId?: string;
}

export interface ResolvePortalContextInput {
  tenantContext: import("@/lib/saas-runtime/tenant-context/context-types").TenantContext;
  productCode?: ProductCode;
  workspaceProductId?: string;
}

export interface SaasProductP6Validation {
  valid: boolean;
  summary: string;
}
