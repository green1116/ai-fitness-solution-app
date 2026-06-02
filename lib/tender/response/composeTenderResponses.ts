import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { TechnicalCompliancePackage } from "@/lib/tender/compliance/types";
import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";

import { buildSkuMatchMap } from "./skuEnrichment";
import { composeAttachmentIndex } from "./composeAttachmentIndex";
import { composeCommercialResponse } from "./composeCommercialResponse";
import { composeRiskResponse } from "./composeRiskResponse";
import { composeScoringResponse } from "./composeScoringResponse";
import { composeTechnicalResponse } from "./composeTechnicalResponse";
import type {
  TenderComposedResponses,
  TenderResponsePackage,
} from "./types";
import { flattenResponsePackage, summarizeResponsePackage } from "./types";

/**
 * semantic graph → TenderResponsePackage（V2.2 总入口）
 */
export function composeTenderResponsePackage(
  graph: TenderSemanticGraph,
  skuResult?: SKUIntelligenceResult,
  compliancePackage?: TechnicalCompliancePackage,
): TenderResponsePackage {
  const complianceByReq = new Map(
    graph.compliance.map((c) => [c.requirementId, c]),
  );
  const skuMatchByReq = buildSkuMatchMap(skuResult);

  const technicalBlocks = composeTechnicalResponse(
    graph.requirements,
    complianceByReq,
    skuMatchByReq,
    compliancePackage,
  );
  const commercialBlocks = composeCommercialResponse(
    graph.requirements,
    complianceByReq,
  );
  const scoringBlocks = composeScoringResponse(
    graph.scoringItems,
    graph.requirements,
  );
  const riskBlocks = composeRiskResponse(graph.risks);
  const { items: attachmentIndex, blocks: attachmentBlocks } =
    composeAttachmentIndex(
      graph.requirements,
      graph.scoringItems,
      graph.risks,
    );

  return {
    technicalBlocks,
    commercialBlocks,
    scoringBlocks,
    riskBlocks,
    attachmentBlocks,
    attachmentIndex,
  };
}

/** 兼容：返回 package + 扁平 blocks + summary */
export function composeTenderResponses(
  graph: TenderSemanticGraph,
  skuResult?: SKUIntelligenceResult,
  compliancePackage?: TechnicalCompliancePackage,
): TenderComposedResponses {
  const pkg = composeTenderResponsePackage(
    graph,
    skuResult,
    compliancePackage,
  );
  const blocks = flattenResponsePackage(pkg);
  return {
    package: pkg,
    blocks,
    summary: summarizeResponsePackage(pkg),
  };
}
