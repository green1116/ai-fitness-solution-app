/**
 * V40 Requirement Intelligence — Phase 1 verification
 */
import {
  buildRequirementRegistryContext,
  buildRequirementRegistryRecords,
  CANONICAL_REQUIREMENT_QUERY,
  executeRequirementQuery,
  findRequirementByBrand,
  findRequirementById,
  findRequirementByKind,
  findRequirementByTender,
  findTopRequirementRecords,
  HIGH_PRIORITY_REQUIREMENT_THRESHOLD,
  REQUIREMENT_INTELLIGENCE_P1_TAG,
  REQUIREMENT_INTELLIGENCE_VERSION,
  resolveRequirementId,
  resolveRequirementRef,
  TOP_REQUIREMENT_SCORE_THRESHOLD,
  validateRequirementIntelligenceNetworkPhase1,
} from "../lib/requirement-intelligence";
import { validateEvidenceIntelligenceNetworkFoundationFreeze } from "../lib/evidence-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateRequirementIntelligenceNetworkPhase1();
assert(validation.valid, "phase1 validation");
assert(validation.requirementRegistry.valid, "requirement registry");
assert(validation.requirementContext.valid, "requirement context");
assert(validation.engineCompatibility.valid, "engine compatibility");

const records = buildRequirementRegistryRecords();
assert(records.length >= 30, "registry count");
assert(new Set(records.map((r) => r.requirementId)).size === records.length, "requirementId unique");
assert(new Set(records.map((r) => r.requirementRef)).size === records.length, "requirementRef unique");

const sources = new Set(records.map((r) => r.source));
assert(sources.has("v39-evidence-stub"), "v39 stub source");
assert(sources.has("v28-requirement-profile"), "v28 profile source");
assert(sources.has("v34-requirement-anchor"), "v34 anchor source");
assert(sources.has("v36-tender-requirement"), "v36 tender source");

const canonical = executeRequirementQuery(CANONICAL_REQUIREMENT_QUERY);
assert(canonical.length >= 1, "canonical query");

const tenderReqs = findRequirementByTender("tender-sh-commercial-gym-2025-001");
assert(tenderReqs.length >= 1, "tender requirements");

const brandReqs = findRequirementByBrand("brand-life-fitness");
assert(brandReqs.length >= 1, "brand requirements");

const equipmentReqs = findRequirementByKind("equipment");
assert(equipmentReqs.length >= 1, "equipment kind");

const sample = records[0]!;
const byRef = resolveRequirementRef(sample.requirementRef);
const byId = resolveRequirementId(sample.requirementId);
assert(Boolean(byRef), "resolveRequirementRef");
assert(Boolean(byId), "resolveRequirementId");
assert(findRequirementById(sample.requirementId)?.requirementId === sample.requirementId, "findRequirementById");

const top = findTopRequirementRecords(5);
assert(top.length >= 3, "top requirements");
assert(top[0]!.score.totalRequirementScore >= TOP_REQUIREMENT_SCORE_THRESHOLD, "top threshold");

const highPriority = records.filter((r) => r.priority === "critical" || r.priority === "high");
assert(highPriority.some((r) => r.score.priorityAlignmentScore >= HIGH_PRIORITY_REQUIREMENT_THRESHOLD - 15), "high priority alignment");

const context = buildRequirementRegistryContext();
assert(context.contextReady, "requirement context ready");
assert(context.tenderCoverage >= 10, "tender coverage");

assert(validateEvidenceIntelligenceNetworkFoundationFreeze().valid, "v39 foundation unchanged");

console.log("✓ requirement registry");
console.log(" ", validation.requirementRegistry.summary);
console.log("✓ requirement context");
console.log(" ", validation.requirementContext.summary);
console.log("✓ engine compatibility");
console.log(" ", validation.engineCompatibility.summary);
console.log(
  " ",
  `version=${REQUIREMENT_INTELLIGENCE_VERSION} tag=${REQUIREMENT_INTELLIGENCE_P1_TAG}`,
);
console.log("Requirement Intelligence Phase 1 PASS");
