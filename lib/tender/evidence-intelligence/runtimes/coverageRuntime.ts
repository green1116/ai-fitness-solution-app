import { buildEvidenceDecision } from "@/lib/tender/evidence/runtime/buildEvidenceDecision";
import type { EvidenceAdapterResult } from "@/lib/tender/evidence/bridge/buildEvidenceFromPipeline";
import type { EvidencePipelineSnapshot } from "@/lib/tender/evidence/bridge/pipelineTypes";
import {
  buildCoverageInputs,
  buildMatrixInputs,
} from "@/lib/tender/evidence/runtime/pipelineHelpers";
import { evaluateRegistryCoverage } from "@/lib/tender/evidence/coverage";
import {
  getEvidenceByRequirement,
  getLinksForRequirement,
} from "@/lib/tender/evidence/registry";
import { buildTenderEvidenceMatrix, summarizeEvidenceMatrix } from "@/lib/tender/evidence/matrix";
import type { EvidenceRegistry } from "@/lib/tender/evidence/types";
import type { EvidenceDecisionPolicy, EvidenceRuntimeResult } from "@/lib/tender/evidence/runtime/types";
import {
  buildEvidenceTraceLog,
  createTraceEvent,
  resetTraceSequence,
} from "@/lib/tender/evidence/trace";
import type { CoverageRuntimeResult } from "../types";

/**
 * V3.4 Coverage Runtime — 在合并后的 Registry 上执行覆盖评估与证据决策
 */
export function runCoverageRuntime(
  snapshot: EvidencePipelineSnapshot,
  registry: EvidenceRegistry,
  policy?: EvidenceDecisionPolicy,
): CoverageRuntimeResult {
  resetTraceSequence();

  const matrixInputs = buildMatrixInputs(snapshot);
  const matrix = buildTenderEvidenceMatrix(registry, matrixInputs);
  const coverageInputs = buildCoverageInputs(snapshot);
  const coverage = evaluateRegistryCoverage(coverageInputs, (requirementId) => ({
    documents: getEvidenceByRequirement(registry, requirementId),
    links: getLinksForRequirement(registry, requirementId),
  }));

  const matrixSummary = summarizeEvidenceMatrix(matrix);
  const evidence: EvidenceAdapterResult = {
    registry,
    matrix,
    coverage,
    summary: {
      ...matrixSummary,
      documentsCount: registry.documents.length,
      linksCount: registry.links.length,
      payloadsCollected: 0,
    },
  };

  const mandatoryIds = new Set(
    coverageInputs.filter((c) => c.mandatory).map((c) => c.requirementId),
  );

  const decision = buildEvidenceDecision({
    coverage,
    documentsCount: registry.documents.length,
    linksCount: registry.links.length,
    mandatoryRequirementIds: mandatoryIds,
    policy,
  });

  const trace = buildEvidenceTraceLog(
    [
      createTraceEvent({
        kind: "decision_emitted",
        stageId: "decide",
        message: `coverage-runtime decision=${decision.action}`,
        metrics: {
          fully: matrixSummary.fully,
          unsupported: matrixSummary.unsupported,
        },
      }),
    ],
    [
      {
        stageId: "evaluate",
        status: "ok",
        startedAt: new Date().toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: 0,
        message: "coverage runtime evaluate",
      },
    ],
  );

  const runtime: EvidenceRuntimeResult = {
    evidence,
    trace,
    decision,
    stages: [],
    ranAt: new Date().toISOString(),
  };

  return { evidence, runtime };
}
