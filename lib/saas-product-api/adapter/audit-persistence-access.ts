import {
  PERSISTENCE_ERROR_CODES,
  SaasProductPersistenceError,
  persistenceRepositories,
  type PersistenceRuntime,
  type QuoteRecord,
  type WorkflowEventRecord,
  type WorkflowHistoryRecord,
  type WorkflowRecord,
  type WorkspaceRecord,
} from "@/lib/saas-product-persistence";

interface MemoryPersistenceStore {
  workspaces: Map<string, WorkspaceRecord>;
  quotes: Map<string, QuoteRecord>;
  workflows: Map<string, WorkflowRecord>;
  histories: WorkflowHistoryRecord[];
  events: WorkflowEventRecord[];
}

interface MemoryPersistenceRuntime extends PersistenceRuntime {
  getStore(): MemoryPersistenceStore;
}

export interface AuditPersistenceAccess {
  listHistory(workflowId: string, tenantId: string): Promise<WorkflowHistoryRecord[]>;
  listEvents(workflowId: string, tenantId: string): Promise<WorkflowEventRecord[]>;
}

function getMemoryStore(runtime: PersistenceRuntime): MemoryPersistenceStore | null {
  if (runtime.backend !== "memory") {
    return null;
  }
  return (runtime as MemoryPersistenceRuntime).getStore();
}

function assertMemoryWorkflowTenant(
  store: MemoryPersistenceStore,
  workflowId: string,
  tenantId: string,
): void {
  const workflow = store.workflows.get(workflowId);
  if (!workflow) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Workflow not found: ${workflowId}`,
    );
  }
  const workspace = store.workspaces.get(workflow.workspaceId);
  if (!workspace || workspace.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Workflow ${workflowId} not found for tenant ${tenantId}`,
    );
  }
}

function createMemoryAuditAccess(runtime: PersistenceRuntime): AuditPersistenceAccess {
  return {
    async listHistory(workflowId: string, tenantId: string): Promise<WorkflowHistoryRecord[]> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.workflowHistory.listByWorkflowId(workflowId, tenantId);
      }
      assertMemoryWorkflowTenant(store, workflowId, tenantId);
      return store.histories
        .filter((item) => item.workflowId === workflowId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async listEvents(workflowId: string, tenantId: string): Promise<WorkflowEventRecord[]> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.workflowEvent.listByWorkflowId(workflowId, tenantId);
      }
      assertMemoryWorkflowTenant(store, workflowId, tenantId);
      return store.events
        .filter((item) => item.workflowId === workflowId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}

export function getAuditPersistenceAccess(runtime: PersistenceRuntime): AuditPersistenceAccess {
  if (runtime.backend === "memory") {
    return createMemoryAuditAccess(runtime);
  }
  return {
    listHistory: persistenceRepositories.workflowHistory.listByWorkflowId.bind(
      persistenceRepositories.workflowHistory,
    ),
    listEvents: persistenceRepositories.workflowEvent.listByWorkflowId.bind(
      persistenceRepositories.workflowEvent,
    ),
  };
}
