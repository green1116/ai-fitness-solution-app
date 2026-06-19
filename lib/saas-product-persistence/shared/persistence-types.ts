import { SAAS_PRODUCT_PERSISTENCE_P1_TAG } from "./persistence-constants";

export type WorkflowType = "QUOTE";

export type WorkflowState = "CREATED" | "APPROVED" | "REJECTED";

export type EventType = "WORKFLOW_CREATED" | "STATE_CHANGED" | "WORKFLOW_RELEASED";

export type WorkspaceStatus = "ACTIVE" | "ARCHIVED";

export type QuoteStatus = "DRAFT" | "APPROVED" | "REJECTED";

export interface PersistenceP1Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceSchemaMeta {
  tag: typeof SAAS_PRODUCT_PERSISTENCE_P1_TAG;
  tables: readonly string[];
  scope: readonly string[];
}
