/**
 * V58 P6 — Quote History Builder (Audit Snapshot + Orchestration)
 */

import type {
  QuoteAuditSnapshot,
  QuoteHistoryRecord,
  QuoteHistoryStore,
  QuoteHistoryTimeline,
} from "./quote-history.types";
import type { QuoteDomainEvent } from "./quote-history.event";
import {
  appendHistoryRecord,
  createQuoteHistoryStore,
  getQuoteHistory,
} from "./quote-history.store";
import { buildQuoteTimeline } from "./quote-history.timeline";
import { replayQuoteExecution } from "./quote-history.replay";
import { mapEventToHistoryRecord } from "./quote-history.mapper";
import { buildCausationChain } from "./quote-history.selector";

export function ingestDomainEvent(
  store: QuoteHistoryStore,
  event: QuoteDomainEvent,
): QuoteHistoryRecord[] {
  const record = mapEventToHistoryRecord(event);
  return appendHistoryRecord(store, record);
}

export function ingestDomainEvents(
  store: QuoteHistoryStore,
  events: QuoteDomainEvent[],
): QuoteHistoryRecord[] {
  let records: QuoteHistoryRecord[] = [];
  for (const event of events) {
    records = appendHistoryRecord(store, mapEventToHistoryRecord(event));
  }
  return records;
}

export function buildQuoteHistoryPipeline(
  events: QuoteDomainEvent[],
): {
  store: QuoteHistoryStore;
  records: QuoteHistoryRecord[];
  timeline: QuoteHistoryTimeline | null;
} {
  const store = createQuoteHistoryStore();
  const records = ingestDomainEvents(store, events);
  const timeline = buildQuoteTimeline(records);

  return { store, records, timeline };
}

export function buildAuditSnapshot(
  records: QuoteHistoryRecord[],
  capturedAt?: string,
): QuoteAuditSnapshot | null {
  const replay = replayQuoteExecution(records);
  if (!replay) return null;

  const terminalEventId =
    replay.eventOrder[replay.eventOrder.length - 1] ?? replay.lifecycle.lastEventId;
  const causationChain = terminalEventId
    ? buildCausationChain(records, terminalEventId)
    : [];

  const allSourceIds = [
    ...replay.lifecycle.sourceEventIds,
    ...replay.jobs.flatMap((j) => j.sourceEventIds),
    ...replay.executions.flatMap((e) => e.sourceEventIds),
  ];

  return {
    snapshotId: `audit-${replay.quoteId}-${Date.now()}`,
    quoteId: replay.quoteId,
    workspaceId: replay.workspaceId,
    capturedAt: capturedAt ?? new Date().toISOString(),
    lifecycle: replay.lifecycle,
    jobs: replay.jobs,
    executions: replay.executions,
    eventCount: replay.replayedEventCount,
    causationChain,
    traceable: allSourceIds.length === replay.replayedEventCount,
  };
}

export function buildAuditSnapshotFromStore(
  store: QuoteHistoryStore,
  quoteId: string,
  capturedAt?: string,
): QuoteAuditSnapshot | null {
  const records = getQuoteHistory(store, quoteId);
  return buildAuditSnapshot(records, capturedAt);
}
