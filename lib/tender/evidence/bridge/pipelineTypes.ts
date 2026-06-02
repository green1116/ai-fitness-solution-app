import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { TenderResponsePackage } from "@/lib/tender/response/types";
import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";

/**
 * 现有 pipeline 输出快照（adapter 输入）
 */
export type EvidencePipelineSnapshot = {
  graph?: TenderSemanticGraph;
  compliance?: TechnicalCompliancePackage;
  skuResult?: SKUIntelligenceResult;
  responses?: TenderResponsePackage;
};
