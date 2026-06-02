import { applyPayloadsToRegistry } from "../adapters/applyPayloads";
import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import type { EvidencePipelineSnapshot } from "../bridge/pipelineTypes";
import { evaluateRegistryCoverage } from "../coverage";
import {
  filterCandidateEvidence,
  proposeRequirementEvidenceLinks,
} from "../matching";
import { buildTenderEvidenceMatrix, summarizeEvidenceMatrix } from "../matrix";
import {
  createEvidenceRegistry,
  getEvidenceByRequirement,
  getLinksForRequirement,
  linkRequirementEvidence,
} from "../registry";
import type { EvidenceRegistry } from "../types";
import {
  buildEvidenceTraceLog,
  createTraceEvent,
  resetTraceSequence,
  tracePayloadIngested,
} from "../trace";
import type { EvidenceTraceEvent } from "../trace/types";
import { stableEvidenceDocumentId } from "../adapters/dedupe";

import { buildEvidenceDecision } from "./buildEvidenceDecision";
import {
  buildCoverageInputs,
  buildMatrixInputs,
  collectEvidencePayloads,
} from "./pipelineHelpers";
import type {
  EvidenceDecisionPolicy,
  EvidenceRuntimeResult,
  EvidenceStageResult,
  EvidenceStageStatus,
} from "./types";

function stageResult(
  stageId: EvidenceStageResult["stageId"],
  status: EvidenceStageStatus,
  started: number,
  message: string,
  metrics?: EvidenceStageResult["metrics"],
): EvidenceStageResult {
  const finished = Date.now();
  return {
    stageId,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
  };
}

function enrichRegistryWithProposedLinks(
  registry: EvidenceRegistry,
  matrixInputs: ReturnType<typeof buildMatrixInputs>,
  events: EvidenceTraceEvent[],
): { registry: EvidenceRegistry; linksProposed: number; linksApplied: number } {
  let next = registry;
  let linksProposed = 0;
  let linksApplied = 0;

  for (const row of matrixInputs) {
    if (getLinksForRequirement(next, row.requirementId).length > 0) continue;

    const candidates = filterCandidateEvidence(next.documents, row.requirement);
    const proposed = proposeRequirementEvidenceLinks(candidates, {
      requirementId: row.requirementId,
      requirementText: row.requirement,
    });
    const best = proposed[0];
    if (!best) continue;

    linksProposed += 1;
    events.push(
      createTraceEvent({
        kind: "link_proposed",
        stageId: "link",
        message: `proposed link ${best.evidenceId} → ${row.requirementId}`,
        refs: {
          requirementId: row.requirementId,
          evidenceId: best.evidenceId,
        },
        metrics: { confidence: best.confidence ?? 0 },
      }),
    );

    try {
      next = linkRequirementEvidence(next, best);
      linksApplied += 1;
      events.push(
        createTraceEvent({
          kind: "link_applied",
          stageId: "link",
          message: `applied link ${best.evidenceId} → ${row.requirementId}`,
          refs: {
            requirementId: row.requirementId,
            evidenceId: best.evidenceId,
          },
        }),
      );
    } catch {
      // skip
    }
  }

  return { registry: next, linksProposed, linksApplied };
}

export type RunEvidenceRuntimeOptions = {
  policy?: EvidenceDecisionPolicy;
  forceAllow?: boolean;
};

/**
 * V2.8 Evidence Runtime — 分阶段运行 evidence，输出 trace + decision
 */
