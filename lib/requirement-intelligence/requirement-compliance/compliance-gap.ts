import {
  findEvidenceById,
  isEvidenceExpired,
  READINESS_MIN_SCORE,
} from "@/lib/evidence-intelligence-network";
import type { EvidenceKind, EvidenceRecord } from "@/lib/evidence-intelligence-network/shared/types";
import type { RequirementRecord, RequirementGap } from "../shared/types";
import { resolveEvidenceIdsForRequirement } from "../requirement-graph/requirement-evidence-edge";

const EXPECTED_KINDS_BY_REQUIREMENT_KIND: Record<string, EvidenceKind[]> = {
  equipment: ["certificate", "datasheet", "test-report"],
  compliance: ["certificate", "authorization"],
  authorization: ["authorization", "certificate"],
  reference: ["case-study", "project-reference"],
  commercial: ["authorization", "case-study"],
  service: ["case-study", "datasheet"],
  installation: ["datasheet", "certificate"],
  maintenance: ["datasheet", "case-study"],
};

export function resolveExpectedEvidenceKinds(record: RequirementRecord): EvidenceKind[] {
  return EXPECTED_KINDS_BY_REQUIREMENT_KIND[record.requirementKind] ?? [
    "certificate",
    "datasheet",
  ];
}

export function buildRequirementGap(
  record: RequirementRecord,
  evidenceRecords: EvidenceRecord[],
  evidenceReadinessScore: number,
): RequirementGap {
  const linkedEvidenceIds = resolveEvidenceIdsForRequirement(record);
  const expectedKinds = resolveExpectedEvidenceKinds(record);
  const activeKinds = new Set(
    evidenceRecords.filter((item) => !isEvidenceExpired(item)).map((item) => item.evidenceKind),
  );
  const missingEvidenceKinds = expectedKinds.filter((kind) => !activeKinds.has(kind));

  const missingBrandLinks: string[] = [];
  if (!record.brandId) {
    missingBrandLinks.push("brand-link-missing");
  }

  const expiredEvidence = evidenceRecords
    .filter((item) => isEvidenceExpired(item))
    .map((item) => item.evidenceId);

  const lowReadinessEvidence = evidenceRecords
    .filter((item) => item.score.totalEvidenceScore < READINESS_MIN_SCORE)
    .map((item) => item.evidenceId);

  const criticalBlockers: string[] = [];
  if (
    linkedEvidenceIds.length === 0 &&
    record.mandatoryLevel === "mandatory" &&
    record.priority === "critical"
  ) {
    criticalBlockers.push("mandatory-requirement-no-evidence");
  }
  if (
    linkedEvidenceIds.length === 0 &&
    record.mandatoryLevel === "mandatory" &&
    record.requirementKind === "compliance"
  ) {
    criticalBlockers.push("mandatory-compliance-no-evidence");
  }
  if (
    record.priority === "critical" &&
    missingEvidenceKinds.length >= 2 &&
    linkedEvidenceIds.length > 0
  ) {
    criticalBlockers.push("critical-requirement-missing-key-evidence-kinds");
  }
  if (
    record.brandId &&
    evidenceReadinessScore < READINESS_MIN_SCORE &&
    record.priority === "critical"
  ) {
    criticalBlockers.push("brand-evidence-readiness-below-threshold");
  }
  if (
    expiredEvidence.length > 0 &&
    record.mandatoryLevel === "mandatory" &&
    expiredEvidence.length === evidenceRecords.length &&
    evidenceRecords.length > 0
  ) {
    criticalBlockers.push("mandatory-requirement-expired-evidence");
  }

  const gapScore = Math.min(
    100,
    missingEvidenceKinds.length * 12 +
      missingBrandLinks.length * 15 +
      expiredEvidence.length * 8 +
      lowReadinessEvidence.length * 6 +
      criticalBlockers.length * 20,
  );

  return {
    gapId: `req-compliance-gap-${record.requirementId}`,
    requirementId: record.requirementId,
    missingEvidenceKinds,
    missingBrandLinks,
    expiredEvidence,
    lowReadinessEvidence,
    criticalBlockers,
    gapScore,
    mode: "requirement-intelligence",
  };
}
