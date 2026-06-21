import type { QuoteProductResult } from "../service/quote-product.types";
import type { QuoteProductExecutionView } from "../shared/quote-product-types";
import type { QuoteErrorSurface } from "./quote-ui-error";
import { buildQuoteErrorSurface } from "./quote-ui-error";
import type { QuoteLoadingState } from "./quote-ui-loading";
import { deriveQuoteLoadingState } from "./quote-ui-loading";
import type { QuoteUIReadiness, QuoteUIState, QuoteUIStatus } from "./quote-ui.model";
import {
  mapExecutionResultToUIState,
  mapProductResultToUIState,
} from "./quote-ui-state.mapper";

export interface QuoteViewModel {
  workspaceId: string;
  quoteStatus: QuoteUIStatus;
  readiness: QuoteUIReadiness;
  loading: QuoteLoadingState;
  lastExecutionId?: string;
  lastError?: string;
  error?: QuoteErrorSurface;
}

export function buildQuoteViewModel(
  state: QuoteUIState,
  options?: {
    loading?: QuoteLoadingState;
    error?: QuoteErrorSurface;
  },
): QuoteViewModel {
  const loading = options?.loading ?? deriveQuoteLoadingState({ quoteStatus: state.quoteStatus });
  const error =
    options?.error ??
    buildQuoteErrorSurface({
      message: state.lastError,
      code: state.lastError ? "QUOTE_UI_STATE_ERROR" : undefined,
    });

  return {
    workspaceId: state.workspaceId,
    quoteStatus: state.quoteStatus,
    readiness: state.readiness,
    loading,
    lastExecutionId: state.lastExecutionId,
    lastError: state.lastError,
    error,
  };
}

export function mapProductResultToViewModel(
  workspaceId: string,
  result: QuoteProductResult,
): QuoteViewModel {
  return buildQuoteViewModel(mapProductResultToUIState(workspaceId, result));
}

export function mapExecutionResultToViewModel(
  execution: QuoteProductExecutionView,
): QuoteViewModel {
  return buildQuoteViewModel(mapExecutionResultToUIState(execution));
}
