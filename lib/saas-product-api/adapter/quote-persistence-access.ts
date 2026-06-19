import {
  PERSISTENCE_ERROR_CODES,
  QUOTE_STATUS_TRANSITIONS,
  SaasProductPersistenceError,
  persistenceRepositories,
  registerMemoryPersistenceQuote,
  type CreateQuoteInput,
  type PersistenceRuntime,
  type QuoteRecord,
  type QuoteStatus,
  type UpdateQuoteInput,
  type WorkspaceRecord,
} from "@/lib/saas-product-persistence";
import type { QuoteRepository } from "@/lib/saas-product-persistence/contracts/persistence-contracts";

interface MemoryPersistenceStore {
  workspaces: Map<string, WorkspaceRecord>;
  quotes: Map<string, QuoteRecord>;
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

function assertQuoteTransition(from: QuoteStatus, to: QuoteStatus): void {
  const allowed = QUOTE_STATUS_TRANSITIONS[from] ?? [];
  if (!allowed.includes(to)) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_INVALID_TRANSITION,
      `Quote transition denied: ${from} -> ${to}`,
    );
  }
}

function requireMemoryWorkspace(
  store: MemoryPersistenceStore,
  workspaceId: string,
  tenantId: string,
): WorkspaceRecord {
  const workspace = store.workspaces.get(workspaceId);
  if (!workspace || workspace.tenantId !== tenantId) {
    throw new SaasProductPersistenceError(
      PERSISTENCE_ERROR_CODES.PERSISTENCE_TENANT_MISMATCH,
      `Workspace not found: ${workspaceId}`,
    );
  }
  return workspace;
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

function createMemoryQuoteAccess(runtime: PersistenceRuntime): QuoteRepository {
  return {
    async create(input: CreateQuoteInput): Promise<QuoteRecord> {
      return registerMemoryPersistenceQuote(runtime, {
        workspaceId: input.workspaceId,
        tenantId: input.tenantId,
        title: input.title,
      });
    },

    async findById(id: string, tenantId: string): Promise<QuoteRecord | null> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.quote.findById(id, tenantId);
      }
      const quote = store.quotes.get(id);
      if (!quote || quote.tenantId !== tenantId) {
        return null;
      }
      return quote;
    },

    async findByWorkspaceId(workspaceId: string, tenantId: string): Promise<QuoteRecord[]> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.quote.findByWorkspaceId(workspaceId, tenantId);
      }
      requireMemoryWorkspace(store, workspaceId, tenantId);
      return [...store.quotes.values()]
        .filter((quote) => quote.workspaceId === workspaceId && quote.tenantId === tenantId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async update(id: string, tenantId: string, input: UpdateQuoteInput): Promise<QuoteRecord> {
      const store = getMemoryStore(runtime);
      if (!store) {
        return persistenceRepositories.quote.update(id, tenantId, input);
      }
      const current = requireMemoryQuote(store, id, tenantId);
      if (input.status && input.status !== current.status) {
        assertQuoteTransition(current.status, input.status);
      }
      const updated: QuoteRecord = {
        ...current,
        title: input.title ?? current.title,
        status: input.status ?? current.status,
        metadata: input.metadata ?? current.metadata,
        updatedAt: new Date().toISOString(),
      };
      store.quotes.set(updated.id, updated);
      return updated;
    },

    async approve(id: string, tenantId: string): Promise<QuoteRecord> {
      return this.update(id, tenantId, { status: "APPROVED" });
    },

    async reject(id: string, tenantId: string): Promise<QuoteRecord> {
      return this.update(id, tenantId, { status: "REJECTED" });
    },

    async archive(id: string, tenantId: string): Promise<QuoteRecord> {
      return this.update(id, tenantId, { status: "ARCHIVED" });
    },
  };
}

export function getQuotePersistenceAccess(runtime: PersistenceRuntime): QuoteRepository {
  if (runtime.backend === "memory") {
    return createMemoryQuoteAccess(runtime);
  }
  return persistenceRepositories.quote;
}
