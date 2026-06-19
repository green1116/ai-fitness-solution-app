export const AUDIT_VERSION = "v47-commercial-products-p2-step9" as const;
export const CP_AUDIT_API_PATH = "/api/commercial-products/audit" as const;
export const CP_AUDIT_PAGE_PATH = "/commercial/v47/audit" as const;

export const AUDIT_EVENT_TYPE = [
  "workspace_created",
  "project_created",
  "quote_created",
  "quote_submitted",
  "approval_created",
  "approval_submitted",
  "approval_approved",
  "approval_rejected",
  "approval_delivered",
  "delivery_orchestrated",
  "package_built",
  "deliverable_routed",
  "download_started",
  "download_completed",
] as const;

export type AuditEventType = (typeof AUDIT_EVENT_TYPE)[number];

export const AUDIT_ACTOR_TYPE = ["system", "customer", "admin", "operator"] as const;
export type AuditActorType = (typeof AUDIT_ACTOR_TYPE)[number];

export type ComplianceStatus = "pass" | "warn" | "fail";

export interface AuditRecord {
  auditId: string;
  eventType: AuditEventType;
  workspaceId?: string;
  projectId?: string;
  quoteId?: string;
  approvalId?: string;
  packageId?: string;
  deliveryId?: string;
  actorType: AuditActorType;
  actorId?: string;
  actorName?: string;
  title: string;
  description?: string;
  createdAt: number;
  metadata?: Record<string, unknown>;
}

export interface ComplianceRuleResult {
  ruleId: string;
  name: string;
  passed: boolean;
  message?: string;
}

export interface ComplianceSnapshot {
  complianceId: string;
  workspaceId?: string;
  quoteId?: string;
  approvalId?: string;
  packageId?: string;
  deliveryId?: string;
  status: ComplianceStatus;
  rules: ComplianceRuleResult[];
  generatedAt: number;
}

export interface AuditRecordInput {
  eventType: AuditEventType;
  workspaceId?: string;
  projectId?: string;
  quoteId?: string;
  approvalId?: string;
  packageId?: string;
  deliveryId?: string;
  actorType: AuditActorType;
  actorId?: string;
  actorName?: string;
  title: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLookup {
  workspaceId?: string;
  quoteId?: string;
  approvalId?: string;
  deliveryId?: string;
  auditId?: string;
}

export interface AuditContext {
  workspaceId?: string;
  quoteId?: string;
  approvalId?: string;
  deliveryId?: string;
  projectId?: string;
  packageId?: string;
}

export interface AuditListResponse {
  ok: true;
  events: AuditRecord[];
  compliance?: ComplianceSnapshot;
}

export interface AuditRecordResponse {
  ok: true;
  event: AuditRecord;
  compliance?: ComplianceSnapshot;
}

export interface AuditValidation {
  valid: boolean;
  runtimeOk: boolean;
  serviceOk: boolean;
  policyOk: boolean;
  historyOk: boolean;
  complianceOk: boolean;
  apiPathRegistered: boolean;
  pagePathRegistered: boolean;
  summary: string;
}
