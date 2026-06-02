import type {
  TenderValidationRuntimeInput,
  TenderValidationRuntimeResult,
} from "../types";
import { TENDER_VALIDATION_RUNTIME_VERSION } from "../types";
import { buildValidationSummary, resolveValidationOutcome } from "./buildValidationResult";
import { runComplianceChecks } from "./runComplianceCheck";
import { runValidationRules } from "./runValidationRules";
import { appendValidationAuditEvent, createTenderAuditTrace } from "./validationTrace";

function newValidationRunId() {
  return `tvr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.4-E5 Tender Validation Runtime
 *
 * Tender Document → Requirements → Coverage → Rules → Compliance → Result → Audit
 */
export function runTenderValidationRuntime(
  input: TenderValidationRuntimeInput,
): TenderValidationRuntimeResult {
  const started = Date.now();
  const runId = input.runId || newValidationRunId();
  const ranAt = new Date().toISOString();
  let audit = createTenderAuditTrace(runId, input.document.documentId);

  audit = appendValidationAuditEvent(audit, "document", `校验文档 ${input.document.documentId}`, {
    fileName: input.document.fileName,
  });
  audit = appendValidationAuditEvent(audit, "requirements", `${input.requirements.length} 项需求`);
  audit = appendValidationAuditEvent(audit, "coverage", `覆盖校验 ${input.coverageRuntime.validation.verdict}`, {
    score: input.coverageRuntime.summary.validationScore,
  });

  const findings = runValidationRules({
    documentId: input.document.documentId,
    requirements: input.requirements,
    coverageRuntime: input.coverageRuntime,
    linking: input.linking,
    registry: input.registry,
    attachments: input.attachments,
    policy: input.policy,
  });

  audit = appendValidationAuditEvent(audit, "rule", `规则命中 ${findings.length} 条`, {
    critical: findings.filter((f) => f.severity === "critical").length,
    error: findings.filter((f) => f.severity === "error").length,
  });

  const complianceChecks = runComplianceChecks({
    findings,
    policy: input.policy,
  });

  audit = appendValidationAuditEvent(audit, "compliance", `合规检查 ${complianceChecks.filter((c) => c.passed).length}/${complianceChecks.length} 通过`);

  const summary = buildValidationSummary(findings, complianceChecks, input.coverageRuntime);
  const resolved = resolveValidationOutcome({
    findings,
    complianceChecks,
    coverageRuntime: input.coverageRuntime,
    policy: input.policy,
  });

  audit = appendValidationAuditEvent(audit, "outcome", `结论 ${resolved.outcome}`, {
    title: resolved.title,
  });

  return {
    version: TENDER_VALIDATION_RUNTIME_VERSION,
    runId,
    ranAt,
    durationMs: Date.now() - started,
    document: input.document,
    outcome: resolved.outcome,
    title: resolved.title,
    message: resolved.message,
    reasons: resolved.reasons,
    suggestedActions: resolved.suggestedActions,
    findings,
    complianceChecks,
    summary,
    coverageValidation: input.coverageRuntime.validation,
    audit,
  };
}
