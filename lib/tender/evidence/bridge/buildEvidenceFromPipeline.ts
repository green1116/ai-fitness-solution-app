import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";

import { runEvidenceRuntime } from "../runtime";
import type {
  EvidenceMatrixRequirementInput,
  EvidenceRegistry,
  RequirementCoverageResult,
  TenderEvidenceMatrixRow,
} from "../types";
import type { EvidencePipelineSnapshot } from "./pipelineTypes";

export type EvidenceAdapterResult = {
  registry: EvidenceRegistry;
  matrix: TenderEvidenceMatrixRow[];
  coverage: RequirementCoverageResult[];
  summary: ReturnType<
    typeof import("../matrix").summarizeEvidenceMatrix
  > & {
    documentsCount: number;
    linksCount: number;
    payloadsCollected: number;
  };
};

/**
 * V2.6 统一入口（V2.8 内部委托 runEvidenceRuntime）
 */
export function buildEvidenceFromPipeline(
  snapshot: EvidencePipelineSnapshot,
): EvidenceAdapterResult {
  return runEvidenceRuntime(snapshot).evidence;
}

/** 便捷：仅 compliance 路径 */
export function buildEvidenceFromCompliance(
  compliance: TechnicalCompliancePackage,
  graph?: EvidencePipelineSnapshot["graph"],
  skuResult?: EvidencePipelineSnapshot["skuResult"],
): EvidenceAdapterResult {
  return buildEvidenceFromPipeline({ compliance, graph, skuResult });
}
