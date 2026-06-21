/**
 * V58 P6 — Quote History Foundation
 * Event → Persistent History → Replay Model (domain layer only)
 */

export const QUOTE_HISTORY_VERSION = "v58-p6-quote-history-1" as const;
export type QuoteHistoryVersion = typeof QUOTE_HISTORY_VERSION;

export interface QuoteHistoryRecord {
  eventId: string;
  quoteId: string;
  workspaceId: string;
  jobId?: string;
  executionId?: string;
  eventType: string;
  timestamp: string;
  payload: unknown;
  causationId?: string;
  correlationId?: string;
}

export type QuoteHistoryEventCategory = "lifecycle" | "job" | "execution";

export interface QuoteHistoryTimelineEntry {
  eventId: string;
  category: QuoteHistoryEventCategory;
  eventType: string;
  timestamp: string;
  record: QuoteHistoryRecord;
}

export interface QuoteHistoryTimeline {
  quoteId: string;
  workspaceId: string;
  lifecycleEvents: QuoteHistoryTimelineEntry[];
  jobEvents: QuoteHistoryTimelineEntry[];
  executionEvents: QuoteHistoryTimelineEntry[];
  totalEvents: number;
  firstEventAt: string | null;
  lastEventAt: string | null;
}

export interface QuoteLifecycleReplayState {
  quoteId: string;
  status: string;
  lastEventId: string;
  stepIndex: number;
  sourceEventIds: string[];
}

export interface QuoteJobReplayState {
  jobId: string;
  status: string;
  lastEventId: string;
  sourceEventIds: string[];
}

export interface QuoteExecutionReplayState {
  executionId: string;
  status: string;
  lastEventId: string;
  sourceEventIds: string[];
}

export interface QuoteExecutionReplayResult {
  quoteId: string;
  workspaceId: string;
  lifecycle: QuoteLifecycleReplayState;
  jobs: QuoteJobReplayState[];
  executions: QuoteExecutionReplayState[];
  replayedEventCount: number;
  deterministic: boolean;
  eventOrder: string[];
}

export interface QuoteAuditSnapshot {
  snapshotId: string;
  quoteId: string;
  workspaceId: string;
  capturedAt: string;
  lifecycle: QuoteLifecycleReplayState;
  jobs: QuoteJobReplayState[];
  executions: QuoteExecutionReplayState[];
  eventCount: number;
  causationChain: string[];
  traceable: boolean;
}

export interface QuoteHistoryStore {
  version: QuoteHistoryVersion;
  records: Map<string, QuoteHistoryRecord[]>;
}

export interface QuoteLifecycleReconstruction {
  quoteId: string;
  workspaceId: string;
  status: string;
  stepIndex: number;
  reconstructedAt: string;
  sourceEventIds: string[];
  deterministic: boolean;
}
