import type { ProductCode } from "./product-types";
import type { V47CustomerWorkspaceMapping } from "./workspace-runtime-types";

export const SAAS_PRODUCT_P4_TAG = "v49-saas-product-p4" as const;

export const WORKFLOW_TYPES = ["QUOTE", "APPROVAL", "DELIVERY", "RELEASE"] as const;
export type WorkflowType = (typeof WORKFLOW_TYPES)[number];

export const WORKFLOW_EVENT_TYPES = [
  "WORKFLOW_CREATED",
  "STATE_CHANGED",
  "WORKFLOW_RELEASED",
] as const;
export type WorkflowEventType = (typeof WORKFLOW_EVENT_TYPES)[number];

export interface WorkflowHistoryEntry {
  fromState: string;
  toState: string;
  timestamp: string;
  actor: string;
  reason?: string;
}

export interface WorkflowInstance {
  workflowId: string;
  workspaceProductId: string;
  workflowType: WorkflowType;
  currentState: string;
  history: WorkflowHistoryEntry[];
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, string | undefined>;
}

export interface WorkflowEvent {
  eventId: string;
  eventType: WorkflowEventType;
  workflowId: string;
  workspaceProductId: string;
  workflowType: WorkflowType;
  fromState?: string;
  toState?: string;
  actor?: string;
  reason?: string;
  timestamp: string;
}

export interface CommercialAdapterWorkflowContext {
  tenantId: string;
  workspaceId: string;
  organizationId?: string;
  userId: string;
  workspaceProductId: string;
  workflowId: string;
  workflowType: WorkflowType;
  currentState: string;
  productCode: ProductCode;
  v47Module: string;
  v47CustomerWorkspaceMapping: V47CustomerWorkspaceMapping;
}

export interface TransitionWorkflowInput {
  workflowId: string;
  toState: string;
  actor: string;
  reason?: string;
}

export interface SaasProductP4Validation {
  valid: boolean;
  summary: string;
}
