import type { QuoteRecord } from "@/lib/saas-product-persistence/shared/persistence-types";
import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";

export interface QuotePersistenceBindingRecord {
  workspaceId: string;
  quoteId: string;
  tenantId: string;
  title: string;
  status: QuoteRecord["status"];
}

export function mapQuoteRecordToBinding(record: QuoteRecord): QuotePersistenceBindingRecord {
  return {
    workspaceId: record.workspaceId,
    quoteId: record.id,
    tenantId: record.tenantId,
    title: record.title,
    status: record.status,
  };
}

export function mapFoundationSnapshotWithQuoteRecord(
  foundation: WorkspaceQuoteRuntimeSnapshot,
  record?: QuoteRecord | null,
): WorkspaceQuoteRuntimeSnapshot {
  if (!record) {
    return foundation;
  }
  return {
    ...foundation,
    workspaceId: foundation.workspaceId || record.workspaceId,
  };
}

export function buildPersistQuoteMetadata(quoteId: string): Record<string, unknown> {
  return {
    quoteId,
    persistedBy: "v56-quote-persistence-adapter",
    persistedAt: new Date().toISOString(),
  };
}

export function buildQuotePersistenceTitle(workspaceId: string, quoteId: string): string {
  return `Quote ${quoteId} (${workspaceId})`;
}
