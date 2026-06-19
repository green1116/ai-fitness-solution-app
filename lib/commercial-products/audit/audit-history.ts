import type { AuditLookup, AuditRecord } from "./audit-types";

const events: AuditRecord[] = [];

function matches(record: AuditRecord, lookup: AuditLookup): boolean {
  if (lookup.auditId && record.auditId !== lookup.auditId) return false;
  if (lookup.workspaceId && record.workspaceId !== lookup.workspaceId) return false;
  if (lookup.quoteId && record.quoteId !== lookup.quoteId) return false;
  if (lookup.approvalId && record.approvalId !== lookup.approvalId) return false;
  if (lookup.deliveryId && record.deliveryId !== lookup.deliveryId) return false;
  return true;
}

export function appendAuditHistory(record: AuditRecord): AuditRecord {
  events.unshift(record);
  return record;
}

export function listAuditHistory(lookup: AuditLookup = {}): AuditRecord[] {
  if (!lookup.auditId && !lookup.workspaceId && !lookup.quoteId && !lookup.approvalId && !lookup.deliveryId) {
    return [...events];
  }
  return events.filter((record) => matches(record, lookup));
}

export function getAuditHistoryEvent(auditId: string): AuditRecord | undefined {
  return events.find((record) => record.auditId === auditId);
}

export function clearAuditHistory(): void {
  events.length = 0;
}
