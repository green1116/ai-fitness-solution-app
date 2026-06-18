import {
  PDI_MIN_ACCEPTANCE_CRITERIA_COUNT,
  PDI_MIN_ACCEPTANCE_PASS_RATE,
  PDI_MIN_DELIVERY_READINESS_SCORE,
} from "../shared/constants";
import { buildAcceptanceCriteriaRegistry } from "./acceptance-criteria-registry";
import { buildAcceptanceChecks } from "./acceptance-check-builder";
import { assessDeliveryReadiness } from "./delivery-readiness";
import { buildProjectDeliveryFoundationContext } from "./foundation-context";
import type { AcceptanceLayerValidation } from "./acceptance-types";

let cachedValidation: AcceptanceLayerValidation | undefined;

export function validateAcceptanceLayer(): AcceptanceLayerValidation {
  if (cachedValidation) return cachedValidation;

  const criteria = buildAcceptanceCriteriaRegistry();
  const checks = buildAcceptanceChecks();
  const readiness = assessDeliveryReadiness();
  const foundation = buildProjectDeliveryFoundationContext();

  const valid =
    criteria.count >= PDI_MIN_ACCEPTANCE_CRITERIA_COUNT &&
    checks.passRate >= PDI_MIN_ACCEPTANCE_PASS_RATE &&
    readiness.readinessScore >= PDI_MIN_DELIVERY_READINESS_SCORE &&
    foundation.foundationValid;

  const summary = [
    `criteria=${criteria.count}`,
    `passRate=${(checks.passRate * 100).toFixed(1)}%`,
    `readiness=${readiness.readinessScore}`,
    `foundationValid=${foundation.foundationValid}`,
  ].join(" ");

  cachedValidation = {
    valid,
    criteriaCount: criteria.count,
    acceptancePassRate: checks.passRate,
    readinessScore: readiness.readinessScore,
    foundationValid: foundation.foundationValid,
    summary,
  };

  return cachedValidation;
}
