import { buildProcurementRequirementLinks } from "../procurement-matching/procurement-requirement-link";
import { buildProcurementMatches } from "../procurement-matching/procurement-match-builder";
import type { ProcurementDecisionValidation } from "./procurement-decision-types";
import { runProcurementDecisionEngine } from "./procurement-decision-engine";
import { buildProcurementRecommendation } from "./procurement-recommendation";
import { rankProcurementCandidates } from "./procurement-ranking";
import { simulateProcurementOutcome } from "./procurement-simulation";

const PI_P1C_MIN_DECISION_COUNT = 10;

let cachedValidation: ProcurementDecisionValidation | undefined;

export function validateProcurementDecision(): ProcurementDecisionValidation {
  if (cachedValidation) return cachedValidation;

  const matches = buildProcurementMatches();
  const rankings = rankProcurementCandidates(matches);
  const decisions = runProcurementDecisionEngine();
  const requirementLinks = buildProcurementRequirementLinks();

  const rankingReady =
    rankings.length > 0 &&
    rankings.every(
      (ranking) =>
        ranking.candidates.length > 0 &&
        ranking.optimalSupplierId.length > 0,
    );

  const simulationReady = decisions
    .filter((decision) => decision.supplierId.length > 0)
    .slice(0, 5)
    .every((decision) =>
      Boolean(
        simulateProcurementOutcome(
          decision.requirementId,
          decision.supplierId,
          decision.productId,
        ),
      ),
    );

  const recommendationReady = requirementLinks.every((link) =>
    Boolean(buildProcurementRecommendation(link.requirementId)),
  );

  const decisionEngineReady = decisions.length >= PI_P1C_MIN_DECISION_COUNT;

  const preferredCount = decisions.filter(
    (decision) => decision.procurementLevel === "preferred",
  ).length;
  const acceptableCount = decisions.filter(
    (decision) => decision.procurementLevel === "acceptable",
  ).length;
  const fallbackCount = decisions.filter(
    (decision) => decision.procurementLevel === "fallback",
  ).length;
  const deferCount = decisions.filter(
    (decision) => decision.procurementLevel === "defer",
  ).length;

  const allRationaleNonEmpty = decisions.every(
    (decision) => decision.rationale.length > 0,
  );

  const valid =
    rankingReady &&
    simulationReady &&
    recommendationReady &&
    decisionEngineReady &&
    allRationaleNonEmpty;

  cachedValidation = {
    valid,
    rankingReady,
    simulationReady,
    recommendationReady,
    decisionEngineReady,
    decisionCount: decisions.length,
    preferredCount,
    acceptableCount,
    fallbackCount,
    deferCount,
    summary: `procurement-decision decisions=${decisions.length} preferred=${preferredCount} acceptable=${acceptableCount} fallback=${fallbackCount} defer=${deferCount} valid=${valid}`,
  };

  return cachedValidation;
}
