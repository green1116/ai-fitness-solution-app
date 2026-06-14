/**
 * V39 Evidence Intelligence Network — Phase 4 verification
 */
import {
  buildEnrichedRequirementStubRecords,
  buildEvidenceReadinessContext,
  EVIDENCE_INTELLIGENCE_NETWORK_FOUNDATION_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_P4_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
  findBrandRequirementEvidencePaths,
  findEvidence,
  findEvidenceByReadiness,
  findEvidenceQueryByBrand,
  findTopEvidence,
  findVerifiedEvidence,
  matchEvidenceToBrand,
  matchEvidenceToRequirement,
  matchEvidenceToTender,
  READINESS_MIN_SCORE,
  validateEvidenceIntelligenceNetworkFoundationFreeze,
  validateEvidenceIntelligenceNetworkPhase1,
  validateEvidenceIntelligenceNetworkPhase2,
  validateEvidenceIntelligenceNetworkPhase3,
  validateEvidenceIntelligenceNetworkPhase4,
} from "../lib/evidence-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "../lib/brand-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase1 = validateEvidenceIntelligenceNetworkPhase1();
assert(phase1.valid, "phase1 regression");

const phase2 = validateEvidenceIntelligenceNetworkPhase2();
assert(phase2.valid, "phase2 regression");

const phase3 = validateEvidenceIntelligenceNetworkPhase3();
assert(phase3.valid, "phase3 regression");

const validation = validateEvidenceIntelligenceNetworkPhase4();
assert(validation.valid, "phase4 validation");
assert(validation.evidenceReadiness.valid, "evidence readiness");
assert(validation.evidenceQuery.valid, "evidence query");
assert(validation.evidenceMatcher.valid, "evidence matcher");

const foundation = validateEvidenceIntelligenceNetworkFoundationFreeze();
assert(foundation.valid, "foundation freeze");
assert(foundation.registry.valid, "registry freeze");
assert(foundation.graph.valid, "graph freeze");
assert(foundation.coverage.valid, "coverage freeze");
assert(foundation.requirementStub.valid, "requirement stub freeze");
assert(foundation.compatibility.valid, "compatibility freeze");

const readiness = buildEvidenceReadinessContext();
assert(readiness.contextReady, "readiness context ready");
assert(readiness.readyCount >= 1, "readiness ready count");

const canonicalReadiness = readiness.results.find((r) => r.brandId === "brand-life-fitness")!;
assert(canonicalReadiness.readinessReady, "canonical readiness ready");
assert(canonicalReadiness.criticalBlockers.length === 0, "canonical critical blockers");
assert(canonicalReadiness.score.totalReadinessScore >= READINESS_MIN_SCORE, "readiness threshold");

const verified = findVerifiedEvidence(5);
assert(verified.queryReady && verified.hitCount >= 1, "verified evidence query");

const top = findTopEvidence(5);
assert(top.queryReady && top.hitCount >= 3, "top evidence query");

const byBrand = findEvidenceQueryByBrand("brand-life-fitness");
assert(byBrand.queryReady && byBrand.hitCount >= 1, "brand evidence query");

const byReadiness = findEvidenceByReadiness(READINESS_MIN_SCORE, 10);
assert(byReadiness.hitCount >= 1, "readiness evidence query");

const canonical = findEvidence({ brandId: "brand-life-fitness", evidenceKind: "certificate", limit: 5 });
assert(canonical.queryReady, "canonical evidence query");

const brandMatch = matchEvidenceToBrand("brand-life-fitness");
assert(brandMatch.matchReady, "match evidence to brand");

const paths = findBrandRequirementEvidencePaths(1);
assert(paths.length >= 1, "brand evidence requirement paths");

const requirementMatch = matchEvidenceToRequirement(paths[0]!.requirementId);
assert(Boolean(requirementMatch?.matchReady), "match evidence to requirement");
assert((requirementMatch?.matchedEvidenceIds.length ?? 0) >= 1, "requirement matched evidence");

const readyStub = buildEnrichedRequirementStubRecords().find((stub) => stub.stubReady)!;
const tenderMatch = matchEvidenceToTender(readyStub.tenderId);
assert(Boolean(tenderMatch?.matchReady), "match evidence to tender");

assert(validateBrandIntelligenceNetworkFoundation().valid, "brand network unchanged");

console.log("✓ evidence readiness");
console.log(" ", validation.evidenceReadiness.summary);
console.log("✓ evidence query");
console.log(" ", validation.evidenceQuery.summary);
console.log("✓ evidence matcher");
console.log(" ", validation.evidenceMatcher.summary);
console.log("✓ foundation freeze");
console.log(
  " ",
  `registry=${foundation.registry.valid} graph=${foundation.graph.valid} coverage=${foundation.coverage.valid} stub=${foundation.requirementStub.valid}`,
);
console.log(
  " ",
  `version=${EVIDENCE_INTELLIGENCE_NETWORK_VERSION} tag=${EVIDENCE_INTELLIGENCE_NETWORK_P4_TAG}`,
);
console.log(" ", `foundationTag=${EVIDENCE_INTELLIGENCE_NETWORK_FOUNDATION_TAG}`);
console.log("Evidence Intelligence Network Phase 4 PASS");
