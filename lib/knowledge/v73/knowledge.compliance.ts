/**
 * V73 P7 — Knowledge compliance types (read-only)
 */

export const V73_KNOWLEDGE_COMPLIANCE_VERSION = "v73-knowledge-compliance-1" as const;
export const V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION =
  "v73-knowledge-compliance-freeze-1" as const;

export type ComplianceReviewStatus = "pending" | "approved" | "rejected" | "waived";

export type Required = boolean;
export type Passed = boolean;
export type Failed = boolean;
export type Evidence = string;
export type Review = ComplianceReviewStatus;

export type ComplianceItem = {
  id: string;
  knowledgeRef: string;
  lifecycleStateRef: string;
  required: Required;
  passed: Passed;
  failed: Failed;
  evidence: Evidence;
  review: Review;
  exception: string;
  auditTrail: string;
  freezeGate: string;
  signoff: string;
  description: string;
};

export type ComplianceChecklistManifest = {
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  itemCount: number;
  passedCount: number;
  failedCount: number;
  checklistComplete: boolean;
  items: ComplianceItem[];
  summary: string;
};

export type Exception = {
  id: string;
  complianceItemRef: string;
  exceptionKind: string;
  status: "approved" | "rejected" | "pending" | "expired";
  required: boolean;
  description: string;
};

export type ExceptionManifest = {
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  exceptions: Exception[];
  summary: string;
};

export type AuditTrail = {
  id: string;
  complianceItemRef: string;
  event: string;
  retention: string;
  required: boolean;
  description: string;
};

export type AuditTrailManifest = {
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: AuditTrail[];
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
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  gateCount: number;
  catalogComplete: boolean;
  gates: FreezeGate[];
  summary: string;
};

export type Signoff = {
  id: string;
  complianceItemRef: string;
  signoffRole: string;
  signoffStatus: "required" | "signed" | "rejected";
  required: boolean;
  description: string;
};

export type SignoffManifest = {
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  signoffs: Signoff[];
  summary: string;
};

export type KnowledgeComplianceSignals = {
  knowledgeLifecycleReady?: boolean;
  checklistComplete?: boolean;
  exceptionsComplete?: boolean;
  auditTrailsComplete?: boolean;
  freezeGatesComplete?: boolean;
  signoffsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeComplianceReport = {
  version: typeof V73_KNOWLEDGE_COMPLIANCE_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_COMPLIANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgeLifecycleVersion: string;
  knowledgeLifecycleReady: boolean;
  checklist: ComplianceChecklistManifest;
  exceptions: ExceptionManifest;
  auditTrails: AuditTrailManifest;
  freezeGates: FreezeGateManifest;
  signoffs: SignoffManifest;
  complianceReady: boolean;
  readinessScore: number;
  summary: string;
};
