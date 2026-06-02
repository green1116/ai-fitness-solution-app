import type {
  EvidenceIntelligencePhaseId,
  EvidenceIntelligencePhaseResult,
  EvidenceIntelligencePhaseStatus,
  ExternalEvidenceIntelligenceError,
  ExternalEvidenceIntelligenceInput,
  ExternalEvidenceIntelligenceResult,
} from "./types";
import { runAttachmentRuntime } from "./runtimes/attachmentRuntime";
import { runClassificationRuntime } from "./runtimes/classificationRuntime";
import { runCoverageRuntime } from "./runtimes/coverageRuntime";
import { runLinkingRuntime } from "./runtimes/linkingRuntime";
import { runOcrRuntime } from "./runtimes/ocrRuntime";
import { runRegistryRuntime } from "./runtimes/registryRuntime";

function newRunId() {
  return `eir-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function phaseRecord(
  phaseId: EvidenceIntelligencePhaseId,
  runtime: EvidenceIntelligencePhaseResult["runtime"],
  status: EvidenceIntelligencePhaseStatus,
  started: number,
  message: string,
  metrics?: EvidenceIntelligencePhaseResult["metrics"],
  error?: string,
): EvidenceIntelligencePhaseResult {
  const finished = Date.now();
  return {
    phaseId,
    runtime,
    status,
    startedAt: new Date(started).toISOString(),
    finishedAt: new Date(finished).toISOString(),
    durationMs: finished - started,
    message,
    metrics,
    error,
  };
}

/**
 * V3.4 External Evidence Intelligence Runtime
 *
 * Attachment → OCR → Classification → Linking → Registry → Coverage
 */
export async function runExternalEvidenceIntelligence(
  input: ExternalEvidenceIntelligenceInput,
): Promise<ExternalEvidenceIntelligenceResult | ExternalEvidenceIntelligenceError> {
  const runId = newRunId();
  const started = Date.now();
  const phases: EvidenceIntelligencePhaseResult[] = [];
  const warnings: string[] = [];
  const ranAt = new Date().toISOString();

  // attachment
  let t0 = Date.now();
  const attachment = runAttachmentRuntime(input.attachments);
  if (attachment.count === 0) {
    phases.push(
      phaseRecord("attachment", "attachment", "failed", t0, "无有效附件", undefined, "NO_ATTACHMENTS"),
    );
    return {
      ok: false,
      runId,
      code: "NO_ATTACHMENTS",
      message: "未提供有效附件 buffer",
      failedPhase: "attachment",
      phases,
    };
  }
  phases.push(
    phaseRecord("attachment", "attachment", "completed", t0, `${attachment.count} 个附件就绪`),
  );

  // ocr
  t0 = Date.now();
  let ocr;
  try {
    ocr = await runOcrRuntime(attachment.normalized);
    for (const ext of ocr.extractions) {
      if (ext.extractionMethod === "filename_only") {
        warnings.push(`${ext.fileName}：OCR 仅文件名模式`);
      }
    }
    phases.push(
      phaseRecord("ocr", "ocr", "completed", t0, `提取 ${ocr.totalChars} 字符`, {
        methods: JSON.stringify(ocr.methods),
      }),
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "ocr failed";
    phases.push(phaseRecord("ocr", "ocr", "failed", t0, message, undefined, message));
    return { ok: false, runId, code: "OCR_FAILED", message, failedPhase: "ocr", phases };
  }

  // classification
  t0 = Date.now();
  const classification = runClassificationRuntime(ocr.extractions);
  phases.push(
    phaseRecord("classification", "classification", "completed", t0, "语义分类完成", {
      types: JSON.stringify(classification.byType),
    }),
  );

  // linking
  t0 = Date.now();
  const graph =
    input.graph ||
    input.snapshot?.graph;
  const linking = runLinkingRuntime(
    classification.classified,
    graph,
    input.minLinkScore,
  );
  phases.push(
    phaseRecord("linking", "linking", graph ? "completed" : "skipped", t0, `链接 ${linking.links.length} 条`, {
      linked: linking.linkedAttachmentCount,
    }),
  );

  // registry
  t0 = Date.now();
  const snapshot: import("@/lib/tender/evidence/bridge/pipelineTypes").EvidencePipelineSnapshot =
    input.snapshot || (graph ? { graph } : {});
  const registry = runRegistryRuntime({
    extractions: linking.extractions,
    baseRegistry: input.registry,
    snapshot: Object.keys(snapshot).length ? snapshot : undefined,
    mergeInternalEvidence: input.mergeInternalEvidence,
  });
  phases.push(
    phaseRecord("registry", "registry", "completed", t0, `registry +${registry.documentsAdded} 文档`, {
      mergedInternal: registry.mergedInternal,
    }),
  );

  // coverage
  t0 = Date.now();
  if (!snapshot.graph && !input.snapshot?.compliance) {
    phases.push(phaseRecord("coverage", "coverage", "skipped", t0, "无 graph，跳过覆盖运行时"));
    const emptyEvidence = {
      registry: registry.registry,
      matrix: [],
      coverage: [],
      summary: {
        fully: 0,
        partial: 0,
        unsupported: 0,
        risky: 0,
        total: 0,
        documentsCount: registry.registry.documents.length,
        linksCount: registry.registry.links.length,
        payloadsCollected: 0,
      },
    };
    return {
      ok: true,
      version: "3.4",
      runId,
      ranAt,
      durationMs: Date.now() - started,
      phases,
      attachment,
      ocr,
      classification,
      linking,
      registry,
      coverage: {
        evidence: emptyEvidence,
        runtime: {
          evidence: emptyEvidence,
          trace: { version: "2.8", events: [], summary: { eventCount: 0, stageCount: 0, payloadsIngested: 0, linksProposed: 0, linksApplied: 0 } },
          decision: {
            action: "allow",
            passed: true,
            title: "仅外部证据已摄入",
            message: "无招标语义图，已完成附件证据写入",
            reasons: [],
            suggestedNextSteps: [],
            meta: {
              totalRequirements: 0,
              fullyEvidencedCount: 0,
              partiallyEvidencedCount: 0,
              unsupportedCount: 0,
              riskyCount: 0,
              mandatoryUnsupportedCount: 0,
              documentsCount: registry.registry.documents.length,
              linksCount: registry.registry.links.length,
              coverageRatio: 1,
            },
          },
          stages: [],
          ranAt,
        },
      },
      warnings,
    };
  }

  try {
    const coverage = runCoverageRuntime(
      snapshot,
      registry.registry,
      input.evidencePolicy,
    );
    phases.push(
      phaseRecord("coverage", "coverage", "completed", t0, `决策 ${coverage.runtime.decision.action}`, {
        coverageRatio: coverage.runtime.decision.meta.coverageRatio,
      }),
    );

    return {
      ok: true,
      version: "3.4",
      runId,
      ranAt,
      durationMs: Date.now() - started,
      phases,
      attachment,
      ocr,
      classification,
      linking,
      registry,
      coverage,
      warnings,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "coverage failed";
    phases.push(phaseRecord("coverage", "coverage", "failed", t0, message, undefined, message));
    return { ok: false, runId, code: "COVERAGE_FAILED", message, failedPhase: "coverage", phases };
  }
}
