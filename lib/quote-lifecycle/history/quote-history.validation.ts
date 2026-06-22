/**
 * V58 P6 — Quote History Validation
 */

import type { QuoteHistoryRecord } from "./quote-history.types";

export interface QuoteHistoryValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateHistoryRecord(
  record: QuoteHistoryRecord,
): QuoteHistoryValidationResult {
  const errors: string[] = [];

  if (!record.eventId || record.eventId.trim().length === 0) {
    errors.push("eventId is required");
  }
  if (!record.quoteId || record.quoteId.trim().length === 0) {
    errors.push("quoteId is required");
  }
  if (!record.workspaceId || record.workspaceId.trim().length === 0) {
    errors.push("workspaceId is required");
  }
  if (!record.eventType || record.eventType.trim().length === 0) {
    errors.push("eventType is required");
  }
  if (!record.timestamp || record.timestamp.trim().length === 0) {
    errors.push("timestamp is required");
  } else if (Number.isNaN(Date.parse(record.timestamp))) {
    errors.push("timestamp must be a valid ISO date");
  }

  return { valid: errors.length === 0, errors };
}

export function validateHistoryRecords(
  records: QuoteHistoryRecord[],
): QuoteHistoryValidationResult {
  const errors: string[] = [];

  for (const record of records) {
    const result = validateHistoryRecord(record);
    if (!result.valid) {
      errors.push(...result.errors.map((e) => `${record.eventId}: ${e}`));
    }
  }

  const eventIds = records.map((r) => r.eventId);
  const uniqueIds = new Set(eventIds);
  if (uniqueIds.size !== eventIds.length) {
    errors.push("duplicate eventId detected in record set");
  }

  return { valid: errors.length === 0, errors };
}
