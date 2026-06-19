import {
  SAAS_PRODUCT_PERSISTENCE_P1_TAG,
  SAAS_PRODUCT_PERSISTENCE_P2_TAG,
  type PERSISTENCE_BACKENDS,
} from "./persistence-constants";

export type WorkflowType = "QUOTE";

export type WorkflowState = "CREATED" | "APPROVED" | "REJECTED";

export type EventType = "WORKFLOW_CREATED" | "STATE_CHANGED" | "WORKFLOW_RELEASED";

export type WorkspaceStatus = "ACTIVE" | "ARCHIVED";

export type QuoteStatus = "DRAFT" | "APPROVED" | "REJECTED" | "ARCHIVED";

export interface WorkspaceRecord {
  id: string;
  tenantId: string;
  name: string;
  status: WorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteRecord {
  id: string;
  workspaceId: string;
  tenantId: string;
  title: string;
  status: QuoteStatus;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowRecord {
  id: string;
  workspaceId: string;
  quoteId?: string;
  workflowType: WorkflowType;
  currentState: WorkflowState;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowHistoryRecord {
  id: string;
  workflowId: string;
  fromState: string;
  toState: string;
  actor?: string;
  reason?: string;
  createdAt: string;
}

export interface WorkflowEventRecord {
  id: string;
  workflowId: string;
  eventType: EventType;
  fromState?: string;
  toState?: string;
  actor?: string;
  reason?: string;
  createdAt: string;
}

export interface CreateWorkspaceInput {
  tenantId: string;
  name: string;
  status?: WorkspaceStatus;
}

export interface UpdateWorkspaceInput {
  name?: string;
  status?: WorkspaceStatus;
}

export interface CreateQuoteInput {
  workspaceId: string;
  tenantId: string;
  title: string;
  status?: QuoteStatus;
  metadata?: Record<string, unknown>;
}

export interface UpdateQuoteInput {
  title?: string;
  status?: QuoteStatus;
  metadata?: Record<string, unknown>;
}

export interface CreateWorkflowInput {
  workspaceId: string;
  tenantId: string;
  quoteId?: string;
  workflowType: WorkflowType;
  currentState?: WorkflowState;
  metadata?: Record<string, unknown>;
}

export interface UpdateWorkflowStateInput {
  workflowId: string;
  tenantId: string;
  toState: WorkflowState;
}

export interface AppendWorkflowHistoryInput {
  workflowId: string;
  tenantId: string;
  fromState: string;
  toState: string;
  actor?: string;
  reason?: string;
}

export interface AppendWorkflowEventInput {
  workflowId: string;
  tenantId: string;
  eventType: EventType;
  fromState?: string;
  toState?: string;
  actor?: string;
  reason?: string;
}

export interface PersistenceP1Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP2Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP3Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP4Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP5Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP6Validation {
  valid: boolean;
  summary: string;
}

export interface PersistenceP7Validation {
  valid: boolean;
  summary: string;
  audit: import("../audit/audit-types").PersistenceAuditResult;
}

export type PersistenceBackend = (typeof PERSISTENCE_BACKENDS)[number];

export interface CreatePersistenceRuntimeOptions {
  backend?: PersistenceBackend;
}

export interface PersistenceRuntime {
  readonly backend: PersistenceBackend;
  workspace: {
    create(input: CreateWorkspacePersistedInput): Promise<WorkspaceRecord>;
    resolve(workspaceId: string, tenantId: string): Promise<WorkspaceRecord | null>;
    list(tenantId: string): Promise<WorkspaceRecord[]>;
    updateStatus(input: UpdateWorkspaceStatusPersistedInput): Promise<WorkspaceRecord>;
    archive(workspaceId: string, tenantId: string): Promise<WorkspaceRecord>;
  };
  quoteWorkflow: {
    create(input: CreateQuoteWorkflowInput): Promise<QuoteWorkflowMutationResult>;
    transition(input: TransitionQuoteWorkflowInput): Promise<QuoteWorkflowMutationResult>;
    list(workspaceId: string, tenantId: string): Promise<WorkflowRecord[]>;
  };
}

export interface CreateWorkspacePersistedInput {
  tenantId: string;
  name: string;
}

export interface UpdateWorkspaceStatusPersistedInput {
  workspaceId: string;
  tenantId: string;
  status: WorkspaceStatus;
}

export interface CreateQuoteWorkflowInput {
  workspaceId: string;
  tenantId: string;
  quoteId: string;
  actor?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface TransitionQuoteWorkflowInput {
  workflowId: string;
  tenantId: string;
  toState: WorkflowState;
  actor?: string;
  reason?: string;
}

export interface QuoteWorkflowMutationResult {
  workflow: WorkflowRecord;
  history: WorkflowHistoryRecord;
  event: WorkflowEventRecord;
}

export interface PersistenceSchemaMeta {
  tag: typeof SAAS_PRODUCT_PERSISTENCE_P1_TAG;
  tables: readonly string[];
  scope: readonly string[];
}

export interface PersistenceRepositoryMeta {
  tag: typeof SAAS_PRODUCT_PERSISTENCE_P2_TAG;
  repositories: readonly string[];
}
