import type {
  AuditEventType,
  AuditSeverity,
  AuditSourceRuntime,
  AuditTrailEntry,
  TenderAuditRuntimeInput,
} from "../types";

function entryId(type: AuditEventType, suffix: string) {
  return `aud-${type}-${suffix}-${Date.now().toString(36).slice(-5)}`;
}

function push(
  list: AuditTrailEntry[],
  input: Omit<AuditTrailEntry, "id" | "runId"> & { runId: string },
) {
  list.push({
    id: entryId(input.type, String(list.length)),
    ...input,
  });
}

function severityFromValidation(
  severity: "info" | "warning" | "error" | "critical",
): AuditSeverity {
  if (severity === "critical") return "critical";
  if (severity === "error") return "warning";
  if (severity === "warning") return "notice";
  return "info";
}

export function collectOcrAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const runId = input.runId;

  for (const doc of input.ocrDocuments || []) {
    push(entries, {
      runId,
      at: doc.metadata.extractedAt,
      type: "ocr-trace-created",
      severity: doc.metadata.warnings.length ? "notice" : "info",
      title: `OCR 提取：${doc.metadata.fileName}`,
      message: `${doc.metadata.engine} / ${doc.metadata.blockCount} 块 / ${doc.metadata.charCount} 字符`,
      attachmentId: doc.attachmentId,
      sourceRuntime: "ocr",
      payload: {
        method: doc.metadata.method,
        durationMs: doc.metadata.durationMs,
        traceEvents: doc.trace.events.length,
      },
    });

    for (const evt of doc.trace.events) {
      if (evt.kind === "warning") {
        push(entries, {
          runId,
          at: evt.at,
          type: "ocr-trace-created",
          severity: "notice",
          title: `OCR 警告：${doc.metadata.fileName}`,
          message: evt.message,
          attachmentId: doc.attachmentId,
          sourceRuntime: "ocr",
          sourceEventId: evt.eventId,
        });
      }
    }
  }

  return entries;
}

export function collectLinkingAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const linking = input.linking;
  if (!linking) return entries;

  const runId = input.runId;

  for (const match of linking.matches) {
    push(entries, {
      runId,
      at: linking.ranAt,
      type: "evidence-matched",
      severity: match.score >= 0.65 ? "info" : "notice",
      title: "证据匹配",
      message: `需求 ${match.requirementId} ↔ 证据 ${match.evidenceId}（分 ${match.score}）`,
      requirementId: match.requirementId,
      evidenceId: match.evidenceId,
      attachmentId: match.attachmentId,
      sourceRuntime: "linking",
      sourceEventId: match.linkId,
      payload: {
        matchedTerms: match.matchedTerms,
        locationCount: match.locations.length,
        confidence: match.confidence,
      },
    });
  }

  for (const result of linking.results) {
    if (result.matches.length) {
      push(entries, {
        runId,
        at: linking.ranAt,
        type: "requirement-linked",
        severity: "info",
        title: `需求已关联：${result.requirementTitle}`,
        message: `${result.matches.length} 份证据，覆盖 ${result.coverageLevel}`,
        requirementId: result.requirementId,
        sourceRuntime: "linking",
        payload: { bestScore: result.bestScore },
      });
    }
  }

  return entries;
}

export function collectCoverageAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const cov = input.coverageRuntime;
  if (!cov) return entries;

  const runId = input.runId;

  for (const req of cov.requirements) {
    const severity: AuditSeverity =
      req.status === "missing" || req.status === "conflict"
        ? req.analysis.mandatory
          ? "critical"
          : "warning"
        : req.status === "partial"
          ? "notice"
          : "info";

    push(entries, {
      runId,
      at: cov.ranAt,
      type: "coverage-evaluated",
      severity,
      title: `覆盖评估：${req.requirementTitle}`,
      message: `状态 ${req.status}，匹配分 ${req.analysis.bestScore}`,
      requirementId: req.requirementId,
      sourceRuntime: "coverage",
      payload: {
        legacyLevel: req.legacyLevel,
        keywordRatio: req.analysis.keywordCoverageRatio,
        evidenceIds: req.analysis.evidenceIds,
      },
    });
  }

  return entries;
}

export function collectValidationAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const val = input.tenderValidation;
  if (!val) return entries;

  const runId = input.runId;

  push(entries, {
    runId,
    at: val.ranAt,
    type: "validation-issued",
    severity:
      val.outcome === "rejected"
        ? "critical"
        : val.outcome === "conditional"
          ? "warning"
          : "info",
    title: val.title,
    message: val.message,
    sourceRuntime: "validation",
    payload: {
      outcome: val.outcome,
      score: val.summary.validationScore,
      findingCount: val.findings.length,
    },
  });

  for (const finding of val.findings) {
    if (finding.severity === "info") continue;
    push(entries, {
      runId,
      at: val.ranAt,
      type: "validation-issued",
      severity: severityFromValidation(finding.severity),
      title: finding.title,
      message: finding.message,
      requirementId: finding.requirementId,
      evidenceId: finding.evidenceId,
      sourceRuntime: "validation",
      sourceEventId: finding.id,
      payload: { ruleId: finding.ruleId, code: finding.code },
    });
  }

  for (const check of val.complianceChecks) {
    if (check.passed) continue;
    push(entries, {
      runId,
      at: val.ranAt,
      type: "compliance-flagged",
      severity: check.severity === "critical" ? "critical" : "warning",
      title: check.title,
      message: check.message,
      sourceRuntime: "validation",
      sourceEventId: check.checkId,
      payload: { relatedFindingIds: check.relatedFindingIds },
    });
  }

  return entries;
}

export function collectOrchestrationAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const entries: AuditTrailEntry[] = [];
  const trace = input.orchestrationTrace;
  if (!trace) return entries;

  for (const evt of trace.events) {
    if (evt.kind === "phase_start") continue;
    push(entries, {
      runId: input.runId,
      at: evt.at,
      type: evt.kind === "error" ? "compliance-flagged" : "validation-issued",
      severity: evt.kind === "error" ? "warning" : "info",
      title: `编排 ${evt.phaseId}`,
      message: evt.message,
      sourceRuntime: "orchestration",
      sourceEventId: evt.eventId,
      payload: evt.payload,
    });
  }

  return entries;
}

export function collectAllAuditEntries(input: TenderAuditRuntimeInput): AuditTrailEntry[] {
  const merged = [
    ...collectOrchestrationAuditEntries(input),
    ...collectOcrAuditEntries(input),
    ...collectLinkingAuditEntries(input),
    ...collectCoverageAuditEntries(input),
    ...collectValidationAuditEntries(input),
  ];
  return merged.sort((a, b) => a.at.localeCompare(b.at));
}
