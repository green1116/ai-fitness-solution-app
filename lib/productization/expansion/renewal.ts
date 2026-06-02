import type { RenewalOpportunity } from "./types";

export function buildRenewalOpportunity(input?: {
  deploymentId?: string;
  customerId?: string;
}): RenewalOpportunity {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const customerId = input?.customerId ?? `customer-${deploymentId}`;
  const renewalProbability = 78;
  const renewalReadiness = 72;
  const renewalValue = 480000;
  const renewalForecast = Math.round(renewalValue * (renewalProbability / 100));

  return {
    opportunityId: `renewal-opp-${deploymentId}`,
    customerId,
    renewalProbability,
    renewalReadiness,
    renewalValue,
    renewalForecast,
    currency: "CNY",
    summary: `renewal-opp probability=${renewalProbability}% readiness=${renewalReadiness}% value=${renewalValue} forecast=${renewalForecast}`,
  };
}
