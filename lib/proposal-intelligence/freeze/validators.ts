import type { ProposalIntelligenceFreezeValidation } from "../shared/types";
import { CANONICAL_PROPOSAL_INTELLIGENCE_QUERY } from "../shared/types";
import {
  validateBidStrategyAnalysis,
  validateProposalIntelligence,
  validateWinProbabilityAnalysis,
} from "../validation/validators";
import { PROPOSAL_INTELLIGENCE_VALIDATION_GATES } from "./constants";

export function validateProposalIntelligenceFreeze(): ProposalIntelligenceFreezeValidation {
  const input = CANONICAL_PROPOSAL_INTELLIGENCE_QUERY;

  const phase1 = validateProposalIntelligence(input);
  const phase2 = validateWinProbabilityAnalysis(input);
  const phase3 = validateBidStrategyAnalysis(input);

  const gates = [
    phase1.scoreGenerated,
    phase1.riskGenerated,
    phase1.recommendationGenerated,
    phase1.valid,
    phase2.proposalScoreExists,
    phase2.riskAnalysisExists,
    phase2.tenderContextExists,
    phase2.probabilityGenerated,
    phase2.competitivePositionGenerated,
    phase2.valid,
    phase3.strategyGenerated,
    phase3.expectedWinRateGenerated,
    phase3.adjustmentsGenerated,
    phase3.recommendationsGenerated,
    phase3.valid,
  ];

  const validationScore = Math.round((gates.filter(Boolean).length / gates.length) * 100);

  const valid = phase1.valid && phase2.valid && phase3.valid;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid: phase2.valid,
    phase3Valid: phase3.valid,
    validationScore,
  };
}

export { PROPOSAL_INTELLIGENCE_VALIDATION_GATES };
