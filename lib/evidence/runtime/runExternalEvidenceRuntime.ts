import { normalizeAttachments } from "../attachment";
import { linkRequirements } from "../linker";
import { runOcrDocumentsOnAttachments, toOcrExtraction } from "../ocr";
import { createEmptyRegistry, ingestEvidenceRecord, mergeRegistries } from "../registry";
import { classifyOcrExtractions } from "../semantic";
import { requirementItemsFromAnchors } from "../linker/normalizeRequirement";
import { runEvidenceCoverageRuntime } from "../coverage";
import { runTenderAuditRuntime } from "../audit";
import { runTenderDecisionRuntime } from "../decision";
import { runExecutiveOversightRuntime } from "../executive";
import { runExecutiveApprovalGateRuntime } from "../gate";
import { runExecutiveReleaseSurfaceRuntime } from "../surface";
import { runExecutiveRuntimeVisualization } from "../visualization";
import { runRuntimeCorrelationIntelligence } from "../correlation";
import { runRuntimePolicyEngine } from "../policy";
import { runRuntimeStateMachine } from "../statemachine";
import { runTenderGovernanceRuntime } from "../governance";
import { runTenderValidationRuntime } from "../validation";
import { evaluateCoverage } from "../scoring";
import type {
  ExternalEvidenceRuntimeError,
  ExternalEvidenceRuntimeInput,
  ExternalEvidenceRuntimeResult,
} from "../types";
import { EVIDENCE_RUNTIME_VERSION } from "../types";
import { completedPhase, failedPhase, skippedPhase } from "./phaseRunner";
import { appendAuditEvent, createRuntimeTrace, finishRuntimeTrace } from "./trace";
import {
  createEvidenceRuntimeOrchestrationSession,
  emitPostPipelineRuntimeEvents,
  finalizeOrchestration,
} from "../events/orchestration";
import {
  buildRuntimeEventIntelligence,
  runtimeSnapshotFromSuccess,
} from "../events/intelligence";

