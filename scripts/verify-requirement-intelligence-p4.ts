/**
 * V40 Requirement Intelligence — Phase 4 verification (full freeze)
 *
 * Diagnose import hang: if "[P4] script start" never prints, comment heavy imports
 * from "../lib/requirement-intelligence" and suspect:
 *   - requirement-foundation/foundation-context
 *   - requirement-readiness
 *   - requirement-matcher
 */
import {
  buildRequirementFoundationContext,
  REQUIREMENT_INTELLIGENCE_P4_TAG,
  REQUIREMENT_INTELLIGENCE_TAG,
  REQUIREMENT_INTELLIGENCE_VERSION,
  REQUIREMENT_READINESS_MIN_BLOCKED_COUNT,
  REQUIREMENT_READINESS_MIN_PARTIAL_COUNT,
  REQUIREMENT_READINESS_MIN_READY_COUNT,
  REQUIREMENT_READINESS_MIN_SCORE,
  validateRequirementIntelligenceNetworkFoundationFreezeFromContext,
  validateRequirementIntelligenceNetworkPhase4FromContext,
} from "../lib/requirement-intelligence";

console.log("[P4] script start");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

// Step 1: build contexts once (registry/graph/compliance/readiness/matcher/query canonical)
console.log("[P4] before buildRequirementFoundationContext");
const foundation = buildRequirementFoundationContext({
  includePhaseRegression: true,
  includeEvidenceNetwork: true,
});
console.log("[P4] after buildRequirementFoundationContext");

// Step 2: readiness checks
console.log("[P4] before readiness");
assert(foundation.readiness.contextReady, "readiness context ready");
assert(
  foundation.readiness.readyCount > REQUIREMENT_READINESS_MIN_READY_COUNT,
  "ready count",
);
assert(
  foundation.readiness.partialCount > REQUIREMENT_READINESS_MIN_PARTIAL_COUNT,
  "partial count",
);
assert(
  foundation.readiness.blockedCount > REQUIREMENT_READINESS_MIN_BLOCKED_COUNT,
  "blocked count",
);
assert(Boolean(foundation.canonical.readiness), "canonical readiness");
assert(foundation.canonical.readiness!.criticalBlockers.length === 0, "canonical blockers");
assert(
  foundation.canonical.readiness!.score.totalRequirementReadiness >=
    REQUIREMENT_READINESS_MIN_SCORE,
  "readiness threshold",
);
console.log("[P4] after readiness");

// Step 3: matcher checks
console.log("[P4] before matcher");
assert(foundation.matcher.contextReady, "matcher context ready");
assert(Boolean(foundation.matcher.evidenceMatch?.matchReady), "matcher evidence");
assert(Boolean(foundation.matcher.brandMatch?.matchReady), "matcher brand");
assert(Boolean(foundation.matcher.tenderMatch?.matchReady), "matcher tender");
assert(Boolean(foundation.matcher.proposalMatch?.matchReady), "matcher proposal");
assert((foundation.matcher.evidenceMatch?.matchedIds.length ?? 0) >= 1, "matcher evidence ids");
console.log("[P4] after matcher");

// Step 4: query checks
console.log("[P4] before query");
assert(foundation.query.canonical.length >= 1, "query canonical hit");
assert(foundation.query.satisfied.length >= REQUIREMENT_READINESS_MIN_READY_COUNT, "query satisfied");
assert(foundation.query.blocked.length >= 1, "query blocked");
assert(foundation.query.critical.length >= 1, "query critical");
assert(foundation.query.byKind.length >= 1, "query by kind");
assert(foundation.query.byPriority.length >= 1, "query by priority");
assert(foundation.query.top.length >= 3, "query top");
console.log("[P4] after query");

// Step 5: freeze assertions (composed from cached validations, no nested phase chains)
console.log("[P4] before freeze");
const validation = validateRequirementIntelligenceNetworkPhase4FromContext(foundation);
assert(validation.valid, "phase4 validation");
assert(foundation.regression.phase3Valid, "phase3 regression");
assert(foundation.regression.phase2Valid, "phase2 regression");
assert(foundation.regression.phase1Valid, "phase1 regression");
assert(validation.requirementReadiness.valid, "requirement readiness");
assert(validation.requirementQuery.valid, "requirement query");
assert(validation.requirementMatcher.valid, "requirement matcher");

const freeze = validateRequirementIntelligenceNetworkFoundationFreezeFromContext(foundation);
assert(freeze.valid, "foundation freeze");
assert(freeze.requirementRegistry.valid, "registry freeze");
assert(freeze.requirementGraph.valid, "graph freeze");
assert(freeze.requirementCompliance.valid, "compliance freeze");
assert(freeze.engineCompatibility.valid, "compatibility freeze");
console.log("[P4] after freeze");

console.log("✓ requirement readiness");
console.log(" ", validation.requirementReadiness.summary);
console.log("✓ requirement query");
console.log(" ", validation.requirementQuery.summary);
console.log("✓ requirement matcher");
console.log(" ", validation.requirementMatcher.summary);
console.log("✓ foundation freeze");
console.log(
  " ",
  `registry=${freeze.requirementRegistry.valid} graph=${freeze.requirementGraph.valid} compliance=${freeze.requirementCompliance.valid}`,
);
console.log(
  " ",
  `ready=${foundation.readiness.readyCount} partial=${foundation.readiness.partialCount} blocked=${foundation.readiness.blockedCount} notReady=${foundation.readiness.notReadyCount} avgScore=${foundation.readiness.averageReadinessScore}`,
);
console.log(
  " ",
  `version=${REQUIREMENT_INTELLIGENCE_VERSION} tag=${REQUIREMENT_INTELLIGENCE_P4_TAG}`,
);
console.log(" ", `foundationTag=${REQUIREMENT_INTELLIGENCE_TAG}`);
console.log("Requirement Intelligence Phase 4 PASS");
console.log("Requirement Intelligence Foundation PASS");
