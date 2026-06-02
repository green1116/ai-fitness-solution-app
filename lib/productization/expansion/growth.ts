import { buildExpansionOpportunities } from "./expansion";
import { buildRenewalOpportunity } from "./renewal";
import { buildRetentionProfile } from "./retention";
import type { ExpansionRenewalResponse, ExpansionSummary, GrowthMetrics } from "./types";
import { EXPANSION_RENEWAL_VERSION } from "./types";

export function buildGrowthMetrics(input?: { deploymentId?: string }): GrowthMetrics {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const expansion = buildExpansionOpportunities({ deploymentId });
  const renewal = buildRenewalOpportunity({ deploymentId });
  const expansionArr = expansion.reduce(
    (sum, opp) => sum + Math.round(opp.estimatedValue * (opp.probability / 100)),
    0,
  );
  const renewalArr = renewal.renewalForecast;

  return {
    metricsId: `growth-metrics-${deploymentId}`,
    upsellPotential: 72,
    crossSellPotential: 58,
    expansionArr,
    renewalArr,
    currency: "CNY",
    summary: `growth-metrics upsell=72% crossSell=58% expansionARR=${expansionArr} renewalARR=${renewalArr}`,
  };
}

export function buildExpansionSummary(input?: { deploymentId?: string }): ExpansionSummary {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const renewal = buildRenewalOpportunity({ deploymentId });
  const expansion = buildExpansionOpportunities({ deploymentId });
  const retention = buildRetentionProfile({ deploymentId });
  const growth = buildGrowthMetrics({ deploymentId });

  return {
    summaryId: `expansion-summary-${deploymentId}`,
    version: EXPANSION_RENEWAL_VERSION,
    customerId: renewal.customerId,
    renewalProbability: renewal.renewalProbability,
    expansionOpportunityCount: expansion.length,
    retentionRate: retention.retentionRate,
    expansionArr: growth.expansionArr,
    summary: `expansion-summary renewal=${renewal.renewalProbability}% expansionOpps=${expansion.length} retention=${retention.retentionRate}% expansionARR=${growth.expansionArr}`,
  };
}

export function buildExpansionRenewalResponse(input?: {
  deploymentId?: string;
}): ExpansionRenewalResponse {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  return {
    version: EXPANSION_RENEWAL_VERSION,
    renewal: buildRenewalOpportunity({ deploymentId }),
    expansion: buildExpansionOpportunities({ deploymentId }),
    retention: buildRetentionProfile({ deploymentId }),
    growth: buildGrowthMetrics({ deploymentId }),
    summary: buildExpansionSummary({ deploymentId }),
  };
}

export function validateExpansionRenewal(input?: { deploymentId?: string }): {
  renewalValid: boolean;
  expansionValid: boolean;
  retentionValid: boolean;
  growthValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "expansion-renewal-default";
  const response = buildExpansionRenewalResponse({ deploymentId });

  const renewalValid =
    response.renewal.renewalProbability >= 0 &&
    response.renewal.renewalReadiness >= 0 &&
    response.renewal.renewalValue >= 0 &&
    response.renewal.renewalForecast >= 0;

  const expansionKinds = new Set(["seat", "workspace", "feature", "enterprise-upgrade"]);
  const expansionValid =
    response.expansion.length === 4 &&
    response.expansion.every((o) => expansionKinds.has(o.kind) && o.estimatedValue >= 0);

  const retentionValid =
    response.retention.retentionRate >= 0 &&
    ["low", "medium", "high"].includes(response.retention.churnRisk) &&
    ["improving", "stable", "declining"].includes(response.retention.customerHealth);

  const growthValid =
    response.growth.upsellPotential >= 0 &&
    response.growth.crossSellPotential >= 0 &&
    response.growth.expansionArr >= 0 &&
    response.growth.renewalArr >= 0;

  const summaryValid =
    response.summary.summaryId.length > 0 &&
    response.summary.expansionOpportunityCount === response.expansion.length &&
    response.summary.renewalProbability === response.renewal.renewalProbability;

  return {
    renewalValid,
    expansionValid,
    retentionValid,
    growthValid,
    summaryValid,
  };
}
