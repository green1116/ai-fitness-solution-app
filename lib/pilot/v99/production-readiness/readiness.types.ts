/**
 * V99 — Platform readiness & production certification types
 */

export const V99_PRODUCTION_READINESS_VERSION = "v99-production-readiness-1";

export type ReadinessDimension =
  | "architecture"
  | "workflow"
  | "delivery"
  | "governance"
  | "compliance"
  | "operations";

export type GateStatus = "pass" | "warning" | "blocked" | "waived";

export type OverallReadiness = "ready" | "conditional" | "not_ready" | "certified";

export type CertificationActionType =
  | "generate_certification_package"
  | "record_gate_review"
  | "waive_gate"
  | "certify_ready";

export type ReadinessDimensionResult = {
  dimension: ReadinessDimension;
  label: string;
  score: number;
  gateStatus: GateStatus;
  summary: string;
  checksPassed: number;
  checksTotal: number;
  readOnly: true;
};

export type CertificationGate = {
  id: string;
  dimension: ReadinessDimension;
  label: string;
  status: GateStatus;
  requirement: string;
  evidence: string;
  reviewedAt?: string;
  waivedAt?: string;
  readOnly: true;
};

export type RiskSummaryItem = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  exposure: string;
  readOnly: true;
};

export type ArtifactLink = {
  id: string;
  label: string;
  href: string;
  layer: string;
  readOnly: true;
};

export type AuditReference = {
  id: string;
  label: string;
  sessionId?: string;
  timestamp: string;
  source: string;
  readOnly: true;
};

export type ReadinessSummary = {
  dimensions: ReadinessDimensionResult[];
  overallReadiness: OverallReadiness;
  gatesPassed: number;
  gatesTotal: number;
  certificationStatus: string;
  readOnly: true;
};

export type CertificationPackage = {
  id: string;
  organizationId: string;
  title: string;
  generatedAt: string;
  readiness: ReadinessSummary;
  gates: CertificationGate[];
  risks: RiskSummaryItem[];
  artifacts: ArtifactLink[];
  auditReferences: AuditReference[];
  overallReadiness: OverallReadiness;
  readOnly: true;
};

export type CertificationActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: CertificationActionType;
  packageId?: string;
  gateId?: string;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type ProductionReadinessDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  summary: ReadinessSummary;
  gates: CertificationGate[];
  risks: RiskSummaryItem[];
  artifacts: ArtifactLink[];
  packages: CertificationPackage[];
  recentActions: CertificationActionEntry[];
  readOnly: true;
};
