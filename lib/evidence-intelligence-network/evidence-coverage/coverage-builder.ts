import type {
  EvidenceCoverageLevel,
  EvidenceCoverageRecord,
  EvidenceKind,
  EvidenceRecord,
} from "../shared/types";
import { EVIDENCE_KINDS, TENDER_COVERAGE_KIND_THRESHOLD } from "../shared/types";

const BRAND_EQUIPMENT_KINDS: EvidenceKind[] = ["certificate", "datasheet", "authorization"];
const BRAND_CASE_KINDS: EvidenceKind[] = ["case-study", "project-reference"];

export function isEvidenceExpired(record: EvidenceRecord): boolean {
  if (record.evidenceStatus === "expired") return true;
  if (!record.validUntil) return false;
  const expiry = new Date(record.validUntil).getTime();
  return !Number.isNaN(expiry) && expiry < Date.now();
}

export function buildKindBreakdown(
  evidence: EvidenceRecord[],
): Partial<Record<EvidenceKind, number>> {
  const breakdown: Partial<Record<EvidenceKind, number>> = {};

  for (const record of evidence) {
    breakdown[record.evidenceKind] = (breakdown[record.evidenceKind] ?? 0) + 1;
  }

  return breakdown;
}

export function computeActiveKinds(evidence: EvidenceRecord[]): Set<EvidenceKind> {
  const kinds = new Set<EvidenceKind>();
  for (const record of evidence) {
    if (!isEvidenceExpired(record)) {
      kinds.add(record.evidenceKind);
    }
  }
  return kinds;
}

export function computeBrandGapKinds(activeKinds: Set<EvidenceKind>): EvidenceKind[] {
  const gaps: EvidenceKind[] = [];

  const hasEquipment = BRAND_EQUIPMENT_KINDS.some((kind) => activeKinds.has(kind));
  const hasCase = BRAND_CASE_KINDS.some((kind) => activeKinds.has(kind));

  if (!hasEquipment) {
    gaps.push(...BRAND_EQUIPMENT_KINDS.filter((kind) => !activeKinds.has(kind)));
  }
  if (!hasCase) {
    gaps.push(...BRAND_CASE_KINDS.filter((kind) => !activeKinds.has(kind)));
  }

  return [...new Set(gaps)];
}

export function computeCoverageScore(input: {
  evidence: EvidenceRecord[];
  activeKinds: Set<EvidenceKind>;
  gapKinds: EvidenceKind[];
  expiredCount: number;
}): number {
  const { evidence, activeKinds, gapKinds, expiredCount } = input;
  if (evidence.length === 0) return 0;

  let score = 0;

  const hasEquipment = BRAND_EQUIPMENT_KINDS.some((kind) => activeKinds.has(kind));
  const hasCase = BRAND_CASE_KINDS.some((kind) => activeKinds.has(kind));
  if (hasEquipment) score += 35;
  if (hasCase) score += 25;

  score += Math.round((activeKinds.size / EVIDENCE_KINDS.length) * 30);

  const averageEvidenceScore =
    evidence.reduce((sum, record) => sum + record.score.totalEvidenceScore, 0) / evidence.length;
  score += Math.round(averageEvidenceScore * 0.1);

  score -= gapKinds.length * 5;
  score -= Math.round((expiredCount / Math.max(1, evidence.length)) * 20);

  return Math.max(0, Math.min(100, score));
}

export function resolveCoverageLevel(input: {
  coverageScore: number;
  evidenceCount: number;
  expiredCount: number;
  gapKinds: EvidenceKind[];
  activeKinds: Set<EvidenceKind>;
}): EvidenceCoverageLevel {
  const { coverageScore, evidenceCount, expiredCount, gapKinds, activeKinds } = input;

  if (evidenceCount === 0) return "none";

  const expiredRatio = expiredCount / evidenceCount;
  if (expiredRatio >= 0.75) return "expired";

  const hasEquipment = BRAND_EQUIPMENT_KINDS.some((kind) => activeKinds.has(kind));
  const hasCase = BRAND_CASE_KINDS.some((kind) => activeKinds.has(kind));
  const ruleGaps =
    (!hasEquipment ? 1 : 0) + (!hasCase ? 1 : 0);

  if (coverageScore >= 85 && gapKinds.length === 0 && ruleGaps === 0) return "full";
  if (expiredRatio >= 0.5 && coverageScore < 50) return "expired";
  if (coverageScore >= 50) return "partial";
  if (coverageScore >= 20) return "minimal";
  return "none";
}

export function buildCoverageRecordBase(input: {
  coverageId: string;
  targetType: EvidenceCoverageRecord["targetType"];
  targetId: string;
  evidence: EvidenceRecord[];
  brandId?: string;
  tenderId?: string;
  proposalId?: string;
  requirementId?: string;
}): EvidenceCoverageRecord {
  const kindBreakdown = buildKindBreakdown(input.evidence);
  const activeKinds = computeActiveKinds(input.evidence);
  const expiredCount = input.evidence.filter(isEvidenceExpired).length;
  const gapKinds = computeBrandGapKinds(activeKinds);
  const coverageScore = computeCoverageScore({
    evidence: input.evidence,
    activeKinds,
    gapKinds,
    expiredCount,
  });
  const coverageLevel = resolveCoverageLevel({
    coverageScore,
    evidenceCount: input.evidence.length,
    expiredCount,
    gapKinds,
    activeKinds,
  });

  return {
    coverageId: input.coverageId,
    targetType: input.targetType,
    targetId: input.targetId,
    brandId: input.brandId,
    tenderId: input.tenderId,
    proposalId: input.proposalId,
    requirementId: input.requirementId,
    evidenceIds: input.evidence.map((record) => record.evidenceId),
    coverageLevel,
    coverageScore,
    kindBreakdown,
    gapKinds,
    expiredCount,
    coverageReady: coverageLevel === "full" || coverageLevel === "partial",
    mode: "evidence-intelligence-network",
  };
}

export function computeTenderKindCoverageScore(
  brandIds: string[],
  evidenceByBrand: Map<string, EvidenceRecord[]>,
): { coverageScore: number; gapKinds: EvidenceKind[]; evidenceIds: string[] } {
  const expectedKinds = new Set<EvidenceKind>();
  const coveredKinds = new Set<EvidenceKind>();
  const evidenceIds: string[] = [];

  for (const brandId of brandIds) {
    const evidence = evidenceByBrand.get(brandId) ?? [];
    for (const record of evidence) {
      expectedKinds.add(record.evidenceKind);
      evidenceIds.push(record.evidenceId);
      if (!isEvidenceExpired(record)) {
        coveredKinds.add(record.evidenceKind);
      }
    }
  }

  const denominator = Math.max(1, expectedKinds.size);
  const coverageScore = Math.round((coveredKinds.size / denominator) * 100);
  const gapKinds = [...expectedKinds].filter((kind) => !coveredKinds.has(kind));

  return { coverageScore, gapKinds, evidenceIds };
}

export function resolveTenderCoverageLevel(coverageScore: number): EvidenceCoverageLevel {
  if (coverageScore >= 85) return "full";
  if (coverageScore >= TENDER_COVERAGE_KIND_THRESHOLD) return "partial";
  if (coverageScore >= 20) return "minimal";
  if (coverageScore > 0) return "minimal";
  return "none";
}

export { BRAND_EQUIPMENT_KINDS, BRAND_CASE_KINDS };
