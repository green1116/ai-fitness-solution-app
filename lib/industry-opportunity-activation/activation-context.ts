import type { RegistryValidation } from "./shared/types";
import { buildIndustryOpportunityActivations } from "./activation-registry";
import type { IndustryActivationOpportunityType, OpportunityActivationContext } from "./shared/types";
import {
  CANONICAL_ACTIVATION_SUBJECT_ID,
  INDUSTRY_OPPORTUNITY_ACTIVATION_TAG,
  INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  activations: ReturnType<typeof buildIndustryOpportunityActivations>,
): Record<IndustryActivationOpportunityType, number> {
  const breakdown: Record<IndustryActivationOpportunityType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const activation of activations) {
    breakdown[activation.opportunityType] += 1;
  }

  return breakdown;
}

export function buildOpportunityActivationContext(): OpportunityActivationContext {
  const activations = buildIndustryOpportunityActivations();

  return {
    contextId: `opportunity-activation-context-${INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION}`,
    activations,
    activationCount: activations.length,
    typeBreakdown: buildTypeBreakdown(activations),
    activationReady: activations.length > 0,
    mode: "industry-opportunity-activation",
  };
}

export function validateOpportunityActivationContextState(
  context: OpportunityActivationContext,
): boolean {
  const canonical = context.activations.filter(
    (activation) => activation.subjectId === CANONICAL_ACTIVATION_SUBJECT_ID,
  );
  const ready = context.activations.filter(
    (activation) => activation.activationStatus === "ready",
  );

  return (
    context.activationReady &&
    context.activationCount >= 8 &&
    context.activations.length === context.activationCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    ready.length >= 3 &&
    context.mode === "industry-opportunity-activation"
  );
}

export function validateActivationContextRegistry(): RegistryValidation {
  const context = buildOpportunityActivationContext();
  const valid =
    validateOpportunityActivationContextState(context) &&
    INDUSTRY_OPPORTUNITY_ACTIVATION_VERSION === "v33-industry-opportunity-activation-1" &&
    INDUSTRY_OPPORTUNITY_ACTIVATION_TAG === "v33-industry-opportunity-activation-foundation";

  return {
    valid,
    count: context.activationCount,
    summary: `activation-context count=${context.activationCount} types=4/4 ready=${context.activations.filter((a) => a.activationStatus === "ready").length} valid=${valid}`,
  };
}
