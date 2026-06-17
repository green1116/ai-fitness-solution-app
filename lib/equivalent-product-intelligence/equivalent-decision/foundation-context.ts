import {
  EPI_FOUNDATION_TAG,
  EPI_FOUNDATION_VERSION,
  EPI_P4_MIN_DECISION_COUNT,
} from "../shared/constants";
import { validateEquivalentProductIntelligencePhase1 } from "../product-foundation/product-spec-validation";
import { validateEquivalentProductIntelligencePhase2 } from "../equivalent-graph/equivalent-graph-validation";
import { validateEquivalentProductIntelligencePhase3 } from "../substitution/substitution-validation";
import { validateEquivalentProductIntelligencePhase4 } from "./equivalent-validation";
import type {
  EquivalentProductIntelligenceFoundationContext,
  EquivalentProductIntelligenceFoundationValidation,
} from "./equivalent-decision-types";

let cachedFoundationContext: EquivalentProductIntelligenceFoundationContext | undefined;

export function buildEquivalentProductIntelligenceFoundationContext(): EquivalentProductIntelligenceFoundationContext {
  if (cachedFoundationContext) return cachedFoundationContext;

  const phase1 = validateEquivalentProductIntelligencePhase1();
  const phase2 = validateEquivalentProductIntelligencePhase2();
  const phase3 = validateEquivalentProductIntelligencePhase3();
  const phase4 = validateEquivalentProductIntelligencePhase4();
  const foundationValid =
    phase1.valid && phase2.valid && phase3.valid && phase4.valid;

  cachedFoundationContext = {
    contextId: "epi-foundation-context-v42-p4",
    phase1Valid: phase1.valid,
    phase2Valid: phase2.valid,
    phase3Valid: phase3.valid,
    phase4Valid: phase4.valid,
    foundationValid,
    decisionCount: phase4.equivalentDecision.decisionCount,
    contextReady: foundationValid && phase4.equivalentDecision.decisionCount >= EPI_P4_MIN_DECISION_COUNT,
    mode: "equivalent-product-intelligence",
  };

  return cachedFoundationContext;
}

export function validateEquivalentProductIntelligenceFoundationFreeze(): EquivalentProductIntelligenceFoundationValidation {
  const foundation = buildEquivalentProductIntelligenceFoundationContext();

  return {
    valid: foundation.foundationValid,
    phase1Valid: foundation.phase1Valid,
    phase2Valid: foundation.phase2Valid,
    phase3Valid: foundation.phase3Valid,
    phase4Valid: foundation.phase4Valid,
    foundationValid: foundation.foundationValid,
  };
}

export function getEquivalentProductIntelligenceFoundationFreezeMeta() {
  const validation = validateEquivalentProductIntelligenceFoundationFreeze();

  return {
    tag: EPI_FOUNDATION_TAG,
    version: EPI_FOUNDATION_VERSION,
    valid: validation.valid,
  };
}
