import type { QuoteStatusSnapshot } from "./quote-status.types";

const LIFECYCLE_STATUSES: QuoteStatusSnapshot["lifecycleStatus"][] = [
  "IDLE",
  "QUEUED",
  "RUNNING",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "RETRYING",
];

const JOB_STATUSES: QuoteStatusSnapshot["jobStatus"][] = [
  "PENDING",
  "DISPATCHED",
  "COMPLETED",
  "FAILED",
];

const EXECUTION_STATUSES: QuoteStatusSnapshot["executionStatus"][] = [
  "NOT_STARTED",
  "RUNNING",
  "DONE",
  "ERROR",
];

export function validateQuoteStatusSnapshot(snapshot: QuoteStatusSnapshot): boolean {
  return (
    snapshot.quoteId.trim().length > 0 &&
    snapshot.workspaceId.trim().length > 0 &&
    snapshot.lastEventType.trim().length > 0 &&
    snapshot.updatedAt.trim().length > 0 &&
    LIFECYCLE_STATUSES.includes(snapshot.lifecycleStatus) &&
    JOB_STATUSES.includes(snapshot.jobStatus) &&
    EXECUTION_STATUSES.includes(snapshot.executionStatus)
  );
}

export function assertQuoteStatusSnapshot(snapshot: QuoteStatusSnapshot): void {
  if (!validateQuoteStatusSnapshot(snapshot)) {
    throw new Error("invalid quote status snapshot");
  }
}

export function describeQuoteStatusSnapshot(snapshot: QuoteStatusSnapshot): string {
  return [
    `quoteId=${snapshot.quoteId}`,
    `lifecycle=${snapshot.lifecycleStatus}`,
    `job=${snapshot.jobStatus}`,
    `execution=${snapshot.executionStatus}`,
    `lastEvent=${snapshot.lastEventType}`,
  ].join(";");
}
