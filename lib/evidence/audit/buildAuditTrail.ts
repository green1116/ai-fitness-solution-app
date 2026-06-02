import type {
  AuditEventType,
  AuditTrailEntry,
  TenderAuditRuntimeInput,
  TenderAuditSummary,
  TenderAuditTrail,
} from "../types";
import { TENDER_AUDIT_RUNTIME_VERSION } from "../types";
import { collectAllAuditEntries } from "./collectAuditEntries";

export function buildAuditSummary(
  input: TenderAuditRuntimeInput,
  entries: AuditTrailEntry[],
): TenderAuditSummary {
  const byType: Partial<Record<AuditEventType, number>> = {};
  for (const e of entries) {
    byType[e.type] = (byType[e.type] || 0) + 1;
  }

  return {
    totalEntries: entries.length,
    byType,
    requirementCount: input.requirements.length,
    evidenceCount: input.registry?.records.length ?? 0,
    ocrDocumentCount: input.ocrDocuments?.length ?? 0,
    linkCount: input.linking?.links.length ?? 0,
    validationOutcome: input.tenderValidation?.outcome,
    coverageScore: input.coverageRuntime?.summary.validationScore,
    criticalFindings:
      input.tenderValidation?.findings.filter((f) => f.severity === "critical").length ?? 0,
  };
}

export function buildTenderAuditTrail(input: TenderAuditRuntimeInput): TenderAuditTrail {
  const entries = collectAllAuditEntries(input);
  const finishedAt = new Date().toISOString();

  return {
    version: TENDER_AUDIT_RUNTIME_VERSION,
    runId: input.runId,
    documentId: input.documentId,
    startedAt: input.startedAt,
    finishedAt,
    entries,
    summary: buildAuditSummary(input, entries),
  };
}
