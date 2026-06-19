import { randomUUID } from "crypto";
import {
  PERSISTENCE_BACKEND_ENV_KEY,
  PERSISTENCE_BACKENDS,
  WORKFLOW_STATE_TRANSITIONS,
} from "../shared/persistence-constants";
import { PERSISTENCE_ERROR_CODES, SaasProductPersistenceError } from "../shared/persistence-errors";
import type {
  CreateQuoteWorkflowInput,
  CreateWorkspacePersistedInput,
  PersistenceBackend,
  PersistenceRuntime,
  QuoteRecord,
  QuoteWorkflowMutationResult,
  TransitionQuoteWorkflowInput,
  UpdateWorkspaceStatusPersistedInput,
  WorkflowEventRecord,
  WorkflowHistoryRecord,
  WorkflowRecord,
  WorkflowState,
  WorkspaceRecord,
  WorkspaceStatus,
} from "../shared/persistence-types";
import {
  archiveWorkspacePersisted,
  createWorkspacePersisted,
  listWorkspacesPersisted,
  resolveWorkspacePersisted,
  updateWorkspaceStatusPersisted,
} from "./workspace-persistence-runtime";
import {
  createQuoteWorkflow,
  listQuoteWorkflows,
  transitionQuoteWorkflow,
} from "./quote-workflow-persistence-runtime";

export function resolvePersistenceBackend(override?: PersistenceBackend): PersistenceBackend {
  if (override) {
    return override;
  }
  const raw = process.env[PERSISTENCE_BACKEND_ENV_KEY]?.trim().toLowerCase();
  if (raw === "prisma" || raw === "memory") {
    return raw;
  }
  return "memory";
}

export function isPersistenceBackend(value: string): value is PersistenceBackend {
  return (PERSISTENCE_BACKENDS as readonly string[]).includes(value);
}

interface MemoryPersistenceStore {
  workspaces: Map<string, WorkspaceRecord>;
  quotes: Map<string, QuoteRecord>;
  workflows: Map<string, WorkflowRecord>;
  histories: WorkflowHistoryRecord[];
  events: WorkflowEventRecord[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function createMemoryStore(): MemoryPersistenceStore {
  return {
    workspaces: new Map(),
    quotes: new Map(),
    workflows: new Map(),
    histories: [],
    events: [],
  };
}

function assertTenantId(tenantId: string): void {
  if (!tenantId.trim()) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      "tenantId is required",
    );
  }
}

function assertWorkspaceStatus(status: WorkspaceStatus): void {
  if (status !== "ACTIVE" && status !== "ARCHIVED") {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `workspace status must be ACTIVE or ARCHIVED, got: ${status}`,
    );
  }
}

function assertWorkflowTransition(from: WorkflowState, to: WorkflowState): void {
  const allowed = WORKFLOW_STATE_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `Workflow transition denied: ${from} -> ${to}`,
    );
  }
}

function requireWorkspace(store: MemoryPersistenceStore, id: string, tenantId: string): WorkspaceRecord {
  const workspace = store.workspaces.get(id);
  if (!workspace || workspace.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Workspace not found: ${id}`,
    );
  }
  return workspace;
}

function requireQuote(store: MemoryPersistenceStore, id: string, tenantId: string): QuoteRecord {
  const quote = store.quotes.get(id);
  if (!quote || quote.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Quote ${id} not found for tenant ${tenantId}`,
    );
  }
  return quote;
}

function requireWorkflow(store: MemoryPersistenceStore, id: string, tenantId: string): WorkflowRecord {
  const workflow = store.workflows.get(id);
  if (!workflow) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Workflow not found: ${id}`,
    );
  }
  const workspace = store.workspaces.get(workflow.workspaceId);
  if (!workspace || workspace.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Workflow ${id} not found for tenant ${tenantId}`,
    );
  }
  return workflow;
}

export interface RegisterMemoryPersistenceQuoteInput {
  workspaceId: string;
  tenantId: string;
  title: string;
  quoteId?: string;
}

export function registerMemoryPersistenceQuote(
  runtime: PersistenceRuntime,
  input: RegisterMemoryPersistenceQuoteInput,
): QuoteRecord {
  if (runtime.backend !== "memory") {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_SCHEMA_INVALID,
      "registerMemoryPersistenceQuote only supports memory backend",
    );
  }
  const store = (runtime as MemoryPersistenceRuntime).getStore();
  requireWorkspace(store, input.workspaceId, input.tenantId);
  const timestamp = nowIso();
  const quote: QuoteRecord = {
    id: input.quoteId ?? randomUUID(),
    workspaceId: input.workspaceId,
    tenantId: input.tenantId,
    title: input.title,
    status: "DRAFT",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.quotes.set(quote.id, quote);
  return quote;
}

interface MemoryPersistenceRuntime extends PersistenceRuntime {
  getStore(): MemoryPersistenceStore;
}

