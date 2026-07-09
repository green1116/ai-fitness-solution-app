/**
 * V70 P7 — Delivery compliance types (read-only)
 */

export const V70_DELIVERY_COMPLIANCE_VERSION = "v70-delivery-compliance-1" as const;
export const V70_DELIVERY_COMPLIANCE_FREEZE_VERSION =
  "v70-delivery-compliance-freeze-1" as const;

export type ComplianceReviewStatus = "pending" | "approved" | "rejected" | "waived";

export type ComplianceItem = {
  id: string;
  releaseRef: string;
  lifecycleStateRef: string;
  required: boolean;
  passed: boolean;
  failed: boolean;
  evidence: string;
  review: ComplianceReviewStatus;
  exception: string;
  auditTrail: string;
  freezeGate: string;
  signoff: string;
  description: string;
};

export type ComplianceChecklistManifest = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  itemCount: number;
  passedCount: number;
  failedCount: number;
  checklistComplete: boolean;
  items: ComplianceItem[];
  summary: string;
};

export type ComplianceException = {
  id: string;
  complianceItemRef: string;
  exceptionKind: string;
  status: "approved" | "rejected" | "pending" | "expired";
  required: boolean;
  description: string;
};

export type ComplianceExceptionManifest = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  exceptions: ComplianceException[];
  summary: string;
};

export type ComplianceAuditTrail = {
  id: string;
  complianceItemRef: string;
  event: string;
  retention: string;
  required: boolean;
  description: string;
};

export type ComplianceAuditTrailManifest = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: ComplianceAuditTrail[];
  summary: string;
};

export type FreezeGate = {
  id: string;
  complianceItemRef: string;
  gateKind: string;
  verifyScript: string;
  required: boolean;
  description: string;
};

export type FreezeGateManifest = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: FreezeGate[];
  summary: string;
};

export type ComplianceSignoff = {
  id: string;
  complianceItemRef: string;
  signoffRole: string;
  signoffStatus: "required" | "signed" | "rejected";
  required: boolean;
  description: string;
};

export type ComplianceSignoffManifest = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  signoffs: ComplianceSignoff[];
  summary: string;
};

export type DeliveryComplianceSignals = {
  lifecycleManagementReady?: boolean;
  checklistComplete?: boolean;
  exceptionsComplete?: boolean;
  auditTrailsComplete?: boolean;
  freezeGatesComplete?: boolean;
  signoffsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DeliveryComplianceReport = {
  version: typeof V70_DELIVERY_COMPLIANCE_VERSION;
  freezeVersion: typeof V70_DELIVERY_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  lifecycleManagementVersion: string;
  lifecycleManagementReady: boolean;
  checklist: ComplianceChecklistManifest;
  exceptions: ComplianceExceptionManifest;
  auditTrails: ComplianceAuditTrailManifest;
  freezeGates: FreezeGateManifest;
  signoffs: ComplianceSignoffManifest;
  complianceReady: boolean;
  readinessScore: number;
  summary: string;
};
