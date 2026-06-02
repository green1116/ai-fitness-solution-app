import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import { runEvidenceRuntime, runEvidenceDecisionOnly } from "../runtime";
import { summarizeEvidenceMatrix } from "../matrix";

import {
  prepareEvidencePipelineSnapshot,
  buildEvidenceFromProvidedSnapshot,
} from "./buildEvidenceApiPackage";
import { queryEvidenceRegistry } from "./evidenceQueryService";
import type {
  EvidenceApiRequest,
  EvidenceApiErrorResponse,
  EvidenceRuntimeApiResponse,
} from "./types";

function packageFromRegistryOnly(
  request: EvidenceApiRequest,
): EvidenceAdapterResult {
  const registry = request.registry!;
  const matrix = request.matrix ?? [];
  const matrixSummary = summarizeEvidenceMatrix(matrix);
  return {
    registry,
    matrix,
    coverage: request.coverage ?? [],
    summary: {
      ...matrixSummary,
      documentsCount: registry.documents.length,
      linksCount: registry.links.length,
      payloadsCollected: 0,
    },
  };
}

/**
 * V2.8 Evidence Runtime API — build + trace + decision + query
 */
export async function runEvidenceRuntimeApi(
  request: EvidenceApiRequest,
): Promise<EvidenceRuntimeApiResponse | EvidenceApiErrorResponse> {
  try {
    let evidence: EvidenceAdapterResult | undefined;
    let sourceName = request.sourceName ?? null;
    let runtimeResult;

    const runtimeOpts = {
      policy: request.runtimePolicy,
      forceAllow: request.forceAllow,
    };

    if (request.rawText?.trim() || (!request.registry && request.graph)) {
      const prepared = await prepareEvidencePipelineSnapshot(request);
      sourceName = prepared.sourceName ?? sourceName;
      runtimeResult = runEvidenceRuntime(prepared.snapshot, runtimeOpts);
      evidence = runtimeResult.evidence;
    } else if (request.graph || request.compliance) {
      const built = buildEvidenceFromProvidedSnapshot(request);
      if (!built) {
        return {
          ok: false,
          code: "EVIDENCE_SOURCE_REQUIRED",
          message: "请提供 graph/compliance 或 rawText",
        };
      }
      runtimeResult = runEvidenceRuntime(
        {
          graph: request.graph,
          compliance: request.compliance,
          skuResult: request.skuResult,
          responses: request.responses,
        },
        runtimeOpts,
      );
      evidence = runtimeResult.evidence;
    } else if (request.registry) {
      evidence =
        buildEvidenceFromProvidedSnapshot(request) ??
        packageFromRegistryOnly(request);
      runtimeResult = runEvidenceDecisionOnly(evidence, runtimeOpts);
    } else {
      return {
        ok: false,
        code: "EVIDENCE_SOURCE_REQUIRED",
        message: "请提供 rawText/graph 进行 runtime，或提供 registry 重跑决策",
      };
    }

    if (!evidence?.registry || !runtimeResult) {
      return {
        ok: false,
        code: "EVIDENCE_RUNTIME_FAILED",
        message: "runtime 未能生成 evidence",
      };
    }

    const query = queryEvidenceRegistry(
      evidence.registry,
      evidence.matrix,
      evidence.coverage,
      request.filters,
    );

    return {
      ok: true,
      action: "runtime",
      sourceName,
      evidence,
      query,
      runtime: {
        trace: runtimeResult.trace,
        decision: runtimeResult.decision,
        stages: runtimeResult.stages,
        ranAt: runtimeResult.ranAt,
      },
    };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "evidence runtime failed";
    return {
      ok: false,
      code: "EVIDENCE_RUNTIME_FAILED",
      message,
    };
  }
}
