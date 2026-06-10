import type { AI_INTEGRATION_VERSION } from "../shared/types";

export const AI_AUDIT_RUNTIME_VERSION = "v13.0-ai-audit-1" as const;

export type AuditOutcome = "success" | "failure";

export interface AiAuditRecord {
  recordId: string;
  provider: string;
  model: string;
  promptVersion: string;
  outputType: string;
  tokenCostUsd: number;
  requestTimeMs: number;
  outcome: AuditOutcome;
  deploymentId: string;
  tracedAt: string;
}

export interface AiAuditRuntimePayload {
  version: typeof AI_AUDIT_RUNTIME_VERSION;
  integrationVersion: typeof AI_INTEGRATION_VERSION;
  records: AiAuditRecord[];
  recordCount: number;
  summary: string;
}
