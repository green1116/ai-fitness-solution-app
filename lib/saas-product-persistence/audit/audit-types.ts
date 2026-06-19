export type AuditCheckStatus = "pass" | "fail" | "skip";

export interface AuditCheckResult {
  id: string;
  title: string;
  status: AuditCheckStatus;
  detail: string;
}

export interface PersistenceAuditResult {
  checks: AuditCheckResult[];
  passed: boolean;
  summary: string;
}
