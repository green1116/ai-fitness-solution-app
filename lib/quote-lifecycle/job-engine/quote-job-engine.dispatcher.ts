import { QUOTE_JOB_RESULT_STATUS_DISPATCHED } from "../shared/quote-lifecycle-constants";
import type { QuoteAsyncClientPlaceholder } from "./quote-job-engine.interface";
import type { QuoteJobResult } from "./quote-job-result.types";
import { transitionJobState } from "./quote-job-engine.reducer";
import {
  getRegistryJob,
  setRegistryJob,
  type QuoteJobRegistry,
} from "./quote-job-engine.registry";

function buildDispatchedJobResult(
  entry: import("./quote-job-engine.types").QuoteJobEngineEntry,
): QuoteJobResult {
  return {
    jobId: entry.command.jobId,
    success: entry.resultStatus === "DISPATCHED",
    executionId: entry.executionId,
    error: entry.lastError,
    status: entry.resultStatus,
  };
}

export function dispatchJob(
  registry: QuoteJobRegistry,
  jobId: string,
  asyncClient: QuoteAsyncClientPlaceholder,
): QuoteJobResult {
  const entry = getRegistryJob(registry, jobId);

  if (!entry) {
    return {
      jobId: jobId.trim(),
      success: false,
      error: "job not found",
      status: "FAILED",
    };
  }

  const transition = transitionJobState(entry, QUOTE_JOB_RESULT_STATUS_DISPATCHED);

  if (!transition.accepted) {
    return {
      jobId: entry.command.jobId,
      success: false,
      error: transition.reason,
      status: entry.resultStatus,
    };
  }

  const clientAck = asyncClient.submit(transition.entry.command);
  const executionId = clientAck.accepted
    ? `exec-${transition.entry.command.jobId}`
    : undefined;

  const dispatchedEntry = {
    ...transition.entry,
    executionId,
    lastError: clientAck.accepted ? undefined : "async client rejected dispatch",
  };

  setRegistryJob(registry, dispatchedEntry);

  return buildDispatchedJobResult(dispatchedEntry);
}
