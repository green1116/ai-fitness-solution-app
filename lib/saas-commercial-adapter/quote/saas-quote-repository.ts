import {
  SAAS_ADAPTER_ERROR_CODES,
  SaasCommercialAdapterError,
} from "../shared/constants";
import type { SaasQuote, SaasQuoteCreateInput, SaasQuoteSnapshot } from "./saas-quote-types";

const quotes = new Map<string, SaasQuote>();
const snapshots = new Map<string, SaasQuoteSnapshot>();

function generateQuoteId(): string {
  return `saas-quote-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function saveSaasQuote(input: SaasQuoteCreateInput): SaasQuote {
  const quote: SaasQuote = {
    id: input.quoteId ?? generateQuoteId(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    source: input.source ?? "manual",
    status: "draft",
    payload: input.payload,
  };
  quotes.set(quote.id, quote);
  return quote;
}

export function getSaasQuote(quoteId: string): SaasQuote | undefined {
  return quotes.get(quoteId);
}

export function updateSaasQuoteStatus(quoteId: string, status: SaasQuote["status"]): SaasQuote {
  const quote = quotes.get(quoteId);
  if (!quote) {
    throw new SaasCommercialAdapterError(SAAS_ADAPTER_ERROR_CODES.QUOTE_NOT_FOUND, `Quote not found: ${quoteId}`);
  }
  const next = { ...quote, status };
  quotes.set(quoteId, next);
  return next;
}

export function saveSaasQuoteSnapshot(snapshot: SaasQuoteSnapshot): SaasQuoteSnapshot {
  if (snapshots.has(snapshot.quoteId)) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.SNAPSHOT_IMMUTABLE,
      `Snapshot already exists for quoteId=${snapshot.quoteId}`,
    );
  }
  const frozen: SaasQuoteSnapshot = {
    quoteId: snapshot.quoteId,
    snapshot: snapshot.snapshot,
    createdAt: new Date(snapshot.createdAt),
  };
  snapshots.set(snapshot.quoteId, frozen);
  return frozen;
}

export function getSaasQuoteSnapshot(quoteId: string): SaasQuoteSnapshot | undefined {
  const record = snapshots.get(quoteId);
  return record ? { ...record, createdAt: new Date(record.createdAt) } : undefined;
}

export function assertSaasQuoteTenant(quote: SaasQuote, tenantId: string): void {
  if (quote.tenantId !== tenantId) {
    throw new SaasCommercialAdapterError(
      SAAS_ADAPTER_ERROR_CODES.TENANT_MISMATCH,
      `Quote tenant mismatch: expected=${tenantId} actual=${quote.tenantId}`,
    );
  }
}

export function clearSaasQuoteRepository(): void {
  quotes.clear();
  snapshots.clear();
}

export function getSaasQuoteRepositorySize(): { quotes: number; snapshots: number } {
  return { quotes: quotes.size, snapshots: snapshots.size };
}
