import type { QuotePersistencePort } from "@/lib/quote-runtime/ports/quote-persistence.port";

export interface QuotePersistenceAdapterPort extends QuotePersistencePort {
  persistQuoteState(workspaceId: string, quoteId: string): boolean;
}

export type { QuotePersistencePort };
