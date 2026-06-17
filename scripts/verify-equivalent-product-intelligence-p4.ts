/**
 * V42 Equivalent Product Intelligence — Phase 4 verification
 */
import {
  buildEquivalentProductIntelligenceFoundationContext,
  buildEquivalentRecommendation,
  CANONICAL_EQUIVALENT_TENDER_ID,
  EPI_FOUNDATION_TAG,
  EPI_P4_MIN_DECISION_COUNT,
  EPI_P4_TAG,
  EPI_P4_VERSION,
  getEquivalentProductIntelligenceFoundationFreezeMeta,
  getEquivalentProductIntelligencePhase4FreezeMeta,
  matchRequirementToProduct,
  rankEquivalentCandidates,
  runEquivalentDecisionEngine,
  simulateEquivalentSubstitution,
  validateEquivalentProductIntelligenceFoundationFreeze,
  validateEquivalentProductIntelligencePhase3,
  validateEquivalentProductIntelligencePhase4,
} from "../lib/equivalent-product-intelligence";
import {
  CANONICAL_REQUIREMENT_QUERY,
  executeRequirementQuery,
} from "../lib/requirement-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase3 = validateEquivalentProductIntelligencePhase3();
assert(phase3.valid, "phase3 regression");

const validation = validateEquivalentProductIntelligencePhase4();
assert(validation.valid, "phase4 validation");
assert(validation.phase3Valid, "phase3 valid in phase4");
assert(validation.equivalentDecision.valid, "equivalent decision valid");
assert(validation.equivalentDecision.matcherReady, "matcher ready");
assert(validation.equivalentDecision.rankingReady, "ranking ready");
assert(validation.equivalentDecision.simulationReady, "simulation ready");
assert(validation.equivalentDecision.recommendationReady, "recommendation ready");
assert(validation.equivalentDecision.decisionEngineReady, "decision engine ready");

const decisionCount = validation.equivalentDecision.decisionCount;

console.log(
  "[P4 DEBUG]",
  JSON.stringify(
    {
      decisionCount,
      threshold: EPI_P4_MIN_DECISION_COUNT,
    },
    null,
    2,
  ),
);

assert(decisionCount >= EPI_P4_MIN_DECISION_COUNT, "decision count");

const canonicalRequirements = executeRequirementQuery(CANONICAL_REQUIREMENT_QUERY);
assert(canonicalRequirements.length >= 1, "canonical requirements");
const canonicalRequirementId = canonicalRequirements[0]!.requirementId;

const match = matchRequirementToProduct(canonicalRequirementId);
assert(Boolean(match), "matcher");
assert(Boolean(match!.primaryProductId), "primary product");
assert(match!.equivalentProductIds.length >= 1, "equivalent products");

console.log("✓ matcher");
console.log(
  `  requirement=${canonicalRequirementId} primary=${match!.primaryProductId} equivalents=${match!.equivalentProductIds.length}`,
);

const ranking = rankEquivalentCandidates(canonicalRequirementId);
assert(ranking.entries.length >= 1, "ranking entries");
assert(Boolean(ranking.optimalProductId), "optimal product");

console.log("✓ ranking");
console.log(
  `  optimal=${ranking.optimalProductId} alternatives=${ranking.alternativeProductIds.length} topScore=${ranking.entries[0]?.score.totalScore}`,
);

const simulation = simulateEquivalentSubstitution(
  canonicalRequirementId,
  ranking.optimalProductId,
);
assert(Boolean(simulation), "simulation");
assert(typeof simulation!.compatibilityDelta === "number", "compatibility delta");
assert(typeof simulation!.riskDelta === "number", "risk delta");

console.log("✓ simulation");
console.log(
  `  compatDelta=${simulation!.compatibilityDelta} riskDelta=${simulation!.riskDelta} readinessDelta=${simulation!.readinessDelta}`,
);

const recommendation = buildEquivalentRecommendation(canonicalRequirementId);
assert(Boolean(recommendation), "recommendation");
assert(Boolean(recommendation!.optimalProductId), "recommendation optimal");
assert(recommendation!.riskSummary.length > 0, "recommendation risk summary");
assert(recommendation!.compatibilitySummary.length > 0, "recommendation compatibility summary");

console.log("✓ recommendation");
console.log(
  `  optimal=${recommendation!.optimalProductId} decision=${recommendation!.decisionLevel}`,
);

const decision = runEquivalentDecisionEngine(canonicalRequirementId);
assert(Boolean(decision), "decision engine");
assert(decision!.candidateProductIds.length >= 1, "candidate products");
assert(decision!.decisionReason.length > 0, "decision reason");
assert(decision!.decisionLevel.length > 0, "decision level");

console.log("✓ decision engine");
console.log(
  `  optimal=${decision!.optimalProductId} level=${decision!.decisionLevel} candidates=${decision!.candidateProductIds.length}`,
);

const foundation = validateEquivalentProductIntelligenceFoundationFreeze();
assert(foundation.valid, "foundation freeze");
assert(foundation.phase1Valid, "foundation p1");
assert(foundation.phase2Valid, "foundation p2");
assert(foundation.phase3Valid, "foundation p3");
assert(foundation.phase4Valid, "foundation p4");

const foundationContext = buildEquivalentProductIntelligenceFoundationContext();
assert(foundationContext.foundationValid, "foundation context");
assert(foundationContext.contextReady, "foundation context ready");

const foundationMeta = getEquivalentProductIntelligenceFoundationFreezeMeta();
assert(foundationMeta.valid, "foundation meta valid");
assert(foundationMeta.tag === EPI_FOUNDATION_TAG, "foundation tag");

const freeze = getEquivalentProductIntelligencePhase4FreezeMeta();
assert(freeze.valid, "freeze meta valid");
assert(freeze.tag === EPI_P4_TAG, "freeze tag");

console.log("✓ equivalent product intelligence p4");
console.log(`  tag=${freeze.tag} tender=${CANONICAL_EQUIVALENT_TENDER_ID}`);
console.log("V42 P4 FREEZE PASS");
