import { createQuoteStatusSnapshot } from "./quote-status.snapshot";
import type { QuoteStatusSnapshot } from "./quote-status.types";

export function buildStatusSnapshot(input: {
  quoteId: string;
  workspaceId: string;
  lifecycleStatus?: QuoteStatusSnapshot["lifecycleStatus"];
  jobStatus?: QuoteStatusSnapshot["jobStatus"];
  executionStatus?: QuoteStatusSnapshot["executionStatus"];
  lastEventType?: string;
  lastEventId?: string;
  updatedAt?: string;
}): QuoteStatusSnapshot {
  return createQuoteStatusSnapshot(input);
}

export function mergeStatusSnapshot(
  base: QuoteStatusSnapshot,
  patch: Partial<
    Pick<
      QuoteStatusSnapshot,
      | "lifecycleStatus"
      | "jobStatus"
      | "executionStatus"
      | "lastEventType"
      | "lastEventId"
      | "updatedAt"
    >
  >,
): QuoteStatusSnapshot {
  return {
    ...base,
    ...patch,
    quoteId: base.quoteId,
    workspaceId: base.workspaceId,
  };
}
