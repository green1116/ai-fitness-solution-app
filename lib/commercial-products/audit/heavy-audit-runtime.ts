import type { AuditLookup, AuditRecordInput } from "./audit-types";

export async function recordAuditEventHeavy(input: AuditRecordInput) {
  const { recordAuditEvent } = await import("./audit-runtime");
  return recordAuditEvent(input);
}

export async function listAuditEventsHeavy(lookup: AuditLookup = {}) {
  const { AuditService } = await import("./audit-service");
  return AuditService.listEvents(lookup);
}

export async function buildAuditContextHeavy(
  input: AuditLookup & { projectId?: string; packageId?: string },
) {
  const { buildAuditContext } = await import("./audit-runtime");
  return buildAuditContext(input);
}
