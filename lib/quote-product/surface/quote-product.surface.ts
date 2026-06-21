import { buildQuoteEntrySurface } from "../entry/quote-entry.controller";
import type { QuoteEntrySurface } from "../entry/quote-entry.types";
import type { QuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteUIState } from "../ui/quote-ui.model";
import type { QuoteWorkspaceSurface } from "../workspace/quote-workspace.surface";
import { buildQuoteWorkspaceSurface } from "../workspace/quote-workspace.surface";
import { buildQuoteProductState } from "./quote-product.state";
import { buildQuoteProductViewModel } from "./quote-product.viewmodel";

export interface QuoteProductSurfaceActions {
  submit: (input?: { title?: string }) => Promise<void>;
  refresh: () => Promise<void>;
}

export interface QuoteProductSurfaceData {
  workspaceId: string;
  title: string;
  portalRoute: string;
  state: QuoteUIState;
  viewModel: QuoteViewModel;
  entry: QuoteEntrySurface;
  workspace: QuoteWorkspaceSurface;
}

export interface QuoteProductSurface extends QuoteProductSurfaceData {
  actions: QuoteProductSurfaceActions;
}

export function buildQuoteProductSurface(workspaceId: string): QuoteProductSurfaceData {
  const entry = buildQuoteEntrySurface(workspaceId);
  const workspace = buildQuoteWorkspaceSurface(workspaceId);
  const state = buildQuoteProductState(workspaceId);
  const viewModel = buildQuoteProductViewModel(workspaceId, state);

  return {
    workspaceId: entry.workspaceId,
    title: entry.title,
    portalRoute: entry.portalRoute,
    state,
    viewModel,
    entry,
    workspace,
  };
}

export function loadQuoteProductSurface(workspaceId: string): QuoteProductSurfaceData {
  return buildQuoteProductSurface(workspaceId);
}
