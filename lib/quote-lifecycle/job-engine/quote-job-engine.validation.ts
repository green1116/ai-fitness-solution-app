import {
  QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE,
  QUOTE_JOB_RESULT_STATUS_COMPLETED,
  QUOTE_JOB_RESULT_STATUS_FAILED,
} from "../shared/quote-lifecycle-constants";
import type { QuoteJobCommand } from "./quote-job-command.types";
import type { QuoteJobResolveResult } from "./quote-job-engine.types";
import {
  getRegistryJob,
  type QuoteJobRegistry,
} from "./quote-job-engine.registry";

export function validateJobCommand(command: QuoteJobCommand): boolean {
  return (
    command.jobId.trim().length > 0 &&
    command.quoteId.trim().length > 0 &&
    command.workspaceId.trim().length > 0 &&
    command.type === QUOTE_JOB_COMMAND_TYPE_EXECUTE_QUOTE
  );
}

export function assertJobCommand(command: QuoteJobCommand): void {
  if (!validateJobCommand(command)) {
    throw new Error("quote job command requires jobId, quoteId, workspaceId, and EXECUTE_QUOTE type");
  }
}

export function resolveJob(registry: QuoteJobRegistry, jobId: string): QuoteJobResolveResult {
  const entry = getRegistryJob(registry, jobId);

  if (!entry) {
    return {
      jobId: jobId.trim(),
      resolved: false,
      reason: "job not found",
    };
  }

  const terminal =
    entry.resultStatus === QUOTE_JOB_RESULT_STATUS_COMPLETED ||
    entry.resultStatus === QUOTE_JOB_RESULT_STATUS_FAILED;

  return {
    jobId: entry.command.jobId,
    resolved: terminal,
    result: entry.resultStatus,
    entry,
    reason: terminal ? undefined : "job still in progress",
  };
}

export function validateQuoteJobEngineEntry(entry: import("./quote-job-engine.types").QuoteJobEngineEntry): boolean {
  return validateJobCommand(entry.command);
}
