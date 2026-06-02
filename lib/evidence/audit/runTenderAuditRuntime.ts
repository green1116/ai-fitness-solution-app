import type { TenderAuditResult, TenderAuditRuntimeInput } from "../types";
import { TENDER_AUDIT_RUNTIME_VERSION } from "../types";
import { buildTenderAuditTrail } from "./buildAuditTrail";
import { resolveGovernanceStatus } from "./resolveGovernance";

/**
 * V3.4-E6 Tender Audit Runtime
 *
 * Requirement → Evidence → OCR Trace → Coverage → Validation → Audit Trail → Result
 */
export function runTenderAuditRuntime(input: TenderAuditRuntimeInput): TenderAuditResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();

  const trail = buildTenderAuditTrail(input);
  const governance = resolveGovernanceStatus({
    trail,
    tenderValidation: input.tenderValidation,
  });

  return {
    version: TENDER_AUDIT_RUNTIME_VERSION,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    trail,
    governanceStatus: governance.status,
    title: governance.title,
    message: governance.message,
    explain: governance.explain,
  };
}
