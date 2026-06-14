/**
 * V39 Evidence Intelligence Network — Phase 3 verification
 */
import {
  buildBrandEvidenceCoverage,
  buildEnrichedRequirementStubRecords,
  buildEvidenceCoverageContext,
  buildEvidenceCoverageRecords,
  buildRequirementEvidenceEdges,
  buildRequirementStub,
  buildTenderEvidenceCoverage,
  COVERAGE_MIN_STUB_PATHS,
  EVIDENCE_INTELLIGENCE_NETWORK_P3_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
  findBrandRequirementEvidencePath,
  findBrandRequirementEvidencePaths,
  findEvidenceCoverageGaps,
  findRequirementEvidenceEdgesByRequirementId,
  validateEvidenceIntelligenceNetworkPhase1,
  validateEvidenceIntelligenceNetworkPhase2,
  validateEvidenceIntelligenceNetworkPhase3,
} from "../lib/evidence-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "../lib/brand-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase1 = validateEvidenceIntelligenceNetworkPhase1();
assert(phase1.valid, "phase1 regression");

const phase2 = validateEvidenceIntelligenceNetworkPhase2();
assert(phase2.valid, "phase2 regression");

const validation = validateEvidenceIntelligenceNetworkPhase3();
assert(validation.valid, "phase3 validation");
assert(validation.evidenceCoverage.valid, "evidence coverage registry");
assert(validation.requirementStub.valid, "requirement stub registry");

const records = buildEvidenceCoverageRecords();
assert(records.length >= 8, "coverage records");

const brandCoverage = buildBrandEvidenceCoverage("brand-life-fitness");
assert(brandCoverage.evidenceIds.length >= 1, "brand coverage evidence");
assert(brandCoverage.coverageScore >= 0 && brandCoverage.coverageScore <= 100, "brand coverage score");
assert(Object.keys(brandCoverage.kindBreakdown).length >= 1, "brand kind breakdown");

const stubs = buildEnrichedRequirementStubRecords();
assert(stubs.length >= 3, "requirement stubs");
const sampleStub = stubs.find((stub) => stub.stubReady)!;
assert(Boolean(sampleStub), "ready requirement stub");

const tenderCoverage = buildTenderEvidenceCoverage(sampleStub.tenderId);
assert(tenderCoverage.targetType === "tender", "tender coverage");
assert(tenderCoverage.evidenceIds.length >= 1, "tender coverage evidence");

const gaps = findEvidenceCoverageGaps("brand-life-fitness");
assert(Array.isArray(gaps), "coverage gaps");

const context = buildEvidenceCoverageContext();
assert(context.contextReady, "coverage context ready");
assert(context.stubPathCount >= COVERAGE_MIN_STUB_PATHS, "stub path count");

const paths = findBrandRequirementEvidencePaths();
assert(paths.length >= COVERAGE_MIN_STUB_PATHS, "brand evidence requirement paths");
assert(
  paths.every((path) => path.pathKind === "brand-evidence-requirement"),
  "path kind",
);

const path = findBrandRequirementEvidencePath(paths[0]!.brandId, paths[0]!.requirementId);
assert(Boolean(path), "findEvidencePath brand requirement");
assert(path!.nodeIds.length === 3, "path node count");
assert(path!.matchScore >= 50, "path match score");

const edges = buildRequirementEvidenceEdges();
assert(edges.length >= 3, "requirement evidence edges");
assert(edges.every((edge) => edge.matchScore >= 50), "edge match scores");

const reqEdges = findRequirementEvidenceEdgesByRequirementId(paths[0]!.requirementId);
assert(reqEdges.length >= 1, "requirement evidence edge lookup");

const builtStub = buildRequirementStub(paths[0]!.requirementId, sampleStub.tenderId);
assert(Boolean(builtStub), "buildRequirementStub");

assert(validateBrandIntelligenceNetworkFoundation().valid, "brand network unchanged");

console.log("✓ evidence coverage");
console.log(" ", validation.evidenceCoverage.summary);
console.log("✓ requirement stub");
console.log(" ", validation.requirementStub.summary);
console.log("✓ coverage context");
console.log(
  " ",
  `records=${context.recordCount} avgScore=${context.averageScore} stubPaths=${context.stubPathCount}`,
);
console.log(
  " ",
  `version=${EVIDENCE_INTELLIGENCE_NETWORK_VERSION} tag=${EVIDENCE_INTELLIGENCE_NETWORK_P3_TAG}`,
);
console.log("Evidence Intelligence Network Phase 3 PASS");
