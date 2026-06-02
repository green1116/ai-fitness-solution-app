import type { TenderSemanticGraph } from "@/lib/tender/semantic/types";
import type { TenderIntelligenceResult } from "@/lib/tender/types";
import { matchSkuForRequirement } from "@/lib/tender/sku/skuMatcher";
import type { SKUIntelligenceResult } from "@/lib/tender/sku/skuTypes";
import { getSkuById } from "@/lib/tender/sku/skuDatabase";

import { buildComplianceMatrix } from "./buildComplianceMatrix";
import { composeComplianceResponses } from "./composeComplianceResponse";
import { detectDeviation } from "./detectDeviation";
import { evaluateComplianceRisk } from "./evaluateComplianceRisk";
import { extractTechnicalRequirements } from "./extractTechnicalRequirements";
import { matchSkuParameters } from "./matchSkuParameters";
import { buildTechnicalEvidence } from "./buildTechnicalEvidence";
import type { ComplianceResult, TechnicalCompliancePackage } from "./types";

export type BuildComplianceInput = {
  graph: TenderSemanticGraph;
  parseResult?: Pick<TenderIntelligenceResult, "tables">;
  skuResult?: SKUIntelligenceResult;
};

function resolveSkuForRequirement(
  reqId: string,
  semanticReqId: string,
  skuResult?: SKUIntelligenceResult,
) {
  const mapping = skuResult?.mappings.find(
    (m) => m.requirementId === semanticReqId,
  );
  if (mapping?.skuId) return getSkuById(mapping.skuId);

  const match = skuResult?.matchResults.find(
    (m) => m.requirementId === semanticReqId,
  );
  return match?.sku;
}

/**
 * V2.4 技术符合性 pipeline
 */
export function buildTechnicalCompliancePackage(
  input: BuildComplianceInput,
): TechnicalCompliancePackage {
  const { graph, parseResult, skuResult } = input;

  const requirements = extractTechnicalRequirements(
    graph.requirements,
    parseResult?.tables ?? [],
  );

  const complianceResults: ComplianceResult[] = [];
  const usedSkus = new Map<string, import("@/lib/tender/sku/skuTypes").ProductSKU>();

  for (const techReq of requirements) {
    const parentSemanticId = techReq.id.split("-P")[0] || techReq.id;
    const semanticReq =
      graph.requirements.find((r) => r.id === parentSemanticId) ||
      graph.requirements.find((r) =>
        techReq.requirementText.includes(r.requirement.slice(0, 12)),
      );

    let sku =
      semanticReq &&
      resolveSkuForRequirement(techReq.id, semanticReq.id, skuResult);

    if (!sku && semanticReq) {
      const match = matchSkuForRequirement(semanticReq);
      sku = match.sku;
    }

    if (!sku && skuResult?.recommendedSkus[0]) {
      sku = skuResult.recommendedSkus[0];
    }

    if (!sku) {
      complianceResults.push({
        requirementId: techReq.id,
        status: "failed",
        matchedParameters: [],
        missingParameters: [techReq.parameterName || "unknown"],
        evidenceRequired: true,
      });
      continue;
    }

    usedSkus.set(sku.id, sku);
    complianceResults.push(matchSkuParameters(techReq, sku));
  }

  const matrix = buildComplianceMatrix(requirements, complianceResults);
  const deviations = detectDeviation(requirements, complianceResults);
  const { riskLevel, risks } = evaluateComplianceRisk(
    complianceResults,
    deviations,
  );
  const responses = composeComplianceResponses(requirements, complianceResults);
  const evidence = buildTechnicalEvidence(
    requirements,
    complianceResults,
    [...usedSkus.values()],
  );

  return {
    requirements,
    complianceResults,
    matrix,
    deviations,
    risks,
    responses,
    evidence,
    riskLevel,
  };
}
