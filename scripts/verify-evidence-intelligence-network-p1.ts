/**
 * V39 Evidence Intelligence Network — Phase 1 verification
 */
import {
  buildEvidenceRegistryContext,
  buildEvidenceRegistryRecords,
  CANONICAL_EVIDENCE_QUERY,
  EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
  executeEvidenceQuery,
  findEvidenceByBrand,
  findEvidenceById,
  findEvidenceByKind,
  findTopEvidenceRecords,
  resolveEvidenceId,
  resolveEvidenceRef,
  TOP_EVIDENCE_SCORE_THRESHOLD,
  validateEvidenceIntelligenceNetworkPhase1,
} from "../lib/evidence-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "../lib/brand-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateEvidenceIntelligenceNetworkPhase1();
assert(validation.valid, "phase1 validation");
assert(validation.evidenceRegistry.valid, "evidence registry");
assert(validation.evidenceContext.valid, "evidence context");
assert(validation.engineCompatibility.valid, "engine compatibility");

const records = buildEvidenceRegistryRecords();
assert(records.length >= 30, "registry count");
assert(new Set(records.map((r) => r.evidenceId)).size === records.length, "evidenceId unique");
assert(new Set(records.map((r) => r.evidenceRef)).size === records.length, "evidenceRef unique");

const lfEvidence = findEvidenceByBrand("brand-life-fitness");
assert(lfEvidence.length >= 2, "active brand evidence count");

const canonical = executeEvidenceQuery(CANONICAL_EVIDENCE_QUERY);
assert(canonical.length >= 1, "canonical query");

const certEvidence = findEvidenceByKind("certificate");
assert(certEvidence.length >= 1, "findEvidenceByKind");

const sample = records[0]!;
const byRef = resolveEvidenceRef(sample.evidenceRef);
const byId = resolveEvidenceId(sample.evidenceId);
assert(Boolean(byRef), "resolveEvidenceRef");
assert(Boolean(byId), "resolveEvidenceId");
assert(findEvidenceById(sample.evidenceId)?.evidenceId === sample.evidenceId, "findEvidenceById");

const top = findTopEvidenceRecords(5);
assert(top.length >= 3, "top evidence");
assert(top[0]!.score.totalEvidenceScore >= TOP_EVIDENCE_SCORE_THRESHOLD, "top threshold");

const context = buildEvidenceRegistryContext();
assert(context.contextReady, "evidence context ready");
assert(context.brandCoverage >= 8, "brand coverage");

assert(validateBrandIntelligenceNetworkFoundation().valid, "brand network unchanged");

console.log("✓ evidence registry");
console.log(" ", validation.evidenceRegistry.summary);
console.log("✓ evidence context");
console.log(" ", validation.evidenceContext.summary);
console.log("✓ engine compatibility");
console.log(" ", validation.engineCompatibility.summary);
console.log(
  " ",
  `version=${EVIDENCE_INTELLIGENCE_NETWORK_VERSION} tag=${EVIDENCE_INTELLIGENCE_NETWORK_P1_TAG}`,
);
console.log("Evidence Intelligence Network Phase 1 PASS");
