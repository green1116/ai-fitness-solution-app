import {
  assertQuoteLifecycleTransitionAllowed,
  canTransitionQuoteLifecycleStatus,
} from "./quote-lifecycle.transition";
import { cloneQuoteLifecycleState } from "./quote-lifecycle.state";
import type {
  QuoteLifecycleState,
  QuoteLifecycleStatus,
  QuoteLifecycleTransitionResult,
} from "./quote-lifecycle.types";

export function transitionQuoteLifecycleStatus(
  state: QuoteLifecycleState,
  nextStatus: QuoteLifecycleStatus,
  options?: {
    lastError?: string;
    incrementRetry?: boolean;
  },
): QuoteLifecycleTransitionResult {
  const previousStatus = state.status;

  if (!canTransitionQuoteLifecycleStatus(previousStatus, nextStatus)) {
    return {
      accepted: false,
      previousStatus,
      nextStatus,
      state,
      reason: `illegal quote lifecycle transition: ${previousStatus} -> ${nextStatus}`,
    };
  }

  const retryCount =
    options?.incrementRetry === true ? (state.retryCount ?? 0) + 1 : state.retryCount;

  const nextState = cloneQuoteLifecycleState(state, {
    status: nextStatus,
    retryCount,
    lastError: options?.lastError?.trim(),
  });

  return {
    accepted: true,
    previousStatus,
    nextStatus,
    state: nextState,
  };
}

export function reduceQuoteLifecycleState(
  state: QuoteLifecycleState,
  action: {
    type: "TRANSITION";
    nextStatus: QuoteLifecycleStatus;
    lastError?: string;
    incrementRetry?: boolean;
  },
): QuoteLifecycleTransitionResult {
  return transitionQuoteLifecycleStatus(state, action.nextStatus, {
    lastError: action.lastError,
    incrementRetry: action.incrementRetry,
  });
}

export function applyQuoteLifecycleTransitionOrThrow(
  state: QuoteLifecycleState,
  nextStatus: QuoteLifecycleStatus,
): QuoteLifecycleState {
  assertQuoteLifecycleTransitionAllowed(state.status, nextStatus);
  const result = transitionQuoteLifecycleStatus(state, nextStatus);
  if (!result.accepted) {
    throw new Error(result.reason ?? "quote lifecycle transition rejected");
  }
  return result.state;
}
