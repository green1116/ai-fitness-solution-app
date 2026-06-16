import type {
  RequirementComplianceContext,
  RequirementComplianceValidation,
  RequirementGap,
} from "../shared/types";
import {
  REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_RECORDS,
} from "../shared/types";
import { buildRequirementComplianceMatrix } from "./compliance-matrix";
import {
  buildRequirementComplianceRecords,
  findSatisfiedRequirements,
  findUnsatisfiedRequirements,
  findRequirementGaps,
} from "./compliance-registry";

const CANONICAL_TENDER_ID = "tender-sh-commercial-gym-2025-001";

export function buildRequirementComplianceContext(): RequirementComplianceContext {
  const records = buildRequirementComplianceRecords();
  const passCount = records.filter((record) => record.complianceStatus === "pass").length;
  const partialCount = records.filter((record) => record.complianceStatus === "partial").length;
  const failCount = records.filter((record) => record.complianceStatus === "fail").length;
  const blockedCount = records.filter((record) => record.complianceStatus === "blocked").length;
  const averageComplianceScore =
    records.length === 0
      ? 0
      : Math.round(
          records.reduce((sum, record) => sum + record.complianceScore, 0) / records.length,
        );

  const tenderRecords = records.filter((record) => record.tenderId === CANONICAL_TENDER_ID);
  const tenderComplianceReady =
    tenderRecords.length >= 1 &&
    tenderRecords.some(
      (record) =>
        record.complianceStatus === "pass" || record.complianceStatus === "partial",
    );

  const gaps = findRequirementGaps();
  const gapAnalysisReady =
    gaps.length >= REQUIREMENT_COMPLIANCE_MIN_RECORDS &&
    gaps.some((gap) => gap.missingEvidenceKinds.length > 0) &&
    gaps.some((gap) => gap.missingBrandLinks.length > 0);

  const contextReady =
    records.length > REQUIREMENT_COMPLIANCE_MIN_RECORDS &&
    passCount > REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT &&
    partialCount > REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT &&
    failCount > REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT &&
    tenderComplianceReady &&
    gapAnalysisReady;

  return {
    contextId: "requirement-compliance-context-v40-p3",
    records,
    recordCount: records.length,
    passCount,
    partialCount,
    failCount,
    blockedCount,
    averageComplianceScore,
    tenderComplianceReady,
    gapAnalysisReady,
    contextReady,
    mode: "requirement-intelligence",
  };
}

export function validateRequirementComplianceGap(): RequirementComplianceValidation {
  const gaps = findRequirementGaps();
  const hasMissingKinds = gaps.some((gap) => gap.missingEvidenceKinds.length > 0);
  const hasBrandGaps = gaps.some((gap) => gap.missingBrandLinks.length > 0);
  const hasExpired = gaps.some((gap) => gap.expiredEvidence.length > 0);
  const hasLowReadiness = gaps.some((gap) => gap.lowReadinessEvidence.length > 0);
  const hasBlockers = gaps.some((gap) => gap.criticalBlockers.length > 0);

  const valid =
    gaps.length >= REQUIREMENT_COMPLIANCE_MIN_RECORDS &&
    hasMissingKinds &&
    hasBrandGaps;

  return {
    valid,
    count: gaps.length,
    summary: `requirement-gap gaps=${gaps.length} missingKinds=${hasMissingKinds} brandGaps=${hasBrandGaps} expired=${hasExpired} lowReadiness=${hasLowReadiness} blockers=${hasBlockers} valid=${valid}`,
  };
}

export function validateTenderCompliance(): RequirementComplianceValidation {
  const records = buildRequirementComplianceRecords().filter(
    (record) => record.tenderId === CANONICAL_TENDER_ID,
  );
  const passCount = records.filter((record) => record.complianceStatus === "pass").length;
  const partialCount = records.filter((record) => record.complianceStatus === "partial").length;

  const valid = records.length >= 1 && passCount + partialCount >= 1;

  return {
    valid,
    count: records.length,
    summary: `tender-compliance tender=${CANONICAL_TENDER_ID} records=${records.length} pass=${passCount} partial=${partialCount} valid=${valid}`,
  };
}

export function validateRequirementComplianceMatrix(): RequirementComplianceValidation {
  const matrix = buildRequirementComplianceMatrix();
  const valid =
    matrix.matrixReady &&
    matrix.requirementEvidenceCells > 0 &&
    matrix.requirementBrandCells > 0 &&
    matrix.requirementTenderCells > 0;

  return {
    valid,
    count: matrix.cellCount,
    summary: `requirement-matrix cells=${matrix.cellCount} evidence=${matrix.requirementEvidenceCells} brand=${matrix.requirementBrandCells} tender=${matrix.requirementTenderCells} valid=${valid}`,
  };
}

export function validateRequirementCompliance(): RequirementComplianceValidation {
  const context = buildRequirementComplianceContext();
  const satisfied = findSatisfiedRequirements();
  const unsatisfied = findUnsatisfiedRequirements();

  const valid =
    context.recordCount > REQUIREMENT_COMPLIANCE_MIN_RECORDS &&
    context.passCount > REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT &&
    context.partialCount > REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT &&
    context.failCount > REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT &&
    context.contextReady &&
    satisfied.length >= REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT &&
    unsatisfied.length >= REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT;

  return {
    valid,
    count: context.recordCount,
    summary: `requirement-compliance records=${context.recordCount} pass=${context.passCount} partial=${context.partialCount} fail=${context.failCount} blocked=${context.blockedCount} avgScore=${context.averageComplianceScore} valid=${valid}`,
  };
}

export { findRequirementGaps };
export type { RequirementGap };