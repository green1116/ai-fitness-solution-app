import type { AUTOPILOT_VERSION } from "../shared/types";

export const AUTOPILOT_AUDIT_RUNTIME_VERSION = "v13.5-autopilot-audit-1" as const;

export interface AutopilotAuditRecord {
  recordId: string;
  jobId: string;
  stageId: string;
  runtimeDomain: string;
  costUsd: number;
  outcome: "success" | "failure";
  approval: "auto-approved" | "manual-review" | "review-required" | "n/a";
  message: string;
  tracedAt: string;
}

export interface AutopilotAuditRuntimePayload {
  version: typeof AUTOPILOT_AUDIT_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  records: AutopilotAuditRecord[];
  totalCostUsd: number;
  failureCount: number;
  summary: string;
}
