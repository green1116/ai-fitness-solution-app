"use server";

import { submitQuoteEntry } from "../entry/quote-entry.controller";
import { mapExecutionResultToUIState } from "../ui/quote-ui-state.mapper";
import { buildQuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteUIState } from "../ui/quote-ui.model";
import { loadQuoteProductSurface } from "./quote-product.surface";

export interface QuoteProductSurfaceActionResult {
  state: QuoteUIState;
  viewModel: QuoteViewModel;
}

export async function submitQuoteProductSurfaceAction(input: {
  workspaceId: string;
  title?: string;
}): Promise<QuoteProductSurfaceActionResult> {
  const workspaceId = input.workspaceId.trim();
  const submission = await submitQuoteEntry({
    workspaceId,
    title: input.title,
    submit: true,
  });

  const state = mapExecutionResultToUIState(submission.execution);
  return {
    state,
    viewModel: buildQuoteViewModel(state),
  };
}

export async function refreshQuoteProductSurfaceAction(
  workspaceId: string,
): Promise<QuoteProductSurfaceActionResult> {
  const surface = loadQuoteProductSurface(workspaceId);
  return {
    state: surface.state,
    viewModel: surface.viewModel,
  };
}
