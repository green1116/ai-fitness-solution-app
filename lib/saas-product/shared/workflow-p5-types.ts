import type { CommercialAdapterWorkflowContext, WorkflowType } from "./workflow-runtime-types";

export const SAAS_PRODUCT_P5_TAG = "v49-saas-product-p5" as const;

export const WORKFLOW_P5_EVENT_TYPES = [
  "WORKFLOW_DEPENDENCY_SATISFIED",
  "WORKFLOW_DEPENDENCY_DENIED",
  "BUSINESS_PROCESS_READY",
] as const;

export type WorkflowP5EventType = (typeof WORKFLOW_P5_EVENT_TYPES)[number];

export interface WorkflowP5Event {
  eventId: string;
  eventType: WorkflowP5EventType;
  workspaceProductId: string;
  workflowType: WorkflowType;
  workflowId?: string;
  detail?: string;
  timestamp: string;
}

export interface BusinessProcessAdapterContext {
  workspaceProductId: string;
  tenantId: string;
  productCode: string;
  quote?: CommercialAdapterWorkflowContext;
  approval?: CommercialAdapterWorkflowContext;
  delivery?: CommercialAdapterWorkflowContext;
  release?: CommercialAdapterWorkflowContext;
}

export interface WorkflowDependencyRule {
  workflowType: WorkflowType;
  requiresType: WorkflowType;
  requiresState: string;
}

export interface SaasProductP5Validation {
  valid: boolean;
  summary: string;
}
