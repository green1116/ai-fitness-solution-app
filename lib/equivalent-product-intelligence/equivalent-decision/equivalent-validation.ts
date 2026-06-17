import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import {
  EPI_P4_MIN_DECISION_COUNT,
  EPI_P4_MIN_RANKING_SCORE,
  EPI_P4_MIN_SUBSTITUTE_OR_CONDITIONAL,
  EPI_P4_PHASE,
  EPI_P4_TAG,
  EPI_P4_VERSION,
} from "../shared/constants";
import { validateEquivalentProductIntelligencePhase3 } from "../substitution/substitution-validation";
import { buildRequirementProductEdges } from "../equivalent-graph/requirement-product-edge";
import { runEquivalentDecisionEngine } from "./equivalent-decision-engine";
import { matchRequirementToProduct } from "./equivalent-matcher";
import { rankEquivalentCandidates } from "./equivalent-ranking";
import { simulateEquivalentSubstitution } from "./equivalent-simulation";
import { buildEquivalentRecommendation } from "./equivalent-recommendation";
import type {
  EquivalentDecisionValidation,
  EquivalentProductIntelligencePhase4FreezeMeta,
  EquivalentProductIntelligencePhase4Validation,
} from "./equivalent-decision-types";

let cachedPhase4Validation: EquivalentProductIntelligencePhase4Validation | undefined;

function buildDecisionRequirementIds(): string[] {
  const linked = new Set(
    buildRequirementProductEdges().map((edge) => edge.requirementId),
  );
  return buildRequirementRegistryRecords()
    .map((record) => record.requirementId)
    .filter((requirementId) => linked.has(requirementId));
}

export function validateEquivalentDecisionLayer(): EquivalentDecisionValidation {
  const requirementIds = buildDecisionRequirementIds();
  const decisions = requirementIds
    .map((requirementId) => runEquivalentDecisionEngine(requirementId))
    .filter((decision): decision is NonNullable<typeof decision> => Boolean(decision));

  const matcherReady = requirementIds.every((requirementId) =>
    Boolean(matchRequirementToProduct(requirementId)),
  );
  const rankingReady = requirementIds.every((requirementId) => {
    const ranking = rankEquivalentCandidates(requirementId);
    return ranking.entries.length >= 1 && ranking.entries[0]!.score.totalScore >= EPI_P4_MIN_RANKING_SCORE;
  });
  const simulationReady = requirementIds.slice(0, 5).every((requirementId) => {
    const decision = runEquivalentDecisionEngine(requirementId);
    if (!decision) return false;
    const simulation = simulateEquivalentSubstitution(
      requirementId,
      decision.optimalProductId,
    );
    return Boolean(simulation);
  });
  const recommendationReady = requirementIds.every((requirementId) =>
    Boolean(buildEquivalentRecommendation(requirementId)),
  );
  const decisionEngineReady = decisions.length >= EPI_P4_MIN_DECISION_COUNT;

  const substituteOrConditional = decisions.filter(
    (decision) =>
      decision.decisionLevel === "substitute" ||
      decision.decisionLevel === "conditional-substitute",
  ).length;

  const valid =
    matcherReady &&
    rankingReady &&
    simulationReady &&
    recommendationReady &&
    decisionEngineReady &&
    substituteOrConditional >= EPI_P4_MIN_SUBSTITUTE_OR_CONDITIONAL &&
    decisions.every((decision) => decision.decisionReason.length > 0);

  return {
    valid,
    matcherReady,
    rankingReady,
    simulationReady,
    recommendationReady,
    decisionEngineReady,
    decisionCount: decisions.length,
    summary: `equivalent-decision decisions=${decisions.length} substituteOrConditional=${substituteOrConditional} valid=${valid}`,
  };
}

export function validateEquivalentProductIntelligencePhase4(): EquivalentProductIntelligencePhase4Validation {
  if (cachedPhase4Validation) return cachedPhase4Validation;

  const phase3 = validateEquivalentProductIntelligencePhase3();
  const equivalentDecision = validateEquivalentDecisionLayer();

  cachedPhase4Validation = {
    valid: phase3.valid && equivalentDecision.valid,
    phase3Valid: phase3.valid,
    equivalentDecision,
  };

  return cachedPhase4Validation;
}

export function getEquivalentProductIntelligencePhase4FreezeMeta(): EquivalentProductIntelligencePhase4FreezeMeta {
  const validation = validateEquivalentProductIntelligencePhase4();

  return {
    tag: EPI_P4_TAG,
    version: EPI_P4_VERSION,
    phase: EPI_P4_PHASE,
    valid: validation.valid,
  };
}
