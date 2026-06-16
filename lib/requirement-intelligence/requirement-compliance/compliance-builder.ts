import {
  buildBrandEvidenceCoverage,
  findEvidenceById,
  findEvidenceReadinessByBrand,
  isEvidenceExpired,
} from "@/lib/evidence-intelligence-network";
import type { EvidenceRecord } from "@/lib/evidence-intelligence-network/shared/types";
import { resolveEvidenceIdsForRequirement } from "../requirement-graph/requirement-evidence-edge";
import type {
  RequirementComplianceFactors,
  RequirementComplianceRecord,
  RequirementComplianceStatus,
  RequirementRecord,
} from "../shared/types";
import {
  REQUIREMENT_COMPLIANCE_PARTIAL_THRESHOLD,
  REQUIREMENT_COMPLIANCE_PASS_THRESHOLD,
} from "../shared/types";
import { buildRequirementGap, resolveExpectedEvidenceKinds } from "./compliance-gap";

const PRIORITY_SCORES = {
  critical: 95,
  high: 80,
  medium: 65,
  low: 50,
} as const;

function resolveEvidenceRecords(record: RequirementRecord): EvidenceRecord[] {
  return resolveEvidenceIdsForRequirement(record)
    .map((evidenceId) => findEvidenceById(evidenceId))
    .filter((item): item is EvidenceRecord => Boolean(item));
}

function computeEvidenceCoverage(
  record: RequirementRecord,
  evidenceRecords: EvidenceRecord[],
): number {
  if (evidenceRecords.length === 0) return Math.round(record.coverageScore * 0.4);

  const expectedKinds = resolveExpectedEvidenceKinds(record);
  const activeKinds = new Set(
    evidenceRecords.filter((item) => !isEvidenceExpired(item)).map((item) => item.evidenceKind),
  );
  const kindCoverage = expectedKinds.length
    ? (expectedKinds.filter((kind) => activeKinds.has(kind)).length / expectedKinds.length) * 100
    : 0;

  const countScore = Math.min(40, evidenceRecords.length * 8);
  const registryCoverage = record.brandId
    ? buildBrandEvidenceCoverage(record.brandId).coverageScore
    : record.coverageScore;

  return Math.min(100, Math.round(kindCoverage * 0.45 + countScore + registryCoverage * 0.15));
}

function computeEvidenceReadiness(
  record: RequirementRecord,
  evidenceRecords: EvidenceRecord[],
): number {
  if (record.brandId) {
    return findEvidenceReadinessByBrand(record.brandId)?.score.totalReadinessScore ?? 0;
  }

  if (evidenceRecords.length === 0) return 0;

  return Math.round(
    evidenceRecords.reduce((sum, item) => sum + item.score.totalEvidenceScore, 0) /
      evidenceRecords.length,
  );
}

function computeBrandAlignment(record: RequirementRecord, evidenceRecords: EvidenceRecord[]): number {
  if (!record.brandId) return evidenceRecords.length > 0 ? 45 : 0;

  const brandEvidence = evidenceRecords.filter((item) => item.brandId === record.brandId);
  let score = 55;
  if (brandEvidence.length > 0) score += 20;
  if (brandEvidence.some((item) => item.requirementLinkIds.length > 0)) score += 10;
  if (record.matchScore >= 70) score += 15;

  return Math.min(100, score);
}

function computeFreshness(evidenceRecords: EvidenceRecord[]): number {
  if (evidenceRecords.length === 0) return 0;
  const activeCount = evidenceRecords.filter((item) => !isEvidenceExpired(item)).length;
  return Math.round((activeCount / evidenceRecords.length) * 100);
}

function computeComplianceFactors(
  record: RequirementRecord,
  evidenceRecords: EvidenceRecord[],
): RequirementComplianceFactors {
  return {
    evidenceCoverage: computeEvidenceCoverage(record, evidenceRecords),
    evidenceReadiness: computeEvidenceReadiness(record, evidenceRecords),
    brandAlignment: computeBrandAlignment(record, evidenceRecords),
    requirementPriority: PRIORITY_SCORES[record.priority],
    freshness: computeFreshness(evidenceRecords),
    confidence: Math.round(record.confidenceScore),
  };
}

