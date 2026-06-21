import type { QuoteJobEngineEntry, QuoteJobEngineStateTransitionResult } from "./quote-job-engine.types";
import {
  applyQuoteJobEngineEntryUpdate,
  canTransitionQuoteJobEngineResultStatus,
} from "./quote-job-engine.state";
import { transitionQuoteJobStatus } from "../job/quote-job.state";
import type { QuoteJobStatus } from "../job/quote-job.types";

const RESULT_STATUS_TO_JOB_STATUS: Partial<Record<string, QuoteJobStatus>> = {
  QUEUED: "PENDING",
  DISPATCHED: "DISPATCHED",
};

export function transitionJobState(
  entry: QuoteJobEngineEntry,
  nextResultStatus: QuoteJobEngineEntry["resultStatus"],
  options?: { lastError?: string; executionId?: string },
): QuoteJobEngineStateTransitionResult {
  const previousResultStatus = entry.resultStatus;

  if (!canTransitionQuoteJobEngineResultStatus(previousResultStatus, nextResultStatus)) {
    return {
      accepted: false,
      previousResultStatus,
      nextResultStatus,
      entry,
      reason: `illegal quote job engine transition: ${previousResultStatus} -> ${nextResultStatus}`,
    };
  }

  const targetJobStatus = RESULT_STATUS_TO_JOB_STATUS[nextResultStatus];
  let nextJobState = entry.jobState;

  if (targetJobStatus && targetJobStatus !== entry.jobState.status) {
    const jobTransition = transitionQuoteJobStatus(entry.jobState, targetJobStatus, {
      lastError: options?.lastError,
    });

    if (!jobTransition.accepted) {
      return {
        accepted: false,
        previousResultStatus,
        nextResultStatus,
        entry,
        reason: jobTransition.reason,
      };
    }

    nextJobState = jobTransition.state;
  }

  if (nextResultStatus === "COMPLETED" || nextResultStatus === "FAILED") {
    if (nextJobState.status === "DISPATCHED") {
      const activeTransition = transitionQuoteJobStatus(nextJobState, "ACTIVE");
      if (!activeTransition.accepted) {
        return {
          accepted: false,
          previousResultStatus,
          nextResultStatus,
          entry,
          reason: activeTransition.reason,
        };
      }
      nextJobState = activeTransition.state;
    }
  }

  if (nextResultStatus === "COMPLETED" && nextJobState.status === "ACTIVE") {
    const completedTransition = transitionQuoteJobStatus(nextJobState, "COMPLETED");
    if (!completedTransition.accepted) {
      return {
        accepted: false,
        previousResultStatus,
        nextResultStatus,
        entry,
        reason: completedTransition.reason,
      };
    }
    nextJobState = completedTransition.state;
  }

  if (nextResultStatus === "FAILED" && nextJobState.status === "ACTIVE") {
    const erroredTransition = transitionQuoteJobStatus(nextJobState, "ERRORED", {
      lastError: options?.lastError,
    });
    if (!erroredTransition.accepted) {
      return {
        accepted: false,
        previousResultStatus,
        nextResultStatus,
        entry,
        reason: erroredTransition.reason,
      };
    }
    nextJobState = erroredTransition.state;
  }

  return {
    accepted: true,
    previousResultStatus,
    nextResultStatus,
    entry: applyQuoteJobEngineEntryUpdate(entry, {
      jobState: nextJobState,
      resultStatus: nextResultStatus,
      executionId: options?.executionId ?? entry.executionId,
      lastError: options?.lastError ?? entry.lastError,
    }),
  };
}
