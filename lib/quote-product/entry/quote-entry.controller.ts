import type { QuoteEntryRequest, QuoteEntryView } from "../shared/quote-product-types";
import { executeQuoteFromUI } from "../service/quote-product.orchestrator";
import { loadQuoteWorkspace } from "../workspace/quote-workspace.service";
import {
  mapExecutionResultToEntryUIState,
  mapQuoteEntryRequestToView,
  mapQuoteEntryToUIState,
} from "./quote-entry.mapper";
import type {
  QuoteEntryFormInput,
  QuoteEntrySubmission,
  QuoteEntrySubmissionResult,
  QuoteEntrySurface,
  QuoteEntryWorkspaceView,
} from "./quote-entry.types";
import {
  assertQuoteEntryRequest,
  assertQuoteEntrySubmission,
  validateQuoteEntryFormInput,
} from "./quote-entry.validation";

export function createQuoteEntry(request: QuoteEntryRequest): QuoteEntryView {
  assertQuoteEntryRequest(request);
  return mapQuoteEntryRequestToView(request);
}

export function loadQuoteEntryWorkspace(workspaceId: string): QuoteEntryWorkspaceView {
  assertQuoteEntryRequest({ workspaceId });
  const workspace = loadQuoteWorkspace(workspaceId);
  const entry = createQuoteEntry({ workspaceId, title: workspace.title });

  return {
    workspaceId: workspace.workspaceId,
    title: workspace.title,
    portalRoute: workspace.portalRoute,
    entry,
    uiState: mapQuoteEntryToUIState(entry),
  };
}

export function buildQuoteEntrySurface(workspaceId: string): QuoteEntrySurface {
  const view = loadQuoteEntryWorkspace(workspaceId);

  return {
    workspaceId: view.workspaceId,
    portalRoute: view.portalRoute,
    title: view.title,
    entry: view.entry,
    uiState: view.uiState,
    form: {
      workspaceId: view.workspaceId,
      titlePlaceholder: "Enter quote title",
      submitLabel: "Submit Quote Entry",
    },
  };
}

export async function submitQuoteEntry(
  submission: QuoteEntrySubmission,
): Promise<QuoteEntrySubmissionResult> {
  assertQuoteEntrySubmission(submission);
  const entry = createQuoteEntry({
    workspaceId: submission.workspaceId,
    title: submission.title,
  });
  const execution = await executeQuoteFromUI(submission.workspaceId);

  return {
    entry,
    execution,
    uiState: mapExecutionResultToEntryUIState(execution),
  };
}

export function createQuoteEntryFromForm(input: QuoteEntryFormInput): QuoteEntryView {
  if (!validateQuoteEntryFormInput(input)) {
    throw new Error("workspaceId is required");
  }
  return createQuoteEntry(input);
}

export function describeQuoteEntry(entry: QuoteEntryView): string {
  return `entryId=${entry.entryId} workspaceId=${entry.workspaceId} status=${entry.quoteStatus}`;
}

export function describeQuoteEntrySurface(workspaceId: string): string {
  const surface = buildQuoteEntrySurface(workspaceId);
  return [
    `workspaceId=${surface.workspaceId}`,
    `route=${surface.portalRoute}`,
    `entryId=${surface.entry.entryId}`,
    `quoteStatus=${surface.uiState.quoteStatus}`,
  ].join(" ");
}
