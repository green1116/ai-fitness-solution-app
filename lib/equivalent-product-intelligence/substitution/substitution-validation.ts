import {
  EPI_P3_MIN_ASSESSMENT_COUNT,
  EPI_P3_MIN_COMPATIBLE_COUNT,
  EPI_P3_MIN_INCOMPATIBLE_COUNT,
  EPI_P3_MIN_PARTIAL_COUNT,
  EPI_P3_PHASE,
  EPI_P3_TAG,
  EPI_P3_VERSION,
} from "../shared/constants";
import { validateEquivalentProductIntelligencePhase2 } from "../equivalent-graph/equivalent-graph-validation";
import {
  buildAllSubstitutionAssessments,
  buildSubstitutionCompatibilityEngine,
  buildSubstitutionReasoning,
} from "./substitution-compatibility-engine";
import { buildSubstitutionContext } from "./substitution-context";
import type {
  EquivalentProductIntelligencePhase3FreezeMeta,
  EquivalentProductIntelligencePhase3Validation,
  SubstitutionValidation,
} from "./substitution-types";

let cachedPhase3Validation: EquivalentProductIntelligencePhase3Validation | undefined;

export function validateSubstitutionLayer(): SubstitutionValidation {
  const context = buildSubstitutionContext();
  const engine = buildSubstitutionCompatibilityEngine();
  const assessments = buildAllSubstitutionAssessments();

  const compatibleCount = assessments.filter(
    (assessment) => assessment.compatibility.compatibilityLevel === "compatible",
  ).length;
  const partialCount = assessments.filter(
    (assessment) => assessment.compatibility.compatibilityLevel === "partial",
  ).length;
  const incompatibleCount = assessments.filter(
    (assessment) => assessment.compatibility.compatibilityLevel === "incompatible",
  ).length;

  const explanationsReady = assessments.every(
    (assessment) =>
      assessment.explanation.length > 0 &&
      assessment.explanation.every((line) => line.trim().length > 0),
  );
  const gapsReady = assessments.every(
    (assessment) => assessment.gaps.every((gap) => gap.explanation.trim().length > 0),
  );
  const scoresValid = assessments.every(
    (assessment) =>
      assessment.riskScore.totalRiskScore >= 0 &&
      assessment.riskScore.totalRiskScore <= 100,
  );

  const sample = assessments[0];
  const reasoningReady = sample
    ? buildSubstitutionReasoning(sample.sourceProductId, sample.targetProductId).whySubstitutable
        .length > 0
    : false;

  const valid =
    context.contextReady &&
    engine.contextReady &&
    assessments.length >= EPI_P3_MIN_ASSESSMENT_COUNT &&
    compatibleCount >= EPI_P3_MIN_COMPATIBLE_COUNT &&
    partialCount >= EPI_P3_MIN_PARTIAL_COUNT &&
    incompatibleCount >= EPI_P3_MIN_INCOMPATIBLE_COUNT &&
    explanationsReady &&
    gapsReady &&
    scoresValid &&
    reasoningReady;

  return {
    valid,
    assessmentCount: assessments.length,
    compatibleCount,
    partialCount,
    incompatibleCount,
    riskEngineReady: scoresValid,
    compatibilityMatrixReady: assessments.length >= EPI_P3_MIN_ASSESSMENT_COUNT,
    gapExplanationReady: gapsReady,
    reasoningReady,
    summary: `substitution assessments=${assessments.length} compatible=${compatibleCount} partial=${partialCount} incompatible=${incompatibleCount} valid=${valid}`,
  };
}

export function validateEquivalentProductIntelligencePhase3(): EquivalentProductIntelligencePhase3Validation {
  if (cachedPhase3Validation) return cachedPhase3Validation;

  const phase2 = validateEquivalentProductIntelligencePhase2();
  const substitution = validateSubstitutionLayer();

  cachedPhase3Validation = {
    valid: phase2.valid && substitution.valid,
    phase2Valid: phase2.valid,
    substitution,
  };

  return cachedPhase3Validation;
}

export function getEquivalentProductIntelligencePhase3FreezeMeta(): EquivalentProductIntelligencePhase3FreezeMeta {
  const validation = validateEquivalentProductIntelligencePhase3();

  return {
    tag: EPI_P3_TAG,
    version: EPI_P3_VERSION,
    phase: EPI_P3_PHASE,
    valid: validation.valid,
  };
}
