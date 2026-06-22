/**
 * V58 P6 — Quote History Replay Engine
 */

import type {
  QuoteExecutionReplayResult,
  QuoteExecutionReplayState,
  QuoteHistoryRecord,
  QuoteJobReplayState,
  QuoteLifecycleReplayState,
  QuoteLifecycleReconstruction,
} from "./quote-history.types";
import {
  categorizeQuoteEvent,
  extractStatusFromPayload,
  extractStepIndexFromPayload,
} from "./quote-history.event";
import { sortHistoryRecords } from "./quote-history.record";

function applyLifecycleEvent(
  state: QuoteLifecycleReplayState,
  record: QuoteHistoryRecord,
): QuoteLifecycleReplayState {
  return {
    quoteId: record.quoteId,
    status: extractStatusFromPayload(record.payload),
    lastEventId: record.eventId,
    stepIndex: extractStepIndexFromPayload(record.payload),
    sourceEventIds: [...state.sourceEventIds, record.eventId],
  };
}

function applyJobEvent(
  jobs: Map<string, QuoteJobReplayState>,
  record: QuoteHistoryRecord,
): void {
  const jobId = record.jobId ?? `job-${record.eventId}`;
  const existing = jobs.get(jobId);
  jobs.set(jobId, {
    jobId,
    status: extractStatusFromPayload(record.payload),
    lastEventId: record.eventId,
    sourceEventIds: [...(existing?.sourceEventIds ?? []), record.eventId],
  });
}

function applyExecutionEvent(
  executions: Map<string, QuoteExecutionReplayState>,
  record: QuoteHistoryRecord,
): void {
  const executionId = record.executionId ?? `exec-${record.eventId}`;
  const existing = executions.get(executionId);
  executions.set(executionId, {
    executionId,
    status: extractStatusFromPayload(record.payload),
    lastEventId: record.eventId,
    sourceEventIds: [...(existing?.sourceEventIds ?? []), record.eventId],
  });
}

export function replayQuoteExecution(
  records: QuoteHistoryRecord[],
): QuoteExecutionReplayResult | null {
  if (records.length === 0) return null;

  const sorted = sortHistoryRecords(records);
  const quoteId = sorted[0].quoteId;
  const workspaceId = sorted[0].workspaceId;

  let lifecycle: QuoteLifecycleReplayState = {
    quoteId,
    status: "created",
    lastEventId: "",
    stepIndex: 0,
    sourceEventIds: [],
  };

  const jobs = new Map<string, QuoteJobReplayState>();
  const executions = new Map<string, QuoteExecutionReplayState>();
  const eventOrder: string[] = [];

  for (const record of sorted) {
    eventOrder.push(record.eventId);
    const category = categorizeQuoteEvent(record.eventType);

    switch (category) {
      case "lifecycle":
        lifecycle = applyLifecycleEvent(lifecycle, record);
        break;
      case "job":
        applyJobEvent(jobs, record);
        break;
      case "execution":
        applyExecutionEvent(executions, record);
        break;
    }
  }

  return {
    quoteId,
    workspaceId,
    lifecycle,
    jobs: [...jobs.values()],
    executions: [...executions.values()],
    replayedEventCount: sorted.length,
    deterministic: true,
    eventOrder,
  };
}

export function reconstructLifecycleFromHistory(
  records: QuoteHistoryRecord[],
): QuoteLifecycleReconstruction | null {
  if (records.length === 0) return null;

  const sorted = sortHistoryRecords(records);
  const lifecycleRecords = sorted.filter(
    (r) => categorizeQuoteEvent(r.eventType) === "lifecycle",
  );

  if (lifecycleRecords.length === 0) return null;

  let status = "created";
  let stepIndex = 0;
  const sourceEventIds: string[] = [];

  for (const record of lifecycleRecords) {
    sourceEventIds.push(record.eventId);
    status = extractStatusFromPayload(record.payload);
    stepIndex = extractStepIndexFromPayload(record.payload);
  }

  return {
    quoteId: sorted[0].quoteId,
    workspaceId: sorted[0].workspaceId,
    status,
    stepIndex,
    reconstructedAt: lifecycleRecords[lifecycleRecords.length - 1].timestamp,
    sourceEventIds,
    deterministic: true,
  };
}

export function verifyReplayDeterminism(
  records: QuoteHistoryRecord[],
): boolean {
  const first = replayQuoteExecution(records);
  const second = replayQuoteExecution(records);
  if (!first || !second) return first === second;
  return JSON.stringify(first) === JSON.stringify(second);
}
