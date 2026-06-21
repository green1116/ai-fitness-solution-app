import {
  QUOTE_UI_READINESS_BLOCKED,
  QUOTE_UI_READINESS_PARTIAL,
  QUOTE_UI_READINESS_READY,
} from "../shared/quote-product-constants";
import type { QuoteUIReadiness, QuoteUIStatus } from "./quote-ui.model";

export function computeQuoteReadiness(input: {
  quoteStatus: QuoteUIStatus;
  success?: boolean;
  hasError?: boolean;
}): QuoteUIReadiness {
  if (input.hasError || input.quoteStatus === "FAILED") {
    return QUOTE_UI_READINESS_BLOCKED;
  }

  if (input.quoteStatus === "RUNNING") {
    return QUOTE_UI_READINESS_PARTIAL;
  }

  if (input.success === false) {
    return QUOTE_UI_READINESS_BLOCKED;
  }

  if (input.quoteStatus === "DONE" || input.quoteStatus === "DRAFT" || input.quoteStatus === "EMPTY") {
    return QUOTE_UI_READINESS_READY;
  }

  return QUOTE_UI_READINESS_READY;
}

export function describeQuoteReadiness(readiness: QuoteUIReadiness): string {
  return readiness;
}
