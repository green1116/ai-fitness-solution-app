import type { EventType, PersistenceBackend, WorkflowState, WorkflowType, WorkspaceStatus } from "../shared/persistence-types";

export interface ParityScenarioInput {
  tenantId: string;
  workspaceName: string;
  quoteTitle: string;
  actor: string;
}

export interface ParityWorkspaceSnapshot {
  tenantId: string;
  name: string;
  statusAfterCreate: WorkspaceStatus;
  statusAfterArchive: WorkspaceStatus;
}

export interface ParityWorkflowSnapshot {
  workflowType: WorkflowType;
  stateAfterCreate: WorkflowState;
  stateAfterApprove: WorkflowState;
  createEventType: EventType;
  approveEventType: EventType;
  approveHistoryFrom: string;
  approveHistoryTo: string;
  historyCount: number;
  eventCount: number;
}

export interface ParityBackendSnapshot {
  backend: PersistenceBackend;
  workspace: ParityWorkspaceSnapshot;
  workflow: ParityWorkflowSnapshot;
}

export interface ParityMismatch {
  field: string;
  memoryValue: unknown;
  prismaValue: unknown;
  message: string;
}

export interface ParityComparisonResult {
  memory: ParityBackendSnapshot;
  prisma: ParityBackendSnapshot | null;
  prismaAvailable: boolean;
  prismaError?: string;
  mismatches: ParityMismatch[];
  passed: boolean;
}

export interface ParityScenarioCleanup {
  workspaceIds: string[];
  quoteIds: string[];
  workflowIds: string[];
}

export interface ParityRunResult extends ParityComparisonResult {
  cleanup?: ParityScenarioCleanup;
}
