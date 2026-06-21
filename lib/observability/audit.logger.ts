/**
 * V59.5 — Audit logger (immutable action trail for compliance)
 */

import { logInfo } from "@/lib/observability/logger";

export type AuditAction =
  | "api.request"
  | "api.denied"
  | "api.success"
  | "api.error"
  | "auth.login"
  | "billing.checkout"
  | "subscription.change"
  | "feature.access";

export type AuditRecord = {
  userId: string;
  organizationId: string;
  endpoint: string;
  action: AuditAction;
  resultStatus: "success" | "denied" | "error";
  traceId: string;
  timestamp: string;
  meta?: Record<string, unknown>;
};

const AUDIT_BUFFER_MAX = 500;
const auditBuffer: AuditRecord[] = [];

export function recordAuditEvent(input: Omit<AuditRecord, "timestamp">): AuditRecord {
  const record: AuditRecord = {
    ...input,
    timestamp: new Date().toISOString(),
  };

  auditBuffer.push(record);
  if (auditBuffer.length > AUDIT_BUFFER_MAX) {
    auditBuffer.shift();
  }

  logInfo("audit.event", {
    traceId: record.traceId,
    userId: record.userId,
    organizationId: record.organizationId,
    endpoint: record.endpoint,
    meta: { action: record.action, resultStatus: record.resultStatus, ...record.meta },
  });

  return record;
}

export function getRecentAuditEvents(limit = 50): AuditRecord[] {
  return auditBuffer.slice(-limit);
}

export function clearAuditBufferForTests(): void {
  auditBuffer.length = 0;
}