export function createMemoryPersistenceRuntime(): PersistenceRuntime {
  const store = createMemoryStore();

  const runtime: MemoryPersistenceRuntime = {
    backend: "memory",
    getStore: () => store,
    workspace: {
      async create(input: CreateWorkspacePersistedInput): Promise<WorkspaceRecord> {
        assertTenantId(input.tenantId);
        const timestamp = nowIso();
        const workspace: WorkspaceRecord = {
          id: randomUUID(),
          tenantId: input.tenantId,
          name: input.name.trim(),
          status: "ACTIVE",
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        store.workspaces.set(workspace.id, workspace);
        return workspace;
      },

      async resolve(workspaceId: string, tenantId: string): Promise<WorkspaceRecord | null> {
        assertTenantId(tenantId);
        const workspace = store.workspaces.get(workspaceId);
        if (!workspace || workspace.tenantId !== tenantId) {
          return null;
        }
        return workspace;
      },

      async list(tenantId: string): Promise<WorkspaceRecord[]> {
        assertTenantId(tenantId);
        return [...store.workspaces.values()]
          .filter((workspace) => workspace.tenantId === tenantId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },

      async updateStatus(input: UpdateWorkspaceStatusPersistedInput): Promise<WorkspaceRecord> {
        assertTenantId(input.tenantId);
        assertWorkspaceStatus(input.status);
        const current = requireWorkspace(store, input.workspaceId, input.tenantId);
        const updated: WorkspaceRecord = {
          ...current,
          status: input.status,
          updatedAt: nowIso(),
        };
        store.workspaces.set(updated.id, updated);
        return updated;
      },

      async archive(workspaceId: string, tenantId: string): Promise<WorkspaceRecord> {
        return runtime.workspace.updateStatus({ workspaceId, tenantId, status: "ARCHIVED" });
      },
    },

    quoteWorkflow: {
      async create(input: CreateQuoteWorkflowInput): Promise<QuoteWorkflowMutationResult> {
        assertTenantId(input.tenantId);
        requireWorkspace(store, input.workspaceId, input.tenantId);
        requireQuote(store, input.quoteId, input.tenantId);

        const timestamp = nowIso();
        const workflow: WorkflowRecord = {
          id: randomUUID(),
          workspaceId: input.workspaceId,
          quoteId: input.quoteId,
          workflowType: "QUOTE",
          currentState: "CREATED",
          metadata: input.metadata,
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        store.workflows.set(workflow.id, workflow);

        const history: WorkflowHistoryRecord = {
          id: randomUUID(),
          workflowId: workflow.id,
          fromState: "CREATED",
          toState: "CREATED",
          actor: input.actor,
          reason: input.reason,
          createdAt: timestamp,
        };
        store.histories.push(history);

        const event: WorkflowEventRecord = {
          id: randomUUID(),
          workflowId: workflow.id,
          eventType: "WORKFLOW_CREATED",
          toState: "CREATED",
          actor: input.actor,
          reason: input.reason,
          createdAt: timestamp,
        };
        store.events.push(event);

        return { workflow, history, event };
      },

      async transition(input: TransitionQuoteWorkflowInput): Promise<QuoteWorkflowMutationResult> {
        assertTenantId(input.tenantId);
        if (input.toState !== "APPROVED" && input.toState !== "REJECTED") {
          throw new SaasProductPersistenceError(
            PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
            `quote workflow transition only supports APPROVED or REJECTED, got: ${input.toState}`,
          );
        }

        const current = requireWorkflow(store, input.workflowId, input.tenantId);
        if (current.workflowType !== "QUOTE") {
          throw new SaasProductPersistenceError(
            PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_WORKFLOW_TYPE,
            `quote workflow runtime only supports QUOTE, got: ${current.workflowType}`,
          );
        }
        assertWorkflowTransition(current.currentState, input.toState);

        const timestamp = nowIso();
        const workflow: WorkflowRecord = {
          ...current,
          currentState: input.toState,
          updatedAt: timestamp,
        };
        store.workflows.set(workflow.id, workflow);

        const history: WorkflowHistoryRecord = {
          id: randomUUID(),
          workflowId: workflow.id,
          fromState: current.currentState,
          toState: input.toState,
          actor: input.actor,
          reason: input.reason,
          createdAt: timestamp,
        };
        store.histories.push(history);

        const event: WorkflowEventRecord = {
          id: randomUUID(),
          workflowId: workflow.id,
          eventType: "STATE_CHANGED",
          fromState: current.currentState,
          toState: input.toState,
          actor: input.actor,
          reason: input.reason,
          createdAt: timestamp,
        };
        store.events.push(event);

        return { workflow, history, event };
      },

      async list(workspaceId: string, tenantId: string): Promise<WorkflowRecord[]> {
        assertTenantId(tenantId);
        requireWorkspace(store, workspaceId, tenantId);
        return [...store.workflows.values()]
          .filter(
            (workflow) =>
              workflow.workspaceId === workspaceId && workflow.workflowType === "QUOTE",
          )
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      },
    },
  };

  return runtime;
}

export function createPrismaPersistenceRuntime(): PersistenceRuntime {
  return {
    backend: "prisma",
    workspace: {
      create: createWorkspacePersisted,
      resolve: resolveWorkspacePersisted,
      list: listWorkspacesPersisted,
      updateStatus: updateWorkspaceStatusPersisted,
      archive: archiveWorkspacePersisted,
    },
    quoteWorkflow: {
      create: createQuoteWorkflow,
      transition: transitionQuoteWorkflow,
      list: listQuoteWorkflows,
    },
  };
}
