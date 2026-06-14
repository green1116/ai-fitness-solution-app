import type { TenderKnowledgeFreezeValidation } from "../shared/types";
import { buildKnowledgeAssistedWinProbability } from "../knowledge-assisted/win-probability/builders";
import {
  validateKnowledgeAssistedWinProbability,
  validateTenderKnowledge,
} from "../validation/validators";
import { CANONICAL_KNOWLEDGE_ASSISTED_QUERY } from "../shared/types";
import {
  TENDER_KNOWLEDGE_CANONICAL_CALIBRATED_PROBABILITY,
  TENDER_KNOWLEDGE_VALIDATION_GATES,
} from "./constants";

export function validateTenderKnowledgeFreeze(): TenderKnowledgeFreezeValidation {
  const phase1 = validateTenderKnowledge();
  const winProbability = buildKnowledgeAssistedWinProbability(CANONICAL_KNOWLEDGE_ASSISTED_QUERY);
  const phase2 = validateKnowledgeAssistedWinProbability(winProbability);

  const gates = [
    phase1.projectArchiveValid,
    phase1.proposalArchiveValid,
    phase1.bidOutcomeValid,
    phase1.benchmarkValid,
    phase1.valid,
    phase2.historicalMatchExists,
    phase2.benchmarkExists,
    phase2.calibratedProbabilityExists,
    phase2.valid,
    winProbability.baselineProbability > 0,
    winProbability.calibratedProbability === TENDER_KNOWLEDGE_CANONICAL_CALIBRATED_PROBABILITY,
    winProbability.confidence.length > 0,
  ];

  const validationScore = Math.round((gates.filter(Boolean).length / gates.length) * 100);
  const valid = phase1.valid && phase2.valid && validationScore === 100;

  return {
    valid,
    phase1Valid: phase1.valid,
    phase2Valid: phase2.valid,
    validationScore,
  };
}

export { TENDER_KNOWLEDGE_VALIDATION_GATES };
