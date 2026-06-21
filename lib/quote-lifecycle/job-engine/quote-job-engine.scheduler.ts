import {
  QUOTE_JOB_RESULT_STATUS_COMPLETED,
  QUOTE_JOB_RESULT_STATUS_FAILED,
} from "../shared/quote-lifecycle-constants";
import type { QuoteJobScheduleOptions } from "./quote-job-engine.interface";
import type { QuoteJobResult } from "./quote-job-result.types";
import { transitionJobState } from "./quote-job-engine.reducer";
import {
  getRegistryJob,
  setRegistryJob,
  type QuoteJobRegistry,
} from "./quote-job-engine.registry";

function buildJobResult(entry: import("./quote-job-engine.types").QuoteJobEngineEntry): QuoteJobResult {
  return {
    jobId: entry.command.jobId,
    success: entry.resultStatus === "COMPLETED",
    executionId: entry.executionId,
    error: entry.lastError,
    status: entry.resultStatus,
  };
}

export function scheduleJob(
  registry: QuoteJobRegistry,
  jobId: string,
  options?: QuoteJobScheduleOptions,
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

  const nextStatus =
    options?.simulateFailure === true
      ? QUOTE_JOB_RESULT_STATUS_FAILED
      : QUOTE_JOB_RESULT_STATUS_COMPLETED;

  const transition = transitionJobState(entry, nextStatus, {
    lastError: options?.simulateFailure ? options.error ?? "simulated schedule failure" : undefined,
    executionId: entry.executionId ?? `exec-${entry.command.jobId}`,
  });

  if (!transition.accepted) {
    return {
      jobId: entry.command.jobId,
      success: false,
      error: transition.reason,
      status: entry.resultStatus,
    };
  }

  setRegistryJob(registry, transition.entry);
  return buildJobResult(transition.entry);
}
