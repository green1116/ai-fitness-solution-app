import type { QuoteSnapshot } from "../shared/types";

const registry = new Map<string, QuoteSnapshot>();

export function registerQuoteSnapshot(snapshot: QuoteSnapshot): void {
  registry.set(snapshot.quoteId, snapshot);
}

export function getQuoteSnapshotById(quoteId: string): QuoteSnapshot | undefined {
  return registry.get(quoteId);
}

export function clearQuoteSnapshotRegistry(): void {
  registry.clear();
}

export function getQuoteSnapshotRegistrySize(): number {
  return registry.size;
}
