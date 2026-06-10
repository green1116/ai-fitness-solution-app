import type { CUSTOMER_SUCCESS_VERSION } from "../shared/types";

export const SUCCESS_AUDIT_RUNTIME_VERSION = "v16.0-success-audit-1" as const;

export interface SuccessAuditRecord {
  recordId: string;
  actor: "customer" | "success-team";
  action: string;
  outcome: "success" | "pending" | "failed";
  customerId: string;
  tracedAt: string;
}

export interface SuccessAuditRuntimePayload {
  version: typeof SUCCESS_AUDIT_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  records: SuccessAuditRecord[];
  customerActionCount: number;
  successActionCount: number;
  successOutcomeCount: number;
  summary: string;
}
