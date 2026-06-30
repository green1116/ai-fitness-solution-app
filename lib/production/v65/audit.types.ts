/**
 * V65 P1 — Production readiness audit types
 */
export const V65_PRODUCTION_AUDIT_VERSION = "v65-production-audit-1" as const;

export type IssueSeverity = "critical" | "high" | "medium" | "low";

export type IssueCategory =
  | "typecheck"
  | "prisma-schema-drift"
  | "organization"
  | "feature-gate"
  | "portal"
  | "verify-script"
  | "dependency"
  | "commercial";

export type LegacyIssue = {
  id: string;
  category: IssueCategory;
  severity: IssueSeverity;
  file: string;
  summary: string;
  blocker: boolean;
  remediation: string;
  status?: "open" | "resolved";
  resolvedBy?: string;
};

export type BuildBlocker = {
  id: string;
  source: "prisma-preflight" | "typescript" | "next-build";
  severity: IssueSeverity;
  summary: string;
  detail: string;
};

export type RuntimeBlocker = {
  id: string;
  area: string;
  severity: IssueSeverity;
  summary: string;
  impact: string;
};

export type DependencyAuditEntry = {
  name: string;
  version: string;
  scope: "production" | "development";
  pinned: boolean;
  notes?: string;
};

export type DependencyAuditReport = {
  productionCount: number;
  developmentCount: number;
  nodeEngineDeclared: boolean;
  lockfilePresent: boolean;
  entries: DependencyAuditEntry[];
  notes: string[];
};

export type ChecklistStatus = "pass" | "fail" | "warn" | "na";

export type ReleaseChecklistItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  required: boolean;
  notes?: string;
};

export type RepositoryAuditSummary = {
  commercialLayerFrozen: boolean;
  verifyChainPass: boolean;
  typeScriptClean: boolean;
  buildPass: boolean;
  prismaPreflightPass: boolean;
};

export type ProductionReadinessReport = {
  version: typeof V65_PRODUCTION_AUDIT_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  repository: RepositoryAuditSummary;
  legacyIssues: LegacyIssue[];
  buildBlockers: BuildBlocker[];
  runtimeBlockers: RuntimeBlocker[];
  dependencies: DependencyAuditReport;
  checklist: ReleaseChecklistItem[];
  issueCountByCategory: Record<IssueCategory, number>;
  blockerCount: number;
  readinessScore: number;
  productionReady: boolean;
  summary: string;
};
