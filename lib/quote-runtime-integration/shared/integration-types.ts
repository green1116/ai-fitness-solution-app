import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";
import type { QuotePortRegistry } from "@/lib/quote-runtime/ports/quote-port-types";
export type QuoteExecutionStatus = "CREATED" | "UPDATED" | "FAILED";

export type QuoteRuntimePorts = QuotePortRegistry;

export interface QuoteExecutionContext {
  workspaceId: string;
  snapshot: WorkspaceQuoteRuntimeSnapshot;
  ports: QuoteRuntimePorts;
}

export interface QuoteExecutionResult {
  success: boolean;
  quoteId?: string;
  status: QuoteExecutionStatus;
  logs: string[];
}

export interface QuoteRuntimeExecutor {
  execute(context: QuoteExecutionContext): QuoteExecutionResult;
}

export interface QuoteRuntimeIntegrationService {
  createQuoteExecution(context: QuoteExecutionContext): QuoteExecutionResult;
  describe(context: QuoteExecutionContext): string;
}
