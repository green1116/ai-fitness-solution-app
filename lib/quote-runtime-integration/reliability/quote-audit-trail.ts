export const QUOTE_AUDIT_CREATED = "CREATED" as const;
export const QUOTE_AUDIT_PERSISTED = "PERSISTED" as const;
export const QUOTE_AUDIT_EXPOSED = "EXPOSED" as const;
export const QUOTE_AUDIT_FAILED = "FAILED" as const;

export type QuoteAuditTrailEvent =
  | typeof QUOTE_AUDIT_CREATED
  | typeof QUOTE_AUDIT_PERSISTED
  | typeof QUOTE_AUDIT_EXPOSED
  | typeof QUOTE_AUDIT_FAILED;

export const QUOTE_AUDIT_TRAIL_EVENT_VALUES: QuoteAuditTrailEvent[] = [
  QUOTE_AUDIT_CREATED,
  QUOTE_AUDIT_PERSISTED,
  QUOTE_AUDIT_EXPOSED,
  QUOTE_AUDIT_FAILED,
];

export interface QuoteAuditTrailEntry {
  executionId: string;
  workspaceId: string;
  event: QuoteAuditTrailEvent;
  timestamp: string;
  detail: string;
}

export interface QuoteAuditTrail {
  entries: QuoteAuditTrailEntry[];
  record(input: {
    executionId: string;
    workspaceId: string;
    event: QuoteAuditTrailEvent;
    detail: string;
    timestamp?: string;
  }): QuoteAuditTrailEntry;
  toMessages(): string[];
}

export function createQuoteAuditTrailEntry(input: {
  executionId: string;
  workspaceId: string;
  event: QuoteAuditTrailEvent;
  detail: string;
  timestamp?: string;
}): QuoteAuditTrailEntry {
  return {
    executionId: input.executionId,
    workspaceId: input.workspaceId,
    event: input.event,
    timestamp: input.timestamp ?? new Date().toISOString(),
    detail: input.detail,
  };
}

export function createQuoteAuditTrail(): QuoteAuditTrail {
  const entries: QuoteAuditTrailEntry[] = [];

  return {
    entries,
    record(input) {
      const entry = createQuoteAuditTrailEntry(input);
      entries.push(entry);
      return entry;
    },
    toMessages() {
      return entries.map(
        (entry) =>
          `[${entry.timestamp}] audit executionId=${entry.executionId} event=${entry.event} ${entry.detail}`,
      );
    },
  };
}

export function describeQuoteAuditTrailEntry(entry: QuoteAuditTrailEntry): string {
  return `[${entry.timestamp}] ${entry.event}: ${entry.detail}`;
}
