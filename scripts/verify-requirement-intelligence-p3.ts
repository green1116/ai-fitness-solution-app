/**
 * V40 Requirement Intelligence — Phase 3 verification
 */
import {
  buildRequirementCompliance,
  buildRequirementComplianceContext,
  buildRequirementComplianceMatrix,
  findRequirementGaps,
  findSatisfiedRequirements,
  findUnsatisfiedRequirements,
  findRequirementComplianceById,
  findRequirementById,
  evaluateRequirementCompliance,
  REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_MATRIX_RECORDS,
  REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT,
  REQUIREMENT_COMPLIANCE_MIN_RECORDS,
  REQUIREMENT_INTELLIGENCE_P3_TAG,
  REQUIREMENT_INTELLIGENCE_VERSION,
  validateRequirementIntelligenceNetworkPhase3,
} from "../lib/requirement-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateRequirementIntelligenceNetworkPhase3();
assert(validation.valid, "phase3 validation");
assert(validation.phase2.valid, "phase2 regression");
assert(validation.phase2.phase1.valid, "phase1 regression");
assert(validation.requirementCompliance.valid, "requirement compliance");
assert(validation.requirementComplianceMatrix.valid, "compliance matrix");
assert(validation.requirementComplianceGap.valid, "gap analysis");
assert(validation.tenderCompliance.valid, "tender compliance");

const records = buildRequirementCompliance();
assert(records.length > REQUIREMENT_COMPLIANCE_MIN_RECORDS, "compliance records");
assert(new Set(records.map((r) => r.complianceId)).size === records.length, "compliance id unique");

const context = buildRequirementComplianceContext();
assert(context.contextReady, "compliance context ready");
assert(context.passCount > REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT, "pass count");
assert(context.partialCount > REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT, "partial count");
assert(context.failCount > REQUIREMENT_COMPLIANCE_MIN_FAIL_COUNT, "fail count");
assert(context.tenderComplianceReady, "tender compliance ready");
assert(context.gapAnalysisReady, "gap analysis ready");

const matrix = buildRequirementComplianceMatrix();
assert(matrix.cellCount > REQUIREMENT_COMPLIANCE_MIN_MATRIX_RECORDS, "matrix records");
assert(matrix.requirementEvidenceCells > 0, "requirement evidence matrix");
assert(matrix.requirementBrandCells > 0, "requirement brand matrix");
assert(matrix.requirementTenderCells > 0, "requirement tender matrix");

const gaps = findRequirementGaps();
assert(gaps.length >= records.length, "gap records");
assert(gaps.some((gap) => gap.missingEvidenceKinds.length > 0), "missing evidence kinds");
assert(gaps.some((gap) => gap.criticalBlockers.length > 0), "critical blockers");

const satisfied = findSatisfiedRequirements();
const unsatisfied = findUnsatisfiedRequirements();
assert(satisfied.length >= REQUIREMENT_COMPLIANCE_MIN_PASS_COUNT, "satisfied requirements");
assert(unsatisfied.length >= REQUIREMENT_COMPLIANCE_MIN_PARTIAL_COUNT, "unsatisfied requirements");

const sample = records.find((record) => record.complianceStatus === "pass") ?? records[0]!;
const sourceRecord = findRequirementById(sample.requirementId);
assert(Boolean(sourceRecord), "sample requirement record");
const evaluated = evaluateRequirementCompliance(sourceRecord!);
assert(evaluated.complianceId === sample.complianceId, "evaluateRequirementCompliance");
assert(Boolean(findRequirementComplianceById(sample.requirementId)), "find compliance by id");

const statuses = new Set(records.map((record) => record.complianceStatus));
assert(statuses.has("pass"), "has pass status");
assert(statuses.has("partial"), "has partial status");
assert(statuses.has("fail"), "has fail status");

console.log("✓ phase1/p2 regression");
console.log("✓ requirement compliance");
console.log(" ", validation.requirementCompliance.summary);
console.log("✓ compliance matrix");
console.log(" ", validation.requirementComplianceMatrix.summary);
console.log("✓ gap analysis");
console.log(" ", validation.requirementComplianceGap.summary);
console.log("✓ tender compliance");
console.log(" ", validation.tenderCompliance.summary);
console.log(
  " ",
  `pass=${context.passCount} partial=${context.partialCount} fail=${context.failCount} blocked=${context.blockedCount} avgScore=${context.averageComplianceScore}`,
);
console.log(
  " ",
  `version=${REQUIREMENT_INTELLIGENCE_VERSION} tag=${REQUIREMENT_INTELLIGENCE_P3_TAG}`,
);
console.log("Requirement Intelligence Phase 3 PASS");
