import { buildEvidenceRegistryRecords } from "./evidence-registry";
import type { EvidenceRegistryContext, RegistryValidation } from "./shared/types";
import { EVIDENCE_KINDS } from "./shared/types";

export function buildEvidenceRegistryContext(): EvidenceRegistryContext {
  const records = buildEvidenceRegistryRecords();

  const kindBreakdown = records.reduce(
    (acc, record) => {
      acc[record.evidenceKind] = (acc[record.evidenceKind] ?? 0) + 1;
      return acc;
    },
    {} as EvidenceRegistryContext["kindBreakdown"],
  );

  const brandIds = new Set(records.map((record) => record.brandId));
  const averageScore =
    records.length === 0
      ? 0
      : Math.round(
          records.reduce((sum, record) => sum + record.score.totalEvidenceScore, 0) /
            records.length,
        );

  return {
    contextId: "evidence-registry-context-v39-p1",
    records,
    recordCount: records.length,
    kindBreakdown,
    brandCoverage: brandIds.size,
    averageScore,
    contextReady: records.length >= 30 && brandIds.size >= 8,
    mode: "evidence-intelligence-network",
  };
}

export function validateEvidenceContext(): RegistryValidation {
  const context = buildEvidenceRegistryContext();
  const kindCount = EVIDENCE_KINDS.filter(
    (kind) => (context.kindBreakdown[kind] ?? 0) > 0,
  ).length;

  const valid =
    context.contextReady &&
    context.averageScore > 0 &&
    context.brandCoverage >= 8 &&
    kindCount >= 5;

  return {
    valid,
    count: context.recordCount,
    summary: `evidence-context count=${context.recordCount} brands=${context.brandCoverage} kinds=${kindCount}/6 averageScore=${context.averageScore} valid=${valid}`,
  };
}
