import { buildIndustryOpportunities } from "@/lib/industry-opportunity";
import type { IndustryOpportunity } from "@/lib/industry-opportunity";
import {
  buildOpportunityActivationScore,
  resolveActivationStatusFromScore,
} from "./activation-scoring";
import type {
  IndustryActivationOpportunityType,
  IndustryOpportunityActivation,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_ACTIVATION_SUBJECT_ID } from "./shared/types";

function opportunityToActivation(opportunity: IndustryOpportunity): IndustryOpportunityActivation {
  const activationId = `ind-activation-${opportunity.opportunityId}`;
  const score = buildOpportunityActivationScore(activationId, opportunity);

  return {
    activationId,
    opportunityId: opportunity.opportunityId,
    opportunityType: opportunity.opportunityType,
    subjectId: opportunity.subjectId,
    subjectType: opportunity.subjectType,
    title: `${opportunity.title} — Activation`,
    summary: `${opportunity.summary} Ready for industry network activation.`,
    insightIds: [...opportunity.insightIds],
    activationStatus: resolveActivationStatusFromScore(score),
    score,
    generatedAt: opportunity.generatedAt,
    metadata: {
      ...opportunity.metadata,
      sourceOpportunityScore: opportunity.score.totalScore.toString(),
      sourceLayer: "v33-industry-opportunity",
    },
    mode: "industry-opportunity-activation",
  };
}

export function buildIndustryOpportunityActivations(): IndustryOpportunityActivation[] {
  return buildIndustryOpportunities()
    .map(opportunityToActivation)
    .sort((a, b) => b.score.totalActivationScore - a.score.totalActivationScore);
}

export function getActivationById(activationId: string): IndustryOpportunityActivation | undefined {
  return buildIndustryOpportunityActivations().find(
    (activation) => activation.activationId === activationId,
  );
}

export function getActivationsByType(
  opportunityType: IndustryActivationOpportunityType,
): IndustryOpportunityActivation[] {
  return buildIndustryOpportunityActivations().filter(
    (activation) => activation.opportunityType === opportunityType,
  );
}

export function getActivationsBySubject(subjectId: string): IndustryOpportunityActivation[] {
  return buildIndustryOpportunityActivations().filter(
    (activation) => activation.subjectId === subjectId,
  );
}

export function validateActivationRegistry(): RegistryValidation {
  const activations = buildIndustryOpportunityActivations();
  const requiredTypes: IndustryActivationOpportunityType[] = [
    "supplier",
    "brand",
    "tender",
    "partnership",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    activations.some((activation) => activation.opportunityType === type),
  );

  const scoreValid = activations.every(
    (activation) =>
      activation.score.feasibility > 0 &&
      activation.score.readiness > 0 &&
      activation.score.impact > 0 &&
      activation.score.urgency > 0 &&
      activation.score.confidence > 0 &&
      activation.score.totalActivationScore > 0 &&
      activation.insightIds.length > 0 &&
      activation.mode === "industry-opportunity-activation",
  );

  const readyCount = activations.filter((activation) => activation.activationStatus === "ready").length;
  const canonical = getActivationsBySubject(CANONICAL_ACTIVATION_SUBJECT_ID);

  const valid =
    activations.length >= 8 &&
    typeCoverage &&
    scoreValid &&
    readyCount >= 3 &&
    canonical.length >= 1;

  return {
    valid,
    count: activations.length,
    summary: `activation-registry count=${activations.length} types=${requiredTypes.filter((t) => activations.some((a) => a.opportunityType === t)).length}/4 ready=${readyCount} valid=${valid}`,
  };
}