function newRunId() {
  return `evr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * V3.4-E1 External Evidence Runtime
 *
 * Attachment → OCR → Semantic → Linker → Registry → Coverage
 *
 * 确定性、可追踪、可审计；无 LLM / embedding / RAG。
 */
export async function runExternalEvidenceRuntime(
  input: ExternalEvidenceRuntimeInput,
): Promise<ExternalEvidenceRuntimeResult> {
  const runId = newRunId();
  const started = Date.now();
  const ranAt = new Date().toISOString();
  const eventSession = input.disableEventOrchestration
    ? undefined
    : createEvidenceRuntimeOrchestrationSession({
        runtimeInput: input,
        runId,
        ranAt,
      });
  let trace = createRuntimeTrace(runId);
  const phases: import("../types").EvidenceRuntimePhaseResult[] = [];
  const warnings: string[] = [];

  if (!input.attachments?.length) {
    const t0 = Date.now();
    phases.push(failedPhase("attachment", "未提供附件", t0));
    trace = appendAuditEvent(trace, {
      phaseId: "attachment",
      kind: "error",
      message: "NO_ATTACHMENTS",
    });
    const err: ExternalEvidenceRuntimeError = {
      ok: false,
      version: EVIDENCE_RUNTIME_VERSION,
      runId,
      code: "NO_ATTACHMENTS",
      message: "未提供有效附件",
      failedPhase: "attachment",
      phases,
      trace: finishRuntimeTrace(trace),
    };
    return err;
  }

  // attachment
  let t0 = Date.now();
  const normalized = normalizeAttachments(input.attachments);
  phases.push(
    completedPhase("attachment", `${normalized.files.length} 个附件就绪`, t0, {
      count: normalized.files.length,
    }),
  );
  trace = appendAuditEvent(trace, {
    phaseId: "attachment",
    kind: "artifact",
    message: "attachments normalized",
    payload: { count: normalized.files.length },
  });

  // ocr
  t0 = Date.now();
  let ocr;
  let ocrDocuments;
  try {
    ocrDocuments = await runOcrDocumentsOnAttachments(normalized.payloads, runId);
    ocr = ocrDocuments.map(toOcrExtraction);
    for (const doc of ocrDocuments) {
      if (doc.metadata.method === "filename_only") {
        warnings.push(`${doc.metadata.fileName}：仅文件名模式，无文本提取`);
      }
      for (const w of doc.metadata.warnings) {
        if (!warnings.includes(w)) warnings.push(w);
      }
    }
    const totalBlocks = ocrDocuments.reduce((n, d) => n + d.blocks.length, 0);
    phases.push(
      completedPhase(
        "ocr",
        `提取 ${ocr.reduce((n, e) => n + e.charCount, 0)} 字符 / ${totalBlocks} 块`,
        t0,
        {
          methods: ocr.map((e) => e.method).join(","),
          blocks: totalBlocks,
          ocrVersion: ocrDocuments[0]?.metadata.version,
        },
      ),
    );
    trace = appendAuditEvent(trace, {
      phaseId: "ocr",
      kind: "artifact",
      message: "deterministic ocr completed",
      payload: { documents: ocrDocuments.length, blocks: totalBlocks },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ocr failed";
    phases.push(failedPhase("ocr", message, t0));
    return {
      ok: false,
      version: EVIDENCE_RUNTIME_VERSION,
      runId,
      code: "OCR_FAILED",
      message,
      failedPhase: "ocr",
      phases,
      trace: finishRuntimeTrace(trace),
    };
  }

  // semantic
  t0 = Date.now();
  const classifications = classifyOcrExtractions(ocr);
  phases.push(
    completedPhase("semantic", `分类 ${classifications.length} 份附件`, t0, {
      types: classifications.map((c) => c.kind).join(","),
    }),
  );

  // registry (ingest records before linking)
  t0 = Date.now();
  let registry = input.existingRegistry
    ? mergeRegistries(createEmptyRegistry(), input.existingRegistry)
    : createEmptyRegistry();

  for (const ext of ocr) {
    const classification = classifications.find((c) => c.attachmentId === ext.attachmentId);
    if (!classification) continue;
    registry = ingestEvidenceRecord(registry, {
      extraction: ext,
      classification,
      provenance: {
        sourceKind: "attachment",
        sourceId: ext.attachmentId,
        runtimeRunId: runId,
        phaseId: "registry",
        ingestedAt: ranAt,
      },
    });
  }
  phases.push(
    completedPhase("registry", `写入 ${registry.records.length} 条证据`, t0, {
      records: registry.records.length,
    }),
  );

  // linker (V3.4-E3)
  t0 = Date.now();
  const requirementItems =
    input.requirementItems?.length
      ? input.requirementItems
      : requirementItemsFromAnchors(input.requirements || []);
  let links: import("../types").EvidenceLinkRecord[] = [];
  let linking: import("../types").EvidenceLinkingRuntimeResult | undefined;
  if (requirementItems.length) {
    const linked = linkRequirements({
      extractions: ocr,
      classifications,
      requirementItems,
      requirements: input.requirements,
      registry,
      minLinkScore: input.minLinkScore,
      ocrDocuments,
      runId,
    });
    registry = linked.registry;
    links = linked.links;
    linking = linked.linking;
    const locCount = linking?.matches.reduce((n, m) => n + m.locations.length, 0) ?? 0;
    phases.push(
      completedPhase("linker", `关联 ${links.length} 条 / OCR 定位 ${locCount}`, t0, {
        links: links.length,
        linkingVersion: linking?.version ?? "",
      }),
    );
    trace = appendAuditEvent(trace, {
      phaseId: "linker",
      kind: "artifact",
      message: "evidence linking runtime completed",
      payload: { links: links.length, locations: locCount },
    });
  } else {
    phases.push(skippedPhase("linker", "无需求项，跳过关联"));
  }

  // coverage (V3.4-E4)
  t0 = Date.now();
  let coverage: import("../types").CoverageRecord[] = [];
  let coverageSummary: import("../types").CoverageSummary = {
    total: 0,
    fully: 0,
    partial: 0,
    unsupported: 0,
    risky: 0,
    ratio: 1,
  };
  let coverageRuntime: import("../types").EvidenceCoverageRuntimeResult | undefined;
  if (requirementItems.length) {
    if (linking) {
      coverageRuntime = runEvidenceCoverageRuntime({
        runId,
        requirements: requirementItems,
        linking,
        policy: input.coveragePolicy,
      });
      coverage = coverageRuntime.legacyCoverage;
      coverageSummary = coverageRuntime.legacySummary;
      phases.push(
        completedPhase(
          "coverage",
          `校验 ${coverageRuntime.validation.verdict} / ratio=${coverageRuntime.summary.coverageRatio}`,
          t0,
          {
            covered: coverageRuntime.summary.covered,
            partial: coverageRuntime.summary.partial,
            missing: coverageRuntime.summary.missing,
            validationScore: coverageRuntime.summary.validationScore,
          },
        ),
      );
      trace = appendAuditEvent(trace, {
        phaseId: "coverage",
        kind: "artifact",
        message: "evidence coverage runtime completed",
        payload: {
          verdict: coverageRuntime.validation.verdict,
          score: coverageRuntime.summary.validationScore,
        },
      });
    } else if (input.requirements?.length) {
      const evaluated = evaluateCoverage(registry, input.requirements);
      coverage = evaluated.coverage;
      coverageSummary = evaluated.summary;
      phases.push(
        completedPhase("coverage", `覆盖 ratio=${coverageSummary.ratio} (legacy)`, t0, {
          fully: coverageSummary.fully,
          partial: coverageSummary.partial,
        }),
      );
    }
  } else {
    phases.push(skippedPhase("coverage", "无需求项，跳过覆盖评估"));
  }

  // tender validation (V3.4-E5)
  let tenderValidation: import("../types").TenderValidationRuntimeResult | undefined;
  if (coverageRuntime && requirementItems.length) {
    const document =
      input.tenderDocument || {
        documentId: runId,
        fileName: normalized.files[0]?.fileName,
        tenderTitle: "external-evidence-package",
        sourceType: "upload" as const,
      };
    tenderValidation = runTenderValidationRuntime({
      runId,
      document,
      requirements: requirementItems,
      coverageRuntime,
      linking,
      registry,
      attachments: normalized.files,
      policy: input.validationPolicy,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "tender validation runtime completed",
      payload: {
        outcome: tenderValidation.outcome,
        findings: tenderValidation.findings.length,
      },
    });
  }

  // tender audit (V3.4-E6)
  let tenderAudit: import("../types").TenderAuditResult | undefined;
  if (requirementItems.length && (linking || coverageRuntime || tenderValidation)) {
    const documentId =
      input.tenderDocument?.documentId || runId;
    tenderAudit = runTenderAuditRuntime({
      runId,
      documentId,
      startedAt: ranAt,
      requirements: requirementItems,
      attachments: normalized.files,
      ocrDocuments,
      linking,
      coverageRuntime,
      tenderValidation,
      registry,
      orchestrationTrace: trace,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "tender audit runtime completed",
      payload: {
        governance: tenderAudit.governanceStatus,
        auditEntries: tenderAudit.trail.summary.totalEntries,
      },
    });
  }

  // tender decision (V3.4-E7)
  let tenderDecision: import("../types").TenderDecisionResult | undefined;
  if (tenderAudit || tenderValidation || coverageRuntime) {
    const documentId = input.tenderDocument?.documentId || runId;
    tenderDecision = runTenderDecisionRuntime({
      runId,
      documentId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      linking,
      policy: input.decisionPolicy,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "tender decision runtime completed",
      payload: {
        status: tenderDecision.status,
        confidence: tenderDecision.confidence,
      },
    });
  }

  // tender governance (V3.4-E8)
  let tenderGovernance: import("../types").TenderGovernanceResult | undefined;
  if (tenderDecision) {
    const documentId = input.tenderDocument?.documentId || runId;
    tenderGovernance = runTenderGovernanceRuntime({
      runId,
      documentId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      policy: input.governancePolicy,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "tender governance runtime completed",
      payload: {
        riskLevel: tenderGovernance.riskLevel,
        posture: tenderGovernance.posture,
        escalation: tenderGovernance.escalation.level,
      },
    });
  }

  // executive oversight (V3.4-E9)
  let executiveOversight: import("../types").ExecutiveTenderResult | undefined;
  if (tenderGovernance) {
    const documentId = input.tenderDocument?.documentId || runId;
    executiveOversight = runExecutiveOversightRuntime({
      runId,
      documentId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      linking,
      ocrDocuments,
      policy: input.executivePolicy,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "executive oversight runtime completed",
      payload: {
        riskLevel: executiveOversight.riskLevel,
        verdict: executiveOversight.verdict,
        recommendation: executiveOversight.recommendation,
        executiveScore: executiveOversight.executiveScore,
      },
    });
  }

  // executive approval gate (V3.4-E10)
  let executiveApprovalGate:
    | import("../types").ExecutiveApprovalGateRuntimeResult
    | undefined;
  if (executiveOversight) {
    const documentId = input.tenderDocument?.documentId || runId;
    executiveApprovalGate = runExecutiveApprovalGateRuntime({
      runId,
      documentId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      executiveOversight,
      linking,
      ocrDocuments,
      policy: input.executiveGatePolicy,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "executive approval gate runtime completed",
      payload: {
        status: executiveApprovalGate.status,
        releasable: executiveApprovalGate.releasable,
        tenderReleaseDecision: executiveApprovalGate.tenderReleaseDecision,
        recommendation: executiveApprovalGate.recommendation,
      },
    });
  }

  // executive release surface (V3.4-E11)
  let executiveReleaseSurface:
    | import("../types").ExecutiveReleaseSurfaceRuntimeResult
    | undefined;
  if (executiveApprovalGate && executiveOversight) {
    const documentId = input.tenderDocument?.documentId || runId;
    executiveReleaseSurface = runExecutiveReleaseSurfaceRuntime({
      runId,
      documentId,
      executiveApprovalGate,
      executiveOversight,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "executive release surface runtime completed",
      payload: {
        status: executiveReleaseSurface.status,
        decision: executiveReleaseSurface.decision,
        releasable: executiveReleaseSurface.releasable,
        manifestLines: executiveReleaseSurface.manifest.lines.length,
      },
    });
  }

  // executive runtime visualization (V3.4-E12)
  let executiveRuntimeVisualization:
    | import("../types").ExecutiveRuntimeVisualizationResult
    | undefined;
  if (executiveReleaseSurface) {
    executiveRuntimeVisualization = runExecutiveRuntimeVisualization({
      runId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      executiveOversight,
      executiveApprovalGate,
      executiveReleaseSurface,
      linking,
      ocrDocuments,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "executive runtime visualization completed",
      payload: {
        executiveScore: executiveRuntimeVisualization.executiveScore,
        executiveGate: executiveRuntimeVisualization.executiveGate,
        releasable: executiveRuntimeVisualization.releasable,
      },
    });
  }

  // runtime correlation intelligence (V3.4-E13)
  let runtimeCorrelation:
    | import("../types").RuntimeCorrelationIntelligenceResult
    | undefined;
  if (executiveApprovalGate || executiveReleaseSurface || tenderGovernance) {
    runtimeCorrelation = runRuntimeCorrelationIntelligence({
      runId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      executiveOversight,
      executiveApprovalGate,
      executiveReleaseSurface,
      linking,
      ocrDocuments,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "runtime correlation intelligence completed",
      payload: {
        edges: runtimeCorrelation.edges.length,
        affectedRuntimeCount: runtimeCorrelation.affectedRuntimeCount,
        criticalPaths: runtimeCorrelation.criticalPaths.length,
      },
    });
  }

  // runtime policy engine (V3.4-E14)
  let runtimePolicy: import("../types").RuntimePolicyEngineResult | undefined;
  if (runtimeCorrelation || executiveApprovalGate || tenderGovernance) {
    runtimePolicy = runRuntimePolicyEngine({
      runId,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      executiveOversight,
      executiveApprovalGate,
      executiveReleaseSurface,
      runtimeCorrelation,
      linking,
      ocrDocuments,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "runtime policy engine completed",
      payload: {
        triggered: runtimePolicy.triggeredPolicies.length,
        blocked: runtimePolicy.blocked,
        conditionalRelease: runtimePolicy.conditionalRelease,
        executiveReviewRequired: runtimePolicy.executiveReviewRequired,
      },
    });
  }

  // runtime state machine (V3.4-E15)
  let runtimeStateMachine:
    | import("../types").RuntimeStateMachineRuntimeResult
    | undefined;
  if (runtimePolicy || executiveApprovalGate || tenderGovernance) {
    runtimeStateMachine = runRuntimeStateMachine({
      runId,
      ranAt,
      coverageRuntime,
      tenderValidation,
      tenderAudit,
      tenderDecision,
      tenderGovernance,
      executiveOversight,
      executiveApprovalGate,
      executiveReleaseSurface,
      runtimeCorrelation,
      runtimePolicy,
      linking,
      ocrDocuments,
      attachmentCount: normalized.files.length,
    });
    trace = appendAuditEvent(trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "runtime state machine completed",
      payload: {
        currentState: runtimeStateMachine.currentState,
        releasable: runtimeStateMachine.releasable,
        transitions: runtimeStateMachine.transitions.length,
      },
    });
  }

  const success: import("../types").ExternalEvidenceRuntimeSuccess = {
    ok: true,
    version: EVIDENCE_RUNTIME_VERSION,
    runId,
    ranAt,
    durationMs: Date.now() - started,
    phases,
    trace: finishRuntimeTrace(trace),
    attachments: normalized.files,
    ocr,
    ocrDocuments,
    classifications,
    registry,
    linking,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    executiveRuntimeVisualization,
    runtimeCorrelation,
    runtimePolicy,
    runtimeStateMachine,
    coverage,
    coverageSummary,
    warnings,
  };

  if (eventSession) {
    await emitPostPipelineRuntimeEvents(eventSession, success);
    success.runtimeEventOrchestration = finalizeOrchestration(eventSession);
    const orchestrationTrace = appendAuditEvent(success.trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "runtime event orchestration completed",
      payload: {
        events: success.runtimeEventOrchestration.eventCount,
        releaseBlocked: success.runtimeEventOrchestration.flags.releaseBlocked,
        releaseEnabled: success.runtimeEventOrchestration.flags.releaseEnabled,
        replay: eventSession.traceStore.formatReplay(),
      },
    });
    success.trace = finishRuntimeTrace(orchestrationTrace);

    success.runtimeEventIntelligence = buildRuntimeEventIntelligence({
      orchestration: success.runtimeEventOrchestration,
      runtimeSnapshot: runtimeSnapshotFromSuccess(success),
    });
    const intelTrace = appendAuditEvent(success.trace, {
      phaseId: "coverage",
      kind: "artifact",
      message: "runtime event intelligence completed",
      payload: {
        healthScore: success.runtimeEventIntelligence.health.healthScore,
        riskScore: success.runtimeEventIntelligence.risk.overallScore,
        anomalies: success.runtimeEventIntelligence.anomalies.length,
        hotspots: success.runtimeEventIntelligence.governanceHotspots.hotspots.length,
      },
    });
    success.trace = finishRuntimeTrace(intelTrace);
  }

  return success;
}
