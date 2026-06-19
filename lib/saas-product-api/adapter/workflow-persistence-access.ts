import {
  PERSISTENCE_ERROR_CODES,
  SaasProductPersistenceError,
  persistenceRepositories,
  type PersistenceRuntime,
  type QuoteRecord,
  type WorkflowRecord,
  type WorkspaceRecord,
} from "@/lib/saas-product-persistence";
import type { WorkflowRepository } from "@/lib/saas-product-persistence/contracts/persistence-contracts";

interface MemoryPersistenceStore {
  workspaces: Map<string, WorkspaceRecord>;
  quotes: Map<string, QuoteRecord>;
  workflows: Map<string, WorkflowRecord>;
}

interface MemoryPersistenceRuntime extends PersistenceRuntime {
  getStore(): MemoryPersistenceStore;
}

function getMemoryStore(runtime: PersistenceRuntime): MemoryPersistenceStore | null {
  if (runtime.backend !== "memory") {
    return null;
  }
  return (runtime as MemoryPersistenceRuntime).getStore();
}

function requireMemoryQuote(store: MemoryPersistenceStore, id: string, tenantId: string): QuoteRecord {
  const quote = store.quotes.get(id);
  if (!quote || quote.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_NOT_FOUND,
      `Quote not found: ${id}`,
    );
  }
  return quote;
}

function createMemoryWorkflowAccess(runtime: PersistenceRuntime): Pick<WorkflowRepository, "findById" | "findByQuoteId"> {
  return {
    async findById(id: string, tenantId: string): Promise<WorkflowRecord | null> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.workflow.findById(id, tenantId);
      }
      const workflow = store.workflows.get(id);
      if (!workflow) {
        return null;
      }
      const workspace = store.workspaces.get(workflow.workspaceId);
      if (!workspace || workspace.tenantId !== tenantId) {
        return null;
      }
      return workflow;
    },

    async findByQuoteId(quoteId: string, tenantId: string): Promise<WorkflowRecord[]> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.workflow.findByQuoteId(quoteId, tenantId);
      }
      requireMemoryQuote(store, quoteId, tenantId);
      return [...store.workflows.values()]
        .filter((workflow) => workflow.quoteId === quoteId)
        .filter((workflow) => {
          const workspace = store.workspaces.get(workflow.workspaceId);
          return workspace?.tenantId === tenantId;
        })
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}

export function getWorkflowPersistenceAccess(runtime: PersistenceRuntime): Pick<WorkflowRepository, "findById" | "findByQuoteId"> {
  if (runtime.backend === "memory") {
    return createMemoryWorkflowAccess(runtime);
  }
  return {
    findById: persistenceRepositories.workflow.findById.bind(persistenceRepositories.workflow),
    findByQuoteId: persistenceRepositories.workflow.findByQuoteId.bind(persistenceRepositories.workflow),
  };
}
