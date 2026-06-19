import type {
  AppendWorkflowEventInput,
  AppendWorkflowHistoryInput,
  CreateQuoteInput,
  CreateWorkflowInput,
  CreateWorkspaceInput,
  QuoteRecord,
  UpdateQuoteInput,
  UpdateWorkflowStateInput,
  UpdateWorkspaceInput,
  WorkflowEventRecord,
  WorkflowHistoryRecord,
  WorkflowRecord,
  WorkspaceRecord,
  EventType,
  WorkflowState,
} from "../shared/persistence-types";

export interface WorkspaceRepository {
  create(input: CreateWorkspaceInput): Promise<WorkspaceRecord>;
  findById(id: string, tenantId: string): Promise<WorkspaceRecord | null>;
  update(id: string, tenantId: string, input: UpdateWorkspaceInput): Promise<WorkspaceRecord>;
  archive(id: string, tenantId: string): Promise<WorkspaceRecord>;
  restore(id: string, tenantId: string): Promise<WorkspaceRecord>;
  listByTenant(tenantId: string): Promise<WorkspaceRecord[]>;
}

export interface QuoteRepository {
  create(input: CreateQuoteInput): Promise<QuoteRecord>;
  update(id: string, tenantId: string, input: UpdateQuoteInput): Promise<QuoteRecord>;
  approve(id: string, tenantId: string): Promise<QuoteRecord>;
  reject(id: string, tenantId: string): Promise<QuoteRecord>;
  archive(id: string, tenantId: string): Promise<QuoteRecord>;
  findById(id: string, tenantId: string): Promise<QuoteRecord | null>;
  findByWorkspaceId(workspaceId: string, tenantId: string): Promise<QuoteRecord[]>;
}

export interface WorkflowRepository {
  create(input: CreateWorkflowInput): Promise<WorkflowRecord>;
  updateCurrentState(input: UpdateWorkflowStateInput): Promise<WorkflowRecord>;
  findById(id: string, tenantId: string): Promise<WorkflowRecord | null>;
  findByQuoteId(quoteId: string, tenantId: string): Promise<WorkflowRecord[]>;
  listByWorkspaceId(workspaceId: string, tenantId: string): Promise<WorkflowRecord[]>;
}

export interface WorkflowHistoryRepository {
  append(input: AppendWorkflowHistoryInput): Promise<WorkflowHistoryRecord>;
  listByWorkflowId(workflowId: string, tenantId: string): Promise<WorkflowHistoryRecord[]>;
}

export interface WorkflowEventRepository {
  append(input: AppendWorkflowEventInput): Promise<WorkflowEventRecord>;
  listByWorkflowId(workflowId: string, tenantId: string): Promise<WorkflowEventRecord[]>;
  listByEventType(workflowId: string, tenantId: string, eventType: EventType): Promise<WorkflowEventRecord[]>;
}

export interface PersistenceRepositories {
  workspace: WorkspaceRepository;
  quote: QuoteRepository;
  workflow: WorkflowRepository;
  workflowHistory: WorkflowHistoryRepository;
  workflowEvent: WorkflowEventRepository;
}
