import type { AuditEventType, AuditRecordInput } from "./audit-types";

export const HIGH_RISK_AUDIT_EVENTS: AuditEventType[] = [
  "approval_approved",
  "approval_delivered",
  "download_completed",
];

export const REQUIRED_AUDIT_EVENTS: AuditEventType[] = [
  "approval_approved",
  "approval_delivered",
  "package_built",
  "deliverable_routed",
  "download_completed",
];

export function assertAuditLinkage(input: AuditRecordInput): void {
  const linked = Boolean(
    input.workspaceId ||
      input.quoteId ||
      input.approvalId ||
      input.deliveryId ||
      input.projectId ||
      input.packageId,
  );
  if (!linked) {
    throw new Error("audit event must link to workspace / quote / approval / delivery / project / package");
  }
}

export function isHighRiskAuditEvent(eventType: AuditEventType): boolean {
  return HIGH_RISK_AUDIT_EVENTS.includes(eventType);
}

export function validateAuditPolicyMatrix(): boolean {
  return (
    REQUIRED_AUDIT_EVENTS.includes("approval_approved") &&
    REQUIRED_AUDIT_EVENTS.includes("approval_delivered") &&
    REQUIRED_AUDIT_EVENTS.includes("package_built") &&
    REQUIRED_AUDIT_EVENTS.includes("deliverable_routed") &&
    REQUIRED_AUDIT_EVENTS.includes("download_completed")
  );
}
