import type { QuoteExecutionStatus } from "./quote-execution.types";

export const QUOTE_EXECUTION_TERMINAL_STATUSES: QuoteExecutionStatus[] = ["DONE", "ERROR", "UNKNOWN"];

export function isQuoteExecutionTerminal(status: QuoteExecutionStatus): boolean {
  return QUOTE_EXECUTION_TERMINAL_STATUSES.includes(status);
}

export function isQuoteExecutionActive(status: QuoteExecutionStatus): boolean {
  return status === "STARTED" || status === "IN_PROGRESS";
}

export function describeQuoteExecutionStatus(status: QuoteExecutionStatus): string {
  return status;
}
