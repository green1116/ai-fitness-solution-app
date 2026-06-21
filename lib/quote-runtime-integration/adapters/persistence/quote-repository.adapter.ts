import type { QuoteRepository } from "@/lib/saas-product-persistence/contracts/persistence-contracts";
import {
  createPersistenceRuntime,
  type PersistenceRuntime,
} from "@/lib/saas-product-persistence/runtime/persistence-adapter";
import {
  registerMemoryPersistenceQuote,
} from "@/lib/saas-product-persistence/runtime/persistence-backend";
import { persistenceRepositories } from "@/lib/saas-product-persistence/repositories";
import type { QuoteRecord } from "@/lib/saas-product-persistence/shared/persistence-types";
import {
  buildPersistQuoteMetadata,
  buildQuotePersistenceTitle,
  mapQuoteRecordToBinding,
  type QuotePersistenceBindingRecord,
} from "./quote-persistence-mapper";

export interface QuoteRepositoryBinding {
  tenantId: string;
  repository: QuoteRepository;
  findQuotesByWorkspace(workspaceId: string): Promise<QuoteRecord[]>;
  findQuoteById(quoteId: string): Promise<QuoteRecord | null>;
  persistQuoteState(input: {
    workspaceId: string;
    quoteId: string;
  }): Promise<QuotePersistenceBindingRecord>;
}

export interface QuoteRepositoryBindingOptions {
  repository: QuoteRepository;
  tenantId: string;
}

export function createQuoteRepositoryBinding(
  options: QuoteRepositoryBindingOptions,
): QuoteRepositoryBinding {
  const { repository, tenantId } = options;

  return {
    tenantId,
    repository,
    findQuotesByWorkspace(workspaceId: string): Promise<QuoteRecord[]> {
      return repository.findByWorkspaceId(workspaceId, tenantId);
    },
    findQuoteById(quoteId: string): Promise<QuoteRecord | null> {
      return repository.findById(quoteId, tenantId);
    },
    async persistQuoteState(input: {
      workspaceId: string;
      quoteId: string;
    }): Promise<QuotePersistenceBindingRecord> {
      const existing = await repository.findById(input.quoteId, tenantId);
      if (existing) {
        const updated = await repository.update(input.quoteId, tenantId, {
          metadata: buildPersistQuoteMetadata(input.quoteId),
        });
        return mapQuoteRecordToBinding(updated);
      }

      const workspaceQuotes = await repository.findByWorkspaceId(input.workspaceId, tenantId);
      const matched = workspaceQuotes.find((quote) => quote.id === input.quoteId);
      if (matched) {
        const updated = await repository.update(matched.id, tenantId, {
          metadata: buildPersistQuoteMetadata(input.quoteId),
        });
        return mapQuoteRecordToBinding(updated);
      }

      const created = await repository.create({
        workspaceId: input.workspaceId,
        tenantId,
        title: buildQuotePersistenceTitle(input.workspaceId, input.quoteId),
        status: "DRAFT",
        metadata: buildPersistQuoteMetadata(input.quoteId),
      });
      return mapQuoteRecordToBinding(created);
    },
  };
}

export function createQuoteRepositoryBindingFromV50(tenantId: string): QuoteRepositoryBinding {
  return createQuoteRepositoryBinding({
    repository: persistenceRepositories.quote,
    tenantId,
  });
}

type MemoryPersistenceRuntime = PersistenceRuntime & {
  getStore(): {
    workspaces: Map<string, import("@/lib/saas-product-persistence/shared/persistence-types").WorkspaceRecord>;
    quotes: Map<string, QuoteRecord>;
  };
};

export async function createMemoryQuoteRepositoryBinding(input: {
  tenantId: string;
  workspaceName?: string;
}): Promise<{
  binding: QuoteRepositoryBinding;
  runtime: PersistenceRuntime;
  workspaceId: string;
}> {
  const runtime = createPersistenceRuntime({ backend: "memory" });
  const workspace = await runtime.workspace.create({
    tenantId: input.tenantId,
    name: input.workspaceName ?? "v56-p3-workspace",
  });
  const memoryRuntime = runtime as MemoryPersistenceRuntime;
  const store = memoryRuntime.getStore();

  const repository: QuoteRepository = {
    async create(quoteInput) {
      return registerMemoryPersistenceQuote(runtime, quoteInput);
    },
    async findById(id, tenantId) {
      const quote = store.quotes.get(id);
      if (!quote || quote.tenantId !== tenantId) {
        return null;
      }
      return quote;
    },
    async findByWorkspaceId(workspaceId, tenantId) {
      return [...store.quotes.values()].filter(
        (quote) => quote.workspaceId === workspaceId && quote.tenantId === tenantId,
      );
    },
    async update(id, tenantId, updateInput) {
      const current = store.quotes.get(id);
      if (!current || current.tenantId !== tenantId) {
        throw new Error(`Quote not found: ${id}`);
      }
      const updated: QuoteRecord = {
        ...current,
        title: updateInput.title ?? current.title,
        status: updateInput.status ?? current.status,
        metadata: updateInput.metadata ?? current.metadata,
        updatedAt: new Date().toISOString(),
      };
      store.quotes.set(updated.id, updated);
      return updated;
    },
    async approve(id, tenantId) {
      return this.update(id, tenantId, { status: "APPROVED" });
    },
    async reject(id, tenantId) {
      return this.update(id, tenantId, { status: "REJECTED" });
    },
    async archive(id, tenantId) {
      return this.update(id, tenantId, { status: "ARCHIVED" });
    },
  };

  return {
    runtime,
    workspaceId: workspace.id,
    binding: createQuoteRepositoryBinding({ repository, tenantId: input.tenantId }),
  };
}
