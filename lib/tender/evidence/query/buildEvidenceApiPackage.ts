import { analyzeTender } from "@/lib/tender/analyzeTender";
import { buildTechnicalCompliancePackage } from "@/lib/tender/compliance";
import { composeTenderResponsePackage } from "@/lib/tender/response";
import { buildSemanticGraph } from "@/lib/tender/semantic";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import { buildSkuMappings } from "@/lib/tender/sku";

import {
  buildEvidenceFromPipeline,
  type EvidenceAdapterResult,
} from "../bridge";
import type { EvidencePipelineSnapshot } from "../bridge/pipelineTypes";
import type { EvidenceApiRequest } from "./types";

export type BuildEvidenceApiResult = {
  snapshot: EvidencePipelineSnapshot;
  evidence: EvidenceAdapterResult;
  sourceName?: string | null;
  built: {
    graph: boolean;
    compliance: boolean;
    sku: boolean;
    responses: boolean;
  };
};

export type PreparedEvidenceSnapshot = {
  snapshot: EvidencePipelineSnapshot;
  sourceName?: string | null;
  built: BuildEvidenceApiResult["built"];
};

/**
 * 仅编排 pipeline snapshot（不执行 evidence build/runtime）
 */
export async function prepareEvidencePipelineSnapshot(
  request: EvidenceApiRequest,
): Promise<PreparedEvidenceSnapshot> {
  const opts = request.options ?? {};
  const runCompliance = opts.runCompliance !== false;
  const runSku = opts.runSku !== false;
  const runResponses = opts.runResponses === true;

  let graph = request.graph;
  let sourceName = request.sourceName;
  const built = {
    graph: false,
    compliance: false,
    sku: false,
    responses: false,
  };

  if (!graph && request.rawText?.trim()) {
    const parsed = await analyzeTender({
      rawText: request.rawText.trim(),
      fileName: sourceName || "pasted-tender.txt",
    });
    graph = buildSemanticGraph(parsed).graph;
    built.graph = true;
  }

  if (!graph) {
    throw new Error("需要提供 graph 或 rawText 以构建 evidence");
  }

  let compliance = request.compliance;
  let skuResult = request.skuResult;
  let responses = request.responses;

  if (runSku && !skuResult) {
    skuResult = buildSkuMappings(graph);
    built.sku = true;
  }

  if (runCompliance && !compliance) {
    compliance = buildTechnicalCompliancePackage({
      graph,
      skuResult,
    });
    built.compliance = true;
  }

  if (runResponses && !responses) {
    responses = composeTenderResponsePackage(
      graph,
      skuResult,
      compliance,
    );
    built.responses = true;
  }

  return {
    snapshot: { graph, compliance, skuResult, responses },
    sourceName: sourceName || null,
    built,
  };
}

/**
 * 从 API 请求构建完整 evidence 包（编排现有 pipeline，无 OCR）
 */
export async function buildEvidenceApiPackage(
  request: EvidenceApiRequest,
): Promise<BuildEvidenceApiResult> {
  const prepared = await prepareEvidencePipelineSnapshot(request);
  const evidence = buildEvidenceFromPipeline(prepared.snapshot);
  return { ...prepared, evidence };
}

export function buildEvidenceFromProvidedSnapshot(
  request: EvidenceApiRequest,
): EvidenceAdapterResult | null {
  if (request.graph || request.compliance || request.skuResult || request.responses) {
    return buildEvidenceFromPipeline({
      graph: request.graph,
      compliance: request.compliance,
      skuResult: request.skuResult,
      responses: request.responses,
    });
  }

  return null;
}
