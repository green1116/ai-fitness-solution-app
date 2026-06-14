import { buildIndustryCRM } from "@/lib/industry-crm";
import type { IndustryCRM } from "@/lib/industry-crm";
import { buildMarketplaceScore, resolveMarketplaceStatusFromCRM } from "./marketplace-scoring";
import type { IndustryMarketplace, IndustryMarketplaceType, RegistryValidation } from "./shared/types";
import { CANONICAL_MARKETPLACE_SUBJECT_ID } from "./shared/types";

function crmToMarketplace(crm: IndustryCRM, rank: number): IndustryMarketplace {
  const marketplaceId = `ind-marketplace-${crm.crmId}`;
  const score = buildMarketplaceScore(marketplaceId, crm, rank);

  return {
    marketplaceId,
    crmId: crm.crmId,
    lifecycleId: crm.lifecycleId,
    pipelineId: crm.pipelineId,
    workflowId: crm.workflowId,
    executionId: crm.executionId,
    activationId: crm.activationId,
    opportunityId: crm.opportunityId,
    marketplaceType: crm.crmType,
    subjectId: crm.subjectId,
    subjectType: crm.subjectType,
    title: `${crm.title.replace(" — CRM", "")} — Marketplace`,
    summary: `${crm.summary} Transitioned to industry marketplace listing stage.`,
    insightIds: [...crm.insightIds],
    marketplaceStatus: resolveMarketplaceStatusFromCRM(crm, score, rank),
    score,
    generatedAt: crm.generatedAt,
    metadata: {
      ...crm.metadata,
      sourceCRMScore: crm.score.totalCRMScore.toString(),
      sourceLayer: "v34-industry-crm",
    },
    mode: "industry-marketplace",
  };
}

export function buildIndustryMarketplace(): IndustryMarketplace[] {
  const crmRecords = buildIndustryCRM();

  return crmRecords.map((crm, index) => crmToMarketplace(crm, index + 1));
}

export function getMarketplaceById(marketplaceId: string): IndustryMarketplace | undefined {
  return buildIndustryMarketplace().find((record) => record.marketplaceId === marketplaceId);
}

export function getMarketplaceByType(marketplaceType: IndustryMarketplaceType): IndustryMarketplace[] {
  return buildIndustryMarketplace().filter((record) => record.marketplaceType === marketplaceType);
}

export function getMarketplaceBySubject(subjectId: string): IndustryMarketplace[] {
  return buildIndustryMarketplace().filter((record) => record.subjectId === subjectId);
}

export function validateMarketplaceRegistry(): RegistryValidation {
  const marketplaceRecords = buildIndustryMarketplace();
  const requiredTypes: IndustryMarketplaceType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredStatuses = [
    "listed",
    "visible",
    "matched",
    "engaged",
    "transacting",
    "fulfilled",
    "retained",
    "archived",
  ] as const;

  const typeCoverage = requiredTypes.every((type) =>
    marketplaceRecords.some((record) => record.marketplaceType === type),
  );

  const statusCoverage = requiredStatuses.every((status) =>
    marketplaceRecords.some((record) => record.marketplaceStatus === status),
  );

  const scoreValid = marketplaceRecords.every(
    (record) =>
      record.score.visibilityScore > 0 &&
      record.score.matchingScore > 0 &&
      record.score.transactionScore > 0 &&
      record.score.retentionScore > 0 &&
      record.score.confidenceScore > 0 &&
      record.score.totalMarketplaceScore > 0 &&
      record.insightIds.length > 0 &&
      record.mode === "industry-marketplace",
  );

  const canonical = getMarketplaceBySubject(CANONICAL_MARKETPLACE_SUBJECT_ID);

  const valid =
    marketplaceRecords.length >= 8 &&
    typeCoverage &&
    statusCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: marketplaceRecords.length,
    summary: `marketplace-registry count=${marketplaceRecords.length} types=${requiredTypes.filter((t) => marketplaceRecords.some((r) => r.marketplaceType === t)).length}/4 statuses=${requiredStatuses.filter((s) => marketplaceRecords.some((r) => r.marketplaceStatus === s)).length}/8 valid=${valid}`,
  };
}
