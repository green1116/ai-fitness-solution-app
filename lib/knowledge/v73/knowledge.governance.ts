/**
 * V73 P5 — Knowledge governance types (read-only)
 */

export const V73_KNOWLEDGE_GOVERNANCE_VERSION = "v73-knowledge-governance-1" as const;
export const V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION =
  "v73-knowledge-governance-freeze-1" as const;

export type GovernanceScope = "global" | "document" | "topic" | "category";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type Approval = "required" | "approved" | "waived" | "rejected";

export type GovernanceRule = {
  id: string;
  scope: GovernanceScope;
  scopeRef: string;
  approval: Approval;
  review: string;
  exception: string;
  escalation: string;
  auditTrail: string;
  freezeGate: string;
  signoff: string;
  riskLevel: RiskLevel;
  compatibilityCheck: string;
  required: boolean;
  description: string;
};

export type GovernanceRuleManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  ruleCount: number;
  scopeCount: number;
  riskLevelCount: number;
  catalogComplete: boolean;
  rules: GovernanceRule[];
  summary: string;
};

export type Review = {
  id: string;
  governanceRuleRef: string;
  reviewKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ReviewManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  reviews: Review[];
  summary: string;
};

export type Exception = {
  id: string;
  governanceRuleRef: string;
  exceptionKind: string;
  status: "approved" | "rejected" | "pending" | "expired";
  required: boolean;
  description: string;
};

export type ExceptionManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  statusCount: number;
  catalogComplete: boolean;
  exceptions: Exception[];
  summary: string;
};

export type Escalation = {
  id: string;
  governanceRuleRef: string;
  escalationLevel: string;
  triggerCondition: string;
  required: boolean;
  description: string;
};

export type EscalationManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  escalations: Escalation[];
  summary: string;
};

export type AuditTrail = {
  id: string;
  governanceRuleRef: string;
  event: string;
  retention: string;
  required: boolean;
  description: string;
};

export type AuditTrailManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  trails: AuditTrail[];
  summary: string;
};

export type FreezeGate = {
  id: string;
  governanceRuleRef: string;
  freezeVersion: string;
  gateCondition: string;
  required: boolean;
  description: string;
};

export type FreezeGateManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  gates: FreezeGate[];
  summary: string;
};

export type Signoff = {
  id: string;
  governanceRuleRef: string;
  signoffKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type SignoffManifest = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  signoffs: Signoff[];
  summary: string;
};

export type KnowledgeGovernanceSignals = {
  knowledgeCompatibilityReady?: boolean;
  rulesComplete?: boolean;
  reviewsComplete?: boolean;
  exceptionsComplete?: boolean;
  escalationsComplete?: boolean;
  auditTrailsComplete?: boolean;
  freezeGatesComplete?: boolean;
  signoffsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeGovernanceReport = {
  version: typeof V73_KNOWLEDGE_GOVERNANCE_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgeCompatibilityVersion: string;
  knowledgeCompatibilityReady: boolean;
  rules: GovernanceRuleManifest;
  reviews: ReviewManifest;
  exceptions: ExceptionManifest;
  escalations: EscalationManifest;
  auditTrails: AuditTrailManifest;
  freezeGates: FreezeGateManifest;
  signoffs: SignoffManifest;
  governanceReady: boolean;
  readinessScore: number;
  summary: string;
};
