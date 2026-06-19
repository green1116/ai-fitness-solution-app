export type ApiAuditCheckStatus = "pass" | "fail" | "skip";

export interface ApiAuditCheckResult {
  id: string;
  title: string;
  status: ApiAuditCheckStatus;
  detail: string;
}

export interface SaasProductApiAuditReport {
  routeCount: number;
  endpointCount: number;
  tenantProtectedCount: number;
  auditStatus: "pass" | "fail";
  findings: string[];
  checks: ApiAuditCheckResult[];
  summary: string;
}

export interface SaasProductApiAuditSweepResult {
  report: SaasProductApiAuditReport;
  passed: boolean;
}
