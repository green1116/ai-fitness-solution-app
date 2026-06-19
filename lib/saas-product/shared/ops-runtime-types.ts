import type { WorkspaceProductInstanceStatus } from "./workspace-runtime-types";

export const SAAS_PRODUCT_P7_TAG = "v49-saas-product-p7" as const;

export const PRODUCT_HEALTH_LEVELS = ["HEALTHY", "WARNING", "CRITICAL"] as const;
export type ProductHealthLevel = (typeof PRODUCT_HEALTH_LEVELS)[number];

export const HEALTH_FINDING_LEVELS = ["INFO", "WARNING", "CRITICAL"] as const;
export type HealthFindingLevel = (typeof HEALTH_FINDING_LEVELS)[number];

export const OPS_LIFECYCLE_STATES = ["DRAFT", "ACTIVE", "SUSPENDED", "ARCHIVED"] as const;
export type OpsLifecycleState = (typeof OPS_LIFECYCLE_STATES)[number];

export const HEALTH_CHECK_CODES = [
  "WORKFLOW_STUCK",
  "MISSING_APPROVAL",
  "MISSING_DELIVERY",
  "MISSING_RELEASE",
  "INACTIVE_PRODUCT",
  "ORPHAN_WORKFLOW",
] as const;
export type HealthCheckCode = (typeof HEALTH_CHECK_CODES)[number];

export interface HealthFinding {
  code: HealthCheckCode;
  level: HealthFindingLevel;
  message: string;
  workspaceProductId?: string;
  workflowId?: string;
}

export interface WorkflowMetrics {
  workflowCount: number;
  quoteCount: number;
  approvalCount: number;
  deliveryCount: number;
  releaseCount: number;
  completionRate: number;
  activeWorkflowCount: number;
}

export interface WorkspaceMetrics {
  workspaceProductCount: number;
  activeCount: number;
  suspendedCount: number;
  archivedCount: number;
  draftCount: number;
}

export interface LifecycleSummary {
  currentState: OpsLifecycleState;
  workspaceProductId: string;
  status: WorkspaceProductInstanceStatus;
  lastUpdatedAt: string;
}

export interface PortalOpsSummary {
  productCode: string;
  workspaceProductId: string;
  routeCount: number;
  canCreateQuote: boolean;
  canApprove: boolean;
  canDeliver: boolean;
  canRelease: boolean;
}

export interface ProductOpsMetadata {
  tag: typeof SAAS_PRODUCT_P7_TAG;
  workspaceProductId: string;
  tenantId: string;
  workspaceId: string;
  composedAt: string;
}

export interface ProductOpsDashboard {
  health: ProductHealthLevel;
  healthFindings: HealthFinding[];
  workflowMetrics: WorkflowMetrics;
  workspaceMetrics: WorkspaceMetrics;
  lifecycleSummary: LifecycleSummary;
  portalSummary: PortalOpsSummary;
  metadata: ProductOpsMetadata;
}

export interface ProductOpsRuntimeView {
  dashboard: ProductOpsDashboard;
  workspaceProductId: string;
  tenantId: string;
  workspaceId: string;
  tag: typeof SAAS_PRODUCT_P7_TAG;
}

export interface BuildProductOpsRuntimeInput {
  tenantContext: import("@/lib/saas-runtime/tenant-context/context-types").TenantContext;
  workspaceProductId: string;
}

export interface SaasProductP7Validation {
  valid: boolean;
  summary: string;
}

export function mapStatusToOpsLifecycle(status: WorkspaceProductInstanceStatus): OpsLifecycleState {
  switch (status) {
    case "draft":
      return "DRAFT";
    case "active":
      return "ACTIVE";
    case "suspended":
      return "SUSPENDED";
    case "archived":
      return "ARCHIVED";
    default:
      return "DRAFT";
  }
}
