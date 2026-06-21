import type {
  QuoteUIReadiness,
  QuoteUIState,
  QuoteUIStatus,
} from "./quote-ui.model";

export type QuoteLoadingState =
  | "IDLE"
  | "LOADING"
  | "SUBMITTING"
  | "EXECUTING";

export function createQuoteLoadingState(state: QuoteLoadingState = "IDLE"): QuoteLoadingState {
  return state;
}

export function deriveQuoteLoadingState(input: {
  quoteStatus: QuoteUIStatus;
  explicit?: QuoteLoadingState;
}): QuoteLoadingState {
  if (input.explicit) {
    return input.explicit;
  }

  if (input.quoteStatus === "RUNNING") {
    return "EXECUTING";
  }

  return "IDLE";
}

export function markQuoteLoadingSubmitting(): QuoteLoadingState {
  return "SUBMITTING";
}

export function markQuoteLoadingExecuting(): QuoteLoadingState {
  return "EXECUTING";
}

export function markQuoteLoadingIdle(): QuoteLoadingState {
  return "IDLE";
}

export function isQuoteLoadingActive(loading: QuoteLoadingState): boolean {
  return loading !== "IDLE";
}

export interface QuoteLoadingSurface {
  loading: QuoteLoadingState;
  isActive: boolean;
  label: string;
}

export function buildQuoteLoadingSurface(loading: QuoteLoadingState): QuoteLoadingSurface {
  const labels: Record<QuoteLoadingState, string> = {
    IDLE: "Ready",
    LOADING: "Loading",
    SUBMITTING: "Submitting",
    EXECUTING: "Executing",
  };

  return {
    loading,
    isActive: isQuoteLoadingActive(loading),
    label: labels[loading],
  };
}

export function computeQuoteLoadingFromReadiness(
  quoteStatus: QuoteUIStatus,
  readiness: QuoteUIReadiness,
): QuoteLoadingState {
  if (quoteStatus === "RUNNING") {
    return "EXECUTING";
  }

  if (readiness === "PARTIAL") {
    return "LOADING";
  }

  return "IDLE";
}
