export type QuoteJobCommandType = "EXECUTE_QUOTE";

export interface QuoteJobCommand {
  jobId: string;
  quoteId: string;
  workspaceId: string;
  type: QuoteJobCommandType;
  payload?: unknown;
}
