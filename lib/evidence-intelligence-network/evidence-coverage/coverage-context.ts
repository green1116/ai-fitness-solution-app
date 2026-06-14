import type {
  EvidenceCoverageContext,
  EvidenceCoverageLevel,
  EvidenceCoverageRecord,
  EvidenceCoverageTargetType,
  RegistryValidation,
} from "../shared/types";
import { buildEvidenceCoverageRecords, findBrandRequirementEvidencePaths } from "./coverage-registry";

export function buildEvidenceCoverageContext(input?: {
  brandId?: string;
  tenderId?: string;
  requirementId?: string;
}): EvidenceCoverageContext {
  let records = buildEvidenceCoverageRecords();

  if (input?.brandId) {
    records = records.filter(
      (record) => record.brandId === input.brandId || record.targetId === input.brandId,
    );
  }
  if (input?.tenderId) {
    records = records.filter(
      (record) => record.tenderId === input.tenderId || record.targetId === input.tenderId,
    );
  }
  if (input?.requirementId) {
    records = records.filter(
      (record) =>
        record.requirementId === input.requirementId || record.targetId === input.requirementId,
    );
  }

  const levelBreakdown = records.reduce(
    (acc, record) => {
      acc[record.coverageLevel] = (acc[record.coverageLevel] ?? 0) + 1;
      return acc;
    },
    {} as Record<EvidenceCoverageLevel, number>,
  );

  const targetBreakdown = records.reduce(
    (acc, record) => {
      acc[record.targetType] = (acc[record.targetType] ?? 0) + 1;
      return acc;
    },
    {} as Record<EvidenceCoverageTargetType, number>,
  );

  const averageScore =
    records.length === 0
      ? 0
      : Math.round(records.reduce((sum, record) => sum + record.coverageScore, 0) / records.length);

  const gapBrandCount = records.filter(
    (record) => record.targetType === "brand" && record.gapKinds.length > 0,
  ).length;

  const stubPathCount = findBrandRequirementEvidencePaths().length;

  const contextReady =
    records.length >= 8 &&
    (targetBreakdown.brand ?? 0) >= 3 &&
    (targetBreakdown.tender ?? 0) >= 3 &&
    (targetBreakdown.requirement ?? 0) >= 3 &&
    stubPathCount >= 3;

  return {
    contextId: "evidence-coverage-context-v39-p3",
    records,
    recordCount: records.length,
    levelBreakdown,
    targetBreakdown,
    averageScore,
    gapBrandCount,
    stubPathCount,
    contextReady,
    mode: "evidence-intelligence-network",
  };
}

export function validateEvidenceCoverageContext(): RegistryValidation {
  const context = buildEvidenceCoverageContext();
  const valid =
    context.contextReady &&
    context.averageScore > 0 &&
    context.stubPathCount >= 3;

  return {
    valid,
    count: context.recordCount,
    summary: `evidence-coverage-context records=${context.recordCount} avgScore=${context.averageScore} gapBrands=${context.gapBrandCount} stubPaths=${context.stubPathCount} valid=${valid}`,
  };
}
