import { AUDIT_VERSION } from "./audit-types";
import type { AuditContext, AuditListResponse, AuditLookup, AuditRecordInput, AuditRecordResponse } from "./audit-types";
import { AuditService } from "./audit-service";

export function buildAuditContext(input: AuditLookup & { projectId?: string; packageId?: string }): AuditContext {
  return {
    workspaceId: input.workspaceId,
    quoteId: input.quoteId,
    approvalId: input.approvalId,
    deliveryId: input.deliveryId,
    projectId: input.projectId,
    packageId: input.packageId,
  };
}

export function recordAuditEvent(input: AuditRecordInput): AuditRecordResponse {
  return AuditService.recordEvent(input);
}

export function buildComplianceSnapshot(context: AuditContext, source?: AuditRecordInput) {
  return AuditService.buildComplianceSnapshot(context, source);
}

export function resolveAuditEventsByWorkspace(workspaceId: string): AuditListResponse {
  return AuditService.listByWorkspace(workspaceId);
}

export function resolveAuditEventsByQuote(quoteId: string): AuditListResponse {
  return AuditService.listByQuote(quoteId);
}

export function resolveAuditEventsByApproval(approvalId: string): AuditListResponse {
  return AuditService.listByApproval(approvalId);
}

export function resolveAuditEventsByDelivery(deliveryId: string): AuditListResponse {
  return AuditService.listByDelivery(deliveryId);
}

export function getAuditRuntimeMeta() {
  return {
    runtimeId: "cp-audit-runtime-v47-p2-s9",
    version: AUDIT_VERSION,
    mode: "commercial-products-audit" as const,
  };
}
