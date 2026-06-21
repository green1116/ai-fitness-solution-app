import type { QuoteApiExposurePort } from "@/lib/quote-runtime/ports/quote-api-exposure.port";

export interface QuoteApiAdapterPort extends QuoteApiExposurePort {
  exposeQuoteApi(workspaceId: string): { exposed: boolean; route: string };
}

export type { QuoteApiExposurePort };
