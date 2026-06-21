/**
 * V58 P7 — Quote Orchestration Port Resolver (dependency wiring)
 */

import type { QuoteHistoryStore } from "../history/quote-history.types";
import type { QuoteDomainEvent } from "../history/quote-history.event";
import {
  appendHistoryRecord,
  createQuoteHistoryStore,
  getQuoteHistory,
} from "../history/quote-history.store";
import { mapEventToHistoryRecord } from "../history/quote-history.mapper";
import type {
  QuoteAsyncPort,
  QuoteEventPort,
  QuoteHistoryPort,
  QuoteJobPort,
  QuoteLifecyclePort,
  QuoteOrchestratorPorts,
  QuoteStatusPort,
} from "./quote-orchestrator.interface";
import type {
  QuoteAsyncCoordinationResult,
  QuoteEventCoordinationResult,
  QuoteHistoryCoordinationResult,
  QuoteJobCoordinationResult,
  QuoteLifecycleCoordinationResult,
  QuoteOrchestrationContext,
  QuoteOrchestrationInput,
  QuoteStatusCoordinationResult,
} from "./quote-orchestrator.types";

function makeEventId(prefix: string, context: QuoteOrchestrationContext): string {
  return `${prefix}-${context.quoteId}-${context.workspaceId}`;
}

export function createDefaultLifecyclePort(): QuoteLifecyclePort {
  return {
    phase: "P1",
    coordinate(context, input): QuoteLifecycleCoordinationResult {
      return {
        status: "running",
        stepIndex: 1,
        lifecycleEventType: `lifecycle.${input.action}`,
      };
    },
  };
}

export function createDefaultJobPort(): QuoteJobPort {
  return {
    phase: "P2",
    coordinate(context, lifecycle): QuoteJobCoordinationResult {
      const jobId = context.jobId ?? `job-${context.quoteId}`;
      return {
        jobId,
        status: lifecycle.status === "running" ? "scheduled" : "pending",
        jobEventType: `job.${lifecycle.lifecycleEventType.replace("lifecycle.", "")}`,
      };
    },
  };
}

export function createDefaultAsyncPort(): QuoteAsyncPort {
  return {
    phase: "P3",
    coordinate(context, job): QuoteAsyncCoordinationResult {
      return {
        asyncHandle: `async-${job.jobId}`,
        status: "dispatched",
        clientEventType: `async.${job.jobEventType.replace("job.", "")}`,
      };
    },
  };
}

export function createDefaultEventPort(): QuoteEventPort {
  return {
    phase: "P4",
    coordinate(context, asyncResult, input): QuoteEventCoordinationResult {
      return {
        eventId: makeEventId("evt", context),
        eventType: asyncResult.clientEventType,
        payload: {
          action: input.action,
          status: asyncResult.status,
          ...(input.payload !== undefined ? { input: input.payload } : {}),
        },
      };
    },
  };
}

export function createDefaultStatusPort(): QuoteStatusPort {
  return {
    phase: "P5",
    coordinate(context, event): QuoteStatusCoordinationResult {
      return {
        syncedStatus: "synced",
        syncEventType: `status.synced.${event.eventType}`,
      };
    },
  };
}

export function createHistoryPort(store: QuoteHistoryStore): QuoteHistoryPort {
  return {
    phase: "P6",
    coordinate(context, status, event, observedAt): QuoteHistoryCoordinationResult {
      const domainEvent: QuoteDomainEvent = {
        eventId: event.eventId,
        quoteId: context.quoteId,
        workspaceId: context.workspaceId,
        jobId: context.jobId,
        executionId: context.executionId,
        eventType: event.eventType,
        timestamp: observedAt,
        payload: {
          ...((event.payload as Record<string, unknown>) ?? {}),
          syncedStatus: status.syncedStatus,
        },
      };

      appendHistoryRecord(store, mapEventToHistoryRecord(domainEvent));
      const records = getQuoteHistory(store, context.quoteId);

      return {
        recordCount: records.length,
        lastEventId: event.eventId,
      };
    },
  };
}

export function resolveOrchestratorPorts(
  store?: QuoteHistoryStore,
): QuoteOrchestratorPorts & { historyStore: QuoteHistoryStore } {
  const historyStore = store ?? createQuoteHistoryStore();

  return {
    historyStore,
    lifecycle: createDefaultLifecyclePort(),
    job: createDefaultJobPort(),
    async: createDefaultAsyncPort(),
    event: createDefaultEventPort(),
    status: createDefaultStatusPort(),
    history: createHistoryPort(historyStore),
  };
}
