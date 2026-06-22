/**
 * V58 P6 — Quote History Event Contract (domain input shape)
 */

import type { QuoteHistoryEventCategory } from "./quote-history.types";

export interface QuoteDomainEvent {
  eventId: string;
  quoteId: string;
  workspaceId: string;
  eventType: string;
  timestamp: string;
  payload: unknown;
  jobId?: string;
  executionId?: string;
  causationId?: string;
  correlationId?: string;
}

const LIFECYCLE_PREFIXES = ["lifecycle.", "quote.lifecycle.", "quote.created", "quote.updated"];
const JOB_PREFIXES = ["job.", "quote.job."];
const EXECUTION_PREFIXES = ["execution.", "quote.execution."];

export function categorizeQuoteEvent(eventType: string): QuoteHistoryEventCategory {
  const normalized = eventType.toLowerCase();

  if (LIFECYCLE_PREFIXES.some((p) => normalized.startsWith(p) || normalized === p.replace(/\.$/, ""))) {
    return "lifecycle";
  }
  if (JOB_PREFIXES.some((p) => normalized.startsWith(p))) {
    return "job";
  }
  if (EXECUTION_PREFIXES.some((p) => normalized.startsWith(p))) {
    return "execution";
  }

  if (normalized.includes("lifecycle")) return "lifecycle";
  if (normalized.includes("execution")) return "execution";
  if (normalized.includes("job")) return "job";

  return "lifecycle";
}

export function extractStatusFromPayload(payload: unknown): string {
  if (payload !== null && typeof payload === "object" && "status" in payload) {
    const status = (payload as { status: unknown }).status;
    if (typeof status === "string" && status.length > 0) return status;
  }
  return "unknown";
}

export function extractStepIndexFromPayload(payload: unknown): number {
  if (payload !== null && typeof payload === "object" && "stepIndex" in payload) {
    const stepIndex = (payload as { stepIndex: unknown }).stepIndex;
    if (typeof stepIndex === "number" && Number.isFinite(stepIndex)) return stepIndex;
  }
  return 0;
}