function computeComplianceScore(factors: RequirementComplianceFactors): number {
  return Math.min(
    100,
    Math.round(
      factors.evidenceCoverage * 0.25 +
        factors.evidenceReadiness * 0.25 +
        factors.brandAlignment * 0.15 +
        factors.freshness * 0.15 +
        factors.confidence * 0.1 +
        factors.requirementPriority * 0.1,
    ),
  );
}

function resolveComplianceStatus(input: {
  record: RequirementRecord;
  complianceScore: number;
  evidenceRecords: EvidenceRecord[];
  gap: ReturnType<typeof buildRequirementGap>;
}): RequirementComplianceStatus {
  const { record, complianceScore, evidenceRecords, gap } = input;

  if (gap.criticalBlockers.length > 0) return "blocked";

  if (
    complianceScore >= REQUIREMENT_COMPLIANCE_PASS_THRESHOLD &&
    evidenceRecords.length > 0
  ) {
    return "pass";
  }

  if (evidenceRecords.length > 0) {
    return "partial";
  }

  if (record.mandatoryLevel === "mandatory" || record.mandatoryLevel === "recommended") {
    return "partial";
  }

  if (record.requirementStatus === "archived") return "fail";
  if (record.mandatoryLevel === "optional" && record.priority === "low") return "fail";

  return complianceScore >= REQUIREMENT_COMPLIANCE_PARTIAL_THRESHOLD ? "partial" : "fail";
}

function buildRiskSummary(
  status: RequirementComplianceStatus,
  gap: ReturnType<typeof buildRequirementGap>,
  complianceScore: number,
): string {
  if (status === "pass") {
    return `requirement satisfied complianceScore=${complianceScore}`;
  }
  if (status === "blocked") {
    return `blocked by ${gap.criticalBlockers.join(", ") || "missing critical evidence"}`;
  }
  if (status === "partial") {
    const missing = [
      gap.missingEvidenceKinds.length > 0
        ? `missingKinds=${gap.missingEvidenceKinds.join("|")}`
        : undefined,
      gap.missingBrandLinks.length > 0 ? "missingBrandLink" : undefined,
      gap.lowReadinessEvidence.length > 0 ? `lowReadiness=${gap.lowReadinessEvidence.length}` : undefined,
    ]
      .filter(Boolean)
      .join(" ");
    return `partial compliance gapScore=${gap.gapScore} ${missing}`.trim();
  }
  return `fail complianceScore=${complianceScore} gapScore=${gap.gapScore}`;
}

export function evaluateRequirementCompliance(
  record: RequirementRecord,
): RequirementComplianceRecord {
  const evidenceRecords = resolveEvidenceRecords(record);
  const evidenceReadinessScore = computeEvidenceReadiness(record, evidenceRecords);
  const factors = computeComplianceFactors(record, evidenceRecords);
  const complianceScore = computeComplianceScore(factors);
  const gap = buildRequirementGap(record, evidenceRecords, evidenceReadinessScore);
  const complianceStatus = resolveComplianceStatus({
    record,
    complianceScore,
    evidenceRecords,
    gap,
  });

  return {
    complianceId: `req-compliance-${record.requirementId}`,
    requirementId: record.requirementId,
    requirementRef: record.requirementRef,
    tenderId: record.tenderId,
    brandId: record.brandId,
    complianceStatus,
    complianceScore,
    factors,
    linkedEvidenceIds: evidenceRecords.map((item) => item.evidenceId),
    gap,
    riskSummary: buildRiskSummary(complianceStatus, gap, complianceScore),
    satisfied: complianceStatus === "pass",
    mode: "requirement-intelligence",
  };
}
