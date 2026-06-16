/**
 * V40 Requirement Intelligence — Phase 4 fast verification
 * Skips P1/P2/P3 regression; validates Readiness, Query, Matcher, and Freeze gates only.
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

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const foundation = buildRequirementFoundationContext({
  includePhaseRegression: false,
  includeEvidenceNetwork: false,
});

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
assert(
  foundation.canonical.readiness!.score.totalRequirementReadiness >=
    REQUIREMENT_READINESS_MIN_SCORE,
  "readiness threshold",
);

assert(foundation.matcher.contextReady, "matcher context ready");
assert(Boolean(foundation.matcher.evidenceMatch?.matchReady), "matcher evidence");
assert(Boolean(foundation.matcher.brandMatch?.matchReady), "matcher brand");
assert(Boolean(foundation.matcher.tenderMatch?.matchReady), "matcher tender");
assert(Boolean(foundation.matcher.proposalMatch?.matchReady), "matcher proposal");

assert(foundation.query.canonical.length >= 1, "query canonical hit");
assert(foundation.query.satisfied.length >= REQUIREMENT_READINESS_MIN_READY_COUNT, "query satisfied");
assert(foundation.query.blocked.length >= 1, "query blocked");

const validation = validateRequirementIntelligenceNetworkPhase4FromContext(foundation);
assert(validation.valid, "phase4 validation");
assert(validation.requirementReadiness.valid, "requirement readiness");
assert(validation.requirementQuery.valid, "requirement query");
assert(validation.requirementMatcher.valid, "requirement matcher");

const freeze = validateRequirementIntelligenceNetworkFoundationFreezeFromContext(foundation);
assert(freeze.valid, "foundation freeze");
assert(freeze.requirementRegistry.valid, "registry freeze");
assert(freeze.requirementGraph.valid, "graph freeze");
assert(freeze.requirementCompliance.valid, "compliance freeze");
assert(freeze.engineCompatibility.valid, "compatibility freeze");

console.log("✓ fast readiness");
console.log(" ", validation.requirementReadiness.summary);
console.log("✓ fast query");
console.log(" ", validation.requirementQuery.summary);
console.log("✓ fast matcher");
console.log(" ", validation.requirementMatcher.summary);
console.log("✓ fast foundation freeze");
console.log(
  " ",
  `ready=${foundation.readiness.readyCount} partial=${foundation.readiness.partialCount} blocked=${foundation.readiness.blockedCount}`,
);
console.log(
  " ",
  `version=${REQUIREMENT_INTELLIGENCE_VERSION} tag=${REQUIREMENT_INTELLIGENCE_P4_TAG}`,
);
console.log(" ", `foundationTag=${REQUIREMENT_INTELLIGENCE_TAG}`);
console.log("Requirement Intelligence Phase 4 FAST PASS");
