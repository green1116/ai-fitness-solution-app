/**
 * V80 Pilot P11 — Intake intelligence analytics schema (read-only aggregates)
 */

export const INTAKE_ANALYTICS_VERSION = "v80-pilot-p11-analytics-1";

export type IntakeStatusCount = Record<string, number>;

export type DurationMetrics = {
  sampleSize: number;
  avgMs: number;
  medianMs: number;
  p90Ms: number;
  minMs: number;
  maxMs: number;
};

export type ClarificationAnalytics = {
  sessionsWithClarifications: number;
  totalQuestions: number;
  open: number;
  answered: number;
  skipped: number;
  blockingOpen: number;
  avgRound: number;
};

export type ConfidenceAnalytics = {
  high: number;
  medium: number;
  low: number;
  withEvidence: number;
  withoutEvidence: number;
  totalItems: number;
};

export type ComplianceAnalytics = {
  sessionsEvaluated: number;
  passed: number;
  blocked: number;
  findingsBySeverity: { blocking: number; warning: number; info: number };
  findingsByCategory: Record<string, number>;
  topRuleIds: Array<{ ruleId: string; count: number }>;
};

export type DocumentSourceAnalytics = {
  totalDocuments: number;
  multiDocSessions: number;
  singleDocSessions: number;
  byDocType: Record<string, number>;
  avgDocumentsPerSession: number;
  conflictCount: number;
};

export type BootstrapAnalytics = {
  sessionsWithBootstrap: number;
  readyCount: number;
  avgMilestones: number;
  avgTasks: number;
  avgOwners: number;
};

export type TrendPoint = {
  /** YYYY-MM-DD (UTC) */
  date: string;
  sessionsCreated: number;
  sessionsReady: number;
  clarificationsAnswered: number;
  complianceBlocked: number;
  bootstrapsSeeded: number;
};

export type IntakeAnalyticsKpis = {
  totalSessions: number;
  byStatus: IntakeStatusCount;
  readyRate: number;
  failedRate: number;
  qaPassedRate: number;
  withProjectRate: number;
  duration: DurationMetrics;
  clarifications: ClarificationAnalytics;
  confidence: ConfidenceAnalytics;
  compliance: ComplianceAnalytics;
  documents: DocumentSourceAnalytics;
  bootstrap: BootstrapAnalytics;
};

export type IntakeAnalyticsReport = {
  version: typeof INTAKE_ANALYTICS_VERSION;
  organizationId: string;
  generatedAt: string;
  window: {
    from?: string;
    to?: string;
    sessionCount: number;
  };
  kpis: IntakeAnalyticsKpis;
  trends: TrendPoint[];
};
