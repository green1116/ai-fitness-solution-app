import type { RegistryValidation } from "./shared/types";
import { buildIndustryOpportunities } from "./opportunity-registry";
import type { IndustryOpportunityType, OpportunityContext } from "./shared/types";
import {
  CANONICAL_OPPORTUNITY_SUBJECT_ID,
  INDUSTRY_OPPORTUNITY_TAG,
  INDUSTRY_OPPORTUNITY_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  opportunities: ReturnType<typeof buildIndustryOpportunities>,
): Record<IndustryOpportunityType, number> {
  const breakdown: Record<IndustryOpportunityType, number> = {
    supplier: 0,
    brand: 0,
    tender: 0,
    partnership: 0,
  };

  for (const opportunity of opportunities) {
    breakdown[opportunity.opportunityType] += 1;
  }

  return breakdown;
}

export function buildOpportunityContext(): OpportunityContext {
  const opportunities = buildIndustryOpportunities();

  return {
    contextId: `opportunity-context-${INDUSTRY_OPPORTUNITY_VERSION}`,
    opportunities,
    opportunityCount: opportunities.length,
    typeBreakdown: buildTypeBreakdown(opportunities),
    opportunityReady: opportunities.length > 0,
    mode: "industry-opportunity",
  };
}

export function validateOpportunityContextState(context: OpportunityContext): boolean {
  const canonical = context.opportunities.filter(
    (opportunity) => opportunity.subjectId === CANONICAL_OPPORTUNITY_SUBJECT_ID,
  );

  return (
    context.opportunityReady &&
    context.opportunityCount >= 8 &&
    context.opportunities.length === context.opportunityCount &&
    Object.values(context.typeBreakdown).every((count) => count > 0) &&
    canonical.length >= 1 &&
    context.mode === "industry-opportunity"
  );
}

export function validateOpportunityContextRegistry(): RegistryValidation {
  const context = buildOpportunityContext();
  const valid =
    validateOpportunityContextState(context) &&
    INDUSTRY_OPPORTUNITY_VERSION === "v33-industry-opportunity-1" &&
    INDUSTRY_OPPORTUNITY_TAG === "v33-industry-opportunity-foundation";

  return {
    valid,
    count: context.opportunityCount,
    summary: `opportunity-context count=${context.opportunityCount} types=4/4 ready=${context.opportunityReady} valid=${valid}`,
  };
}
