import { loadV55QuoteRuntimeSnapshot } from "../../bridge/quote-runtime-bridge";
import type { QuotePersistenceAdapterPort } from "../../ports/quote-persistence.adapter.port";
import {
  mapFoundationSnapshotWithQuoteRecord,
} from "./quote-persistence-mapper";
import type { QuoteRepositoryBinding } from "./quote-repository.adapter";

export interface QuotePersistenceAdapterOptions {
  tenantId: string;
  binding: QuoteRepositoryBinding;
}

interface PersistedWorkspaceQuoteState {
  quoteId: string;
  persisted: boolean;
}

export function createQuotePersistenceAdapter(
  options: QuotePersistenceAdapterOptions,
): QuotePersistenceAdapterPort {
  const persistedByWorkspace = new Map<string, PersistedWorkspaceQuoteState>();
  const latestRecordByWorkspace = new Map<string, Awaited<ReturnType<QuoteRepositoryBinding["persistQuoteState"]>>>();

  return {
    loadQuoteSnapshot(workspaceId: string) {
      const foundation = loadV55QuoteRuntimeSnapshot(workspaceId).snapshot;
      const cachedBinding = latestRecordByWorkspace.get(workspaceId);
      if (!cachedBinding) {
        return foundation;
      }
      return mapFoundationSnapshotWithQuoteRecord(foundation, {
        id: cachedBinding.quoteId,
        workspaceId: cachedBinding.workspaceId,
        tenantId: cachedBinding.tenantId,
        title: cachedBinding.title,
        status: cachedBinding.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },
    exists(workspaceId: string): boolean {
      return persistedByWorkspace.get(workspaceId)?.persisted === true;
    },
    persistQuoteState(workspaceId: string, quoteId: string): boolean {
      if (workspaceId.trim().length === 0 || quoteId.trim().length === 0) {
        return false;
      }

      persistedByWorkspace.set(workspaceId, { quoteId, persisted: true });

      void options.binding
        .persistQuoteState({ workspaceId, quoteId })
        .then((record) => {
          latestRecordByWorkspace.set(workspaceId, record);
        })
        .catch(() => {
          persistedByWorkspace.delete(workspaceId);
        });

      return true;
    },
  };
}

export function createQuotePersistencePortBinding(options: QuotePersistenceAdapterOptions): QuotePersistenceAdapterPort {
  return createQuotePersistenceAdapter(options);
}
