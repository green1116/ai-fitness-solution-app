import type { QuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteUIState } from "../ui/quote-ui.model";
import type { QuoteProductSurfaceActions } from "./quote-product.surface";
import type { QuoteProductSurfaceActionResult } from "./quote-product.actions.server";

export function bindQuoteProductActions(
  workspaceId: string,
  handlers: {
    submitAction: (input: { workspaceId: string; title?: string }) => Promise<QuoteProductSurfaceActionResult>;
    refreshAction: (workspaceId: string) => Promise<QuoteProductSurfaceActionResult>;
    onStateChange: (state: QuoteUIState, viewModel: QuoteViewModel) => void;
  },
): QuoteProductSurfaceActions {
  return {
    submit: async (input) => {
      const result = await handlers.submitAction({
        workspaceId,
        title: input?.title,
      });
      handlers.onStateChange(result.state, result.viewModel);
    },
    refresh: async () => {
      const result = await handlers.refreshAction(workspaceId);
      handlers.onStateChange(result.state, result.viewModel);
    },
  };
}

export function createQuoteProductSurfaceActions(
  workspaceId: string,
  handlers: {
    submitAction: (input: { workspaceId: string; title?: string }) => Promise<QuoteProductSurfaceActionResult>;
    refreshAction: (workspaceId: string) => Promise<QuoteProductSurfaceActionResult>;
    onStateChange: (state: QuoteUIState, viewModel: QuoteViewModel) => void;
  },
): QuoteProductSurfaceActions {
  return bindQuoteProductActions(workspaceId, handlers);
}

export type { QuoteProductSurfaceActionResult } from "./quote-product.actions.server";
