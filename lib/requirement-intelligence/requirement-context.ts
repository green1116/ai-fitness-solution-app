import { buildRequirementRegistryRecords } from "./requirement-registry";
import type { RequirementRegistryContext, RequirementValidation } from "./shared/types";
import { REQUIREMENT_KINDS } from "./shared/types";

export function buildRequirementRegistryContext(): RequirementRegistryContext {
  const records = buildRequirementRegistryRecords();

  const kindBreakdown = records.reduce(
    (acc, record) => {
      acc[record.requirementKind] = (acc[record.requirementKind] ?? 0) + 1;
      return acc;
    },
    {} as RequirementRegistryContext["kindBreakdown"],
  );

  const sourceBreakdown = records.reduce(
    (acc, record) => {
      acc[record.source] = (acc[record.source] ?? 0) + 1;
      return acc;
    },
    {} as RequirementRegistryContext["sourceBreakdown"],
  );

  const tenderIds = new Set(records.map((record) => record.tenderId));
  const brandIds = new Set(records.filter((record) => record.brandId).map((record) => record.brandId!));
  const averageScore =
    records.length === 0
      ? 0
      : Math.round(
          records.reduce((sum, record) => sum + record.score.totalRequirementScore, 0) /
            records.length,
        );

  const kindCount = REQUIREMENT_KINDS.filter((kind) => (kindBreakdown[kind] ?? 0) > 0).length;
  const sourceCount = Object.keys(sourceBreakdown).length;

  return {
    contextId: "requirement-registry-context-v40-p1",
    records,
    recordCount: records.length,
    kindBreakdown,
    sourceBreakdown,
    tenderCoverage: tenderIds.size,
    brandCoverage: brandIds.size,
    averageScore,
    contextReady: records.length >= 30 && kindCount >= 8 && sourceCount >= 4 && brandIds.size >= 1,
    mode: "requirement-intelligence",
  };
}

export function validateRequirementContext(): RequirementValidation {
  const context = buildRequirementRegistryContext();

  const valid =
    context.contextReady &&
    context.averageScore > 0 &&
    context.tenderCoverage >= 10 &&
    context.brandCoverage >= 1;

  return {
    valid,
    count: context.recordCount,
    summary: `requirement-context count=${context.recordCount} tenders=${context.tenderCoverage} brands=${context.brandCoverage} avgScore=${context.averageScore} valid=${valid}`,
  };
}
