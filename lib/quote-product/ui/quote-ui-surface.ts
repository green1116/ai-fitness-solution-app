import { resolveQuoteWorkspaceRoute } from "../workspace/quote-workspace.resolver";
import type { QuoteViewModel } from "./quote-ui-view.model";
import { buildQuoteViewModel } from "./quote-ui-view.model";
import type { QuoteUIState } from "./quote-ui.model";
import { buildQuoteLoadingSurface } from "./quote-ui-loading";

export interface QuoteUISurfaceSection {
  key: string;
  label: string;
  visible: boolean;
}

export interface QuoteUISurface {
  workspaceId: string;
  portalRoute: string;
  viewModel: QuoteViewModel;
  sections: QuoteUISurfaceSection[];
  loadingLabel: string;
  errorMessage?: string;
}

export function buildQuoteUISurface(
  state: QuoteUIState,
  options?: {
    title?: string;
    loading?: QuoteViewModel["loading"];
  },
): QuoteUISurface {
  const viewModel = buildQuoteViewModel(state, { loading: options?.loading });
  const loadingSurface = buildQuoteLoadingSurface(viewModel.loading);

  return {
    workspaceId: state.workspaceId,
    portalRoute: resolveQuoteWorkspaceRoute(state.workspaceId),
    viewModel,
    loadingLabel: loadingSurface.label,
    errorMessage: viewModel.error?.message ?? state.lastError,
    sections: [
      { key: "overview", label: "Overview", visible: true },
      {
        key: "execution",
        label: "Execution",
        visible: state.quoteStatus !== "EMPTY" && state.quoteStatus !== "DRAFT",
      },
      { key: "audit", label: "Audit Trail", visible: state.quoteStatus === "DONE" },
      { key: "error", label: "Error", visible: Boolean(viewModel.error?.visible) },
    ],
  };
}
