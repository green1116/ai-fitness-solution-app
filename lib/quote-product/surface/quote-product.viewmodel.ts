import { buildQuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteViewModel } from "../ui/quote-ui-view.model";
import type { QuoteUIState } from "../ui/quote-ui.model";
import { buildQuoteProductState } from "./quote-product.state";

export function buildQuoteProductViewModel(
  workspaceId: string,
  state?: QuoteUIState,
): QuoteViewModel {
  const uiState = state ?? buildQuoteProductState(workspaceId);
  return buildQuoteViewModel(uiState);
}
