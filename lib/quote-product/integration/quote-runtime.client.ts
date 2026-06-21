import type { QuoteEndToEndResult } from "@/lib/quote-runtime-integration";
import { runQuoteEndToEndFlow } from "@/lib/quote-runtime-integration";
import type { QuoteExecutionMode } from "../execution/quote-execution.types";

export interface QuoteRuntimeClientRequest {
  workspaceId: string;
  quoteId?: string;
  executionMode?: QuoteExecutionMode;
}

export interface QuoteRuntimeClientResult {
  workspaceId: string;
  success: boolean;
  quoteId?: string;
  executionId?: string;
  logs: string[];
}

function resolveRuntimeClientRequest(
  input: string | QuoteRuntimeClientRequest,
): QuoteRuntimeClientRequest {
  if (typeof input === "string") {
    return { workspaceId: input.trim(), executionMode: "SYNC" };
  }

  return {
    workspaceId: input.workspaceId.trim(),
    quoteId: input.quoteId?.trim(),
    executionMode: input.executionMode ?? "SYNC",
  };
}

function mapEndToEndResult(
  request: QuoteRuntimeClientRequest,
  result: QuoteEndToEndResult,
): QuoteRuntimeClientResult {
  return {
    workspaceId: request.workspaceId,
    success: result.executionResult.success && result.workflowResult.success,
    quoteId: result.workflowResult.quoteId ?? request.quoteId,
    executionId: result.workflowResult.executionId,
    logs: result.logs,
  };
}

export async function executeQuoteViaRuntimeClient(
  input: string | QuoteRuntimeClientRequest,
): Promise<QuoteRuntimeClientResult> {
  const request = resolveRuntimeClientRequest(input);
  const result: QuoteEndToEndResult = await runQuoteEndToEndFlow(request.workspaceId);
  return mapEndToEndResult(request, result);
}

export function describeQuoteRuntimeClient(workspaceId: string): string {
  return `quoteRuntimeClient.workspaceId=${workspaceId}`;
}
