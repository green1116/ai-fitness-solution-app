import type { EvidenceAdapterResult } from "../bridge/buildEvidenceFromPipeline";
import { summarizeEvidenceMatrix } from "../matrix";

import {
  buildEvidenceApiPackage,
  buildEvidenceFromProvidedSnapshot,
} from "./buildEvidenceApiPackage";
import { queryEvidenceRegistry } from "./evidenceQueryService";
import { runEvidenceRuntimeApi } from "./runEvidenceRuntimeApi";
import type {
  EvidenceApiRequest,
  EvidenceApiResponse,
  EvidenceApiErrorResponse,
} from "./types";

function resolveAction(request: EvidenceApiRequest): EvidenceApiRequest["action"] {
  if (request.action === "runtime") return "runtime";
  if (request.action) return request.action;
  if (request.rawText?.trim()) return "build";
  if (request.registry && !request.graph && !request.rawText) return "query";
  if (request.graph || request.compliance) return "build";
  return "query";
}

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
 * V2.7 统一 Evidence API 执行入口
 */
export async function runEvidenceApi(
  request: EvidenceApiRequest,
): Promise<EvidenceApiResponse | EvidenceApiErrorResponse> {
  try {
    const action = resolveAction(request) ?? "query";

    if (action === "runtime") {
      return runEvidenceRuntimeApi(request);
    }
    let evidence: EvidenceAdapterResult | undefined;
    let sourceName = request.sourceName ?? null;

    if (action === "build") {
      if (request.rawText?.trim() || (!request.registry && request.graph)) {
        const built = await buildEvidenceApiPackage(request);
        evidence = built.evidence;
        sourceName = built.sourceName ?? sourceName;
      } else {
        evidence =
          buildEvidenceFromProvidedSnapshot(request) ??
          (request.registry ? packageFromRegistryOnly(request) : undefined);
      }
    } else {
      if (request.registry) {
        evidence =
          buildEvidenceFromProvidedSnapshot(request) ??
          packageFromRegistryOnly(request);
      } else if (request.graph || request.compliance) {
        evidence = buildEvidenceFromProvidedSnapshot(request) ?? undefined;
      }
    }

    if (!evidence?.registry) {
      return {
        ok: false,
        code: "EVIDENCE_SOURCE_REQUIRED",
        message:
          "请提供 rawText/graph 进行 build，或提供 registry 进行 query",
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
      action,
      sourceName,
      evidence,
      query,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "evidence api failed";
    return {
      ok: false,
      code: "EVIDENCE_API_FAILED",
      message,
    };
  }
}