export function runEvidenceRuntime(
  snapshot: EvidencePipelineSnapshot,
  options: RunEvidenceRuntimeOptions = {},
): EvidenceRuntimeResult {
  resetTraceSequence();
  const ranAt = new Date().toISOString();
  const events: EvidenceTraceEvent[] = [];
  const stages: EvidenceStageResult[] = [];

  // --- collect ---
  let t0 = Date.now();
  events.push(
    createTraceEvent({
      kind: "stage_start",
      stageId: "collect",
      message: "collecting evidence payloads from adapters",
    }),
  );
  const payloads = collectEvidencePayloads(snapshot);
  events.push(
    createTraceEvent({
      kind: "stage_end",
      stageId: "collect",
      message: `collected ${payloads.length} payloads`,
      metrics: { count: payloads.length },
    }),
  );
  stages.push(
    stageResult("collect", "ok", t0, `收集 ${payloads.length} 条证据载荷`, {
      payloads: payloads.length,
    }),
  );

  // --- ingest ---
  t0 = Date.now();
  events.push(
    createTraceEvent({
      kind: "stage_start",
      stageId: "ingest",
      message: "ingesting payloads into registry",
    }),
  );
  const { registry: ingestedRegistry, documentsAdded, linksAdded } =
    applyPayloadsToRegistry(createEvidenceRegistry(), payloads);

  for (const payload of payloads) {
    const evidenceId = stableEvidenceDocumentId(
      payload.sourceKind,
      payload.sourceId,
      payload.evidenceType,
    );
    events.push(tracePayloadIngested(payload, evidenceId));
  }

  events.push(
    createTraceEvent({
      kind: "stage_end",
      stageId: "ingest",
      message: `ingested documents=${documentsAdded} links=${linksAdded}`,
      metrics: { documentsAdded, linksAdded },
    }),
  );
  stages.push(
    stageResult("ingest", "ok", t0, `写入 ${documentsAdded} 文档、${linksAdded} 链接`, {
      documentsAdded,
      linksAdded,
    }),
  );

  // --- link ---
  t0 = Date.now();
  const matrixInputs = buildMatrixInputs(snapshot);
  const { registry, linksProposed, linksApplied } = enrichRegistryWithProposedLinks(
    ingestedRegistry,
    matrixInputs,
    events,
  );
  stages.push(
    stageResult("link", linksProposed > 0 ? "ok" : "skipped", t0, `补链 ${linksApplied}/${linksProposed} 条`, {
      linksProposed,
      linksApplied,
    }),
  );

  // --- evaluate ---
  t0 = Date.now();
  const matrix = buildTenderEvidenceMatrix(registry, matrixInputs);
  const coverageInputs = buildCoverageInputs(snapshot);
  const mandatoryIds = new Set(
    coverageInputs.filter((c) => c.mandatory).map((c) => c.requirementId),
  );
  const coverage = evaluateRegistryCoverage(coverageInputs, (requirementId) => ({
    documents: getEvidenceByRequirement(registry, requirementId),
    links: getLinksForRequirement(registry, requirementId),
  }));

  for (const row of coverage) {
    events.push(
      createTraceEvent({
        kind: "coverage_evaluated",
        stageId: "evaluate",
        message: `${row.requirementId} → ${row.status}`,
        refs: { requirementId: row.requirementId },
        metrics: { linkedCount: row.linkedEvidenceIds.length },
      }),
    );
  }

  const matrixSummary = summarizeEvidenceMatrix(matrix);
  const evidence: EvidenceAdapterResult = {
    registry,
    matrix,
    coverage,
    summary: {
      ...matrixSummary,
      documentsCount: registry.documents.length,
      linksCount: registry.links.length,
      payloadsCollected: payloads.length,
    },
  };
  stages.push(
    stageResult("evaluate", "ok", t0, `评估 ${coverage.length} 条要求覆盖`, {
      fully: matrixSummary.fully,
      partial: matrixSummary.partial,
      unsupported: matrixSummary.unsupported,
      risky: matrixSummary.risky,
    }),
  );

  // --- decide ---
  t0 = Date.now();
  const decision = buildEvidenceDecision({
    coverage,
    documentsCount: registry.documents.length,
    linksCount: registry.links.length,
    mandatoryRequirementIds: mandatoryIds,
    policy: options.policy,
    forceAllow: options.forceAllow,
  });
  events.push(
    createTraceEvent({
      kind: "decision_emitted",
      stageId: "decide",
      message: `decision=${decision.action}`,
      metrics: {
        passed: decision.passed,
        unsupported: decision.meta.unsupportedCount,
        risky: decision.meta.riskyCount,
      },
    }),
  );
  stages.push(
    stageResult("decide", decision.action === "block" ? "warn" : "ok", t0, decision.title, {
      action: decision.action,
      passed: decision.passed,
    }),
  );

  const trace = buildEvidenceTraceLog(events, stages);

  return {
    evidence,
    trace,
    decision,
    stages,
    ranAt,
  };
}

/** 从已有 EvidenceAdapterResult 重跑决策 + 轻量 trace（不重建 registry） */
export function runEvidenceDecisionOnly(
  evidence: EvidenceAdapterResult,
  options: RunEvidenceRuntimeOptions = {},
): Pick<EvidenceRuntimeResult, "decision" | "trace" | "stages" | "ranAt"> {
  resetTraceSequence();
  const ranAt = new Date().toISOString();
  const events: EvidenceTraceEvent[] = [];
  const stages: EvidenceStageResult[] = [];

  const t0 = Date.now();
  const decision = buildEvidenceDecision({
    coverage: evidence.coverage,
    documentsCount: evidence.registry.documents.length,
    linksCount: evidence.registry.links.length,
    policy: options.policy,
    forceAllow: options.forceAllow,
  });
  events.push(
    createTraceEvent({
      kind: "decision_emitted",
      stageId: "decide",
      message: `decision-only ${decision.action}`,
    }),
  );
  stages.push(stageResult("decide", "ok", t0, decision.title, { action: decision.action }));

  return {
    decision,
    trace: buildEvidenceTraceLog(events, stages),
    stages,
    ranAt,
  };
}
