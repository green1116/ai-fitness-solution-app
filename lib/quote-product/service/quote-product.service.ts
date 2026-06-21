import type {
  QuoteProductExecutionView,
  QuoteSurfaceView,
  QuoteWorkspaceView,
} from "../shared/quote-product-types";
import { resolveQuoteWorkspace } from "../workspace/quote-workspace.resolver";
import type { QuoteWorkspaceResolveInput, ResolvedQuoteWorkspace } from "../workspace/quote-workspace.types";
import { loadQuoteWorkspace } from "../workspace/quote-workspace.service";
import { mapExecutionResultToEntryUIState } from "../entry/quote-entry.mapper";
import type { QuoteEntrySubmissionResult } from "../entry/quote-entry.types";
import { dispatchQuoteProductExecution } from "./quote-product.execution";
import {
  mapProductResultToExecutionView,
  mapRuntimeClientResultToProductResult,
} from "./quote-product-result.mapper";
import type {
  QuoteProductContext,
  QuoteProductResult,
  QuoteProductSubmission,
  QuoteProductSurface,
} from "./quote-product.types";
import {
  assertQuoteProductContext,
  assertQuoteProductSubmission,
  assertQuoteWorkspaceResolveInput,
} from "./quote-product.validation";

export function createQuoteProductContext(input: {
  workspaceId: string;
  tenantId?: string;
  sessionId?: string;
  quoteId?: string;
}): QuoteProductContext {
  const context: QuoteProductContext = {
    workspaceId: input.workspaceId.trim(),
    tenantId: input.tenantId?.trim(),
    sessionId: input.sessionId?.trim(),
    quoteId: input.quoteId?.trim(),
  };
  assertQuoteProductContext(context);
  return context;
}

export function resolveQuoteWorkspaceContext(
  input: QuoteWorkspaceResolveInput,
): ResolvedQuoteWorkspace {
  assertQuoteWorkspaceResolveInput(input);
  return resolveQuoteWorkspace(input);
}

export function getQuoteStatusForUI(workspaceId: string) {
  return loadQuoteWorkspace(workspaceId).uiState;
}

export function renderQuoteSurface(workspaceId: string): QuoteSurfaceView {
  const workspace = loadQuoteWorkspace(workspaceId);
  const status = getQuoteStatusForUI(workspaceId);

  return {
    workspaceId: workspace.workspaceId,
    title: workspace.title,
    quoteStatus: status.quoteStatus,
    readiness: status.readiness,
    sections: [
      { key: "overview", label: "Overview", visible: true },
      { key: "execution", label: "Execution", visible: status.quoteStatus !== "EMPTY" },
      { key: "audit", label: "Audit Trail", visible: status.quoteStatus === "DONE" },
    ],
  };
}

export function getQuoteWorkspaceView(workspaceId: string): QuoteWorkspaceView {
  return loadQuoteWorkspace(workspaceId);
}

export function mapExecutionViewForUI(
  workspaceId: string,
  input: Pick<QuoteProductExecutionView, "success" | "quoteId" | "executionId" | "logs">,
): QuoteProductExecutionView {
  const status = getQuoteStatusForUI(workspaceId);
  return {
    workspaceId,
    success: input.success,
    quoteId: input.quoteId,
    executionId: input.executionId,
    quoteStatus: input.success ? "DONE" : "FAILED",
    readiness: input.success ? "READY" : "BLOCKED",
    logs: [...input.logs, `product.quoteStatus=${status.quoteStatus}`],
  };
}

function mapWorkspaceQuoteStatusToProductStatus(
  quoteStatus: QuoteWorkspaceView["uiState"]["quoteStatus"],
): QuoteProductSurface["productStatus"] {
  if (quoteStatus === "RUNNING") {
    return "RUNNING";
  }
  if (quoteStatus === "DONE") {
    return "DONE";
  }
  if (quoteStatus === "FAILED") {
    return "FAILED";
  }
  return "IDLE";
}

export function buildQuoteProductSurface(
  workspaceId: string,
  options?: Pick<QuoteWorkspaceResolveInput, "tenantId" | "sessionId">,
): QuoteProductSurface {
  const resolved = resolveQuoteWorkspaceContext({ workspaceId, ...options });
  const context = createQuoteProductContext(resolved);
  const workspace = loadQuoteWorkspace(resolved.workspaceId);

  return {
    context,
    workspaceId: resolved.workspaceId,
    title: resolved.title,
    portalRoute: resolved.portalRoute,
    productStatus: mapWorkspaceQuoteStatusToProductStatus(workspace.uiState.quoteStatus),
  };
}

export async function submitQuoteToProductService(
  submission: QuoteProductSubmission,
): Promise<{ context: QuoteProductContext; result: QuoteProductResult }> {
  assertQuoteProductSubmission(submission);
  const result = await dispatchQuoteProductExecution(submission.context);
  return {
    context: submission.context,
    result,
  };
}

export function mapProductResultToEntryState(
  workspaceId: string,
  result: QuoteProductResult,
): QuoteEntrySubmissionResult["uiState"] {
  const executionView = mapProductResultToExecutionView(workspaceId, result);
  return mapExecutionResultToEntryUIState(executionView);
}

export function mapRuntimeResultToProductResult(
  runtimeResult: Parameters<typeof mapRuntimeClientResultToProductResult>[0],
): QuoteProductResult {
  return mapRuntimeClientResultToProductResult(runtimeResult);
}
