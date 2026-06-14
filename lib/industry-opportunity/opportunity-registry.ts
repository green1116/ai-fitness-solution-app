import { getOrganizationById } from "@/lib/industry/organization-registry";
import { getEventById, getSignalById } from "@/lib/industry-data-network";
import {
  buildIndustryInsights,
  findOpportunities,
  findGrowthSignals,
  findNetworkChanges,
  findTrends,
} from "@/lib/industry-insight";
import type { IndustryInsight } from "@/lib/industry-insight";
import { buildOpportunityScore } from "./opportunity-scoring";
import type {
  IndustryOpportunity,
  IndustryOpportunityType,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_OPPORTUNITY_SUBJECT_ID } from "./shared/types";

function classifyOpportunityType(insight: IndustryInsight): IndustryOpportunityType | null {
  const org = getOrganizationById(insight.subjectId);
  const hasTenderSignal = insight.signalIds.some(
    (id) => getSignalById(id)?.signalType === "TENDER_INTEREST",
  );
  const hasPartnershipMetadata = insight.metadata.relationshipType === "PARTNERS_WITH";
  const isPartnershipInsight =
    hasPartnershipMetadata ||
    (insight.insightType === "growth" && insight.subjectType === "relationship") ||
    (insight.insightType === "network-change" &&
      insight.title.toLowerCase().includes("partnership"));

  if (org?.organizationType === "buyer" && (hasTenderSignal || insight.insightType === "trend")) {
    return "tender";
  }

  if (org?.organizationType === "supplier") {
    if (isPartnershipInsight && insight.insightType === "network-change") {
      return "partnership";
    }
    if (["opportunity", "growth", "network-change"].includes(insight.insightType)) {
      return "supplier";
    }
  }

  if (
    org?.organizationType === "brand" &&
    ["opportunity", "growth", "network-change"].includes(insight.insightType)
  ) {
    return "brand";
  }

  if (isPartnershipInsight) {
    return "partnership";
  }

  if (insight.insightType === "opportunity") {
    if (org?.organizationType === "buyer") return "tender";
    if (org?.organizationType === "brand") return "brand";
    if (org?.organizationType === "supplier") return "supplier";
  }

  if (hasTenderSignal) {
    return "tender";
  }

  return null;
}

function buildDerivedBrandOpportunities(insights: IndustryInsight[]): IndustryOpportunity[] {
  const derived: IndustryOpportunity[] = [];

  for (const insight of insights) {
    for (const eventId of insight.eventIds) {
      const event = getEventById(eventId);
      const brandId = event?.metadata.brandRef;
      if (!brandId) continue;

      const brand = getOrganizationById(brandId);
      if (brand?.organizationType !== "brand") continue;

      const opportunityId = `ind-opportunity-brand-derived-${brandId}-${insight.insightId}`;
      derived.push({
        opportunityId,
        opportunityType: "brand",
        subjectId: brandId,
        subjectType: "organization",
        title: "Brand network expansion opportunity",
        summary: `Brand ${brand.organizationName} linked via supplier engagement in the industry network.`,
        insightIds: [insight.insightId],
        score: buildOpportunityScore(opportunityId, insight, "brand"),
        generatedAt: insight.generatedAt,
        status: "active",
        metadata: {
          brandRef: brandId,
          sourceInsightType: insight.insightType,
          sourceLayer: "v33-industry-insight",
        },
        mode: "industry-opportunity",
      });
    }

    if (insight.metadata.relationshipType === "PARTNERS_WITH") {
      for (const brandId of ["ind-org-brand-life-fitness", "ind-org-brand-technogym"]) {
        const brand = getOrganizationById(brandId);
        if (!brand) continue;

        const opportunityId = `ind-opportunity-brand-partner-${brandId}-${insight.insightId}`;
        derived.push({
          opportunityId,
          opportunityType: "brand",
          subjectId: brandId,
          subjectType: "organization",
          title: "Brand partnership opportunity",
          summary: `Partnership growth signal for ${brand.organizationName} in the industry network.`,
          insightIds: [insight.insightId],
          score: buildOpportunityScore(opportunityId, insight, "brand"),
          generatedAt: insight.generatedAt,
          status: "active",
          metadata: {
            relationshipType: "PARTNERS_WITH",
            sourceInsightType: insight.insightType,
            sourceLayer: "v33-industry-insight",
          },
          mode: "industry-opportunity",
        });
      }
    }
  }

  return derived;
}

function insightToOpportunity(insight: IndustryInsight): IndustryOpportunity | null {
  const opportunityType = classifyOpportunityType(insight);
  if (!opportunityType) {
    return null;
  }

  const opportunityId = `ind-opportunity-${opportunityType}-${insight.insightId}`;

  return {
    opportunityId,
    opportunityType,
    subjectId: insight.subjectId,
    subjectType: insight.subjectType,
    title: insight.title.replace(" trend", " opportunity").replace(" signal", " opportunity"),
    summary: insight.summary,
    insightIds: [insight.insightId],
    score: buildOpportunityScore(opportunityId, insight, opportunityType),
    generatedAt: insight.generatedAt,
    status: "active",
    metadata: {
      ...insight.metadata,
      sourceInsightType: insight.insightType,
      sourceLayer: "v33-industry-insight",
    },
    mode: "industry-opportunity",
  };
}

function collectSourceInsights(): IndustryInsight[] {
  const insightMap = new Map<string, IndustryInsight>();

  for (const insight of [
    ...findOpportunities(20).insights,
    ...findTrends(20).insights,
    ...findGrowthSignals(20).insights,
    ...findNetworkChanges(20).insights,
    ...buildIndustryInsights().filter((item) => item.insightType === "opportunity"),
  ]) {
    insightMap.set(insight.insightId, insight);
  }

  return [...insightMap.values()];
}

export function buildIndustryOpportunities(): IndustryOpportunity[] {
  const sourceInsights = collectSourceInsights();
  const opportunities = [
    ...sourceInsights
      .map(insightToOpportunity)
      .filter((opportunity): opportunity is IndustryOpportunity => opportunity !== null),
    ...buildDerivedBrandOpportunities(sourceInsights),
  ];

  const dedup = new Map<string, IndustryOpportunity>();
  for (const opportunity of opportunities) {
    dedup.set(opportunity.opportunityId, opportunity);
  }

  return [...dedup.values()].sort((a, b) => b.score.totalScore - a.score.totalScore);
}

export function getOpportunityById(opportunityId: string): IndustryOpportunity | undefined {
  return buildIndustryOpportunities().find((opportunity) => opportunity.opportunityId === opportunityId);
}

export function getOpportunitiesByType(opportunityType: IndustryOpportunityType): IndustryOpportunity[] {
  return buildIndustryOpportunities().filter(
    (opportunity) => opportunity.opportunityType === opportunityType,
  );
}

export function getOpportunitiesBySubject(subjectId: string): IndustryOpportunity[] {
  return buildIndustryOpportunities().filter((opportunity) => opportunity.subjectId === subjectId);
}

export function validateOpportunityRegistry(): RegistryValidation {
  const opportunities = buildIndustryOpportunities();
  const requiredTypes: IndustryOpportunityType[] = ["supplier", "brand", "tender", "partnership"];

  const typeCoverage = requiredTypes.every((type) =>
    opportunities.some((opportunity) => opportunity.opportunityType === type),
  );

  const scoreValid = opportunities.every(
    (opportunity) =>
      opportunity.score.impact > 0 &&
      opportunity.score.confidence > 0 &&
      opportunity.score.urgency > 0 &&
      opportunity.score.networkEffect > 0 &&
      opportunity.score.totalScore > 0 &&
      opportunity.insightIds.length > 0 &&
      opportunity.mode === "industry-opportunity",
  );

  const canonical = getOpportunitiesBySubject(CANONICAL_OPPORTUNITY_SUBJECT_ID);

  const valid =
    opportunities.length >= 8 &&
    typeCoverage &&
    scoreValid &&
    canonical.length >= 1;

  return {
    valid,
    count: opportunities.length,
    summary: `opportunity-registry count=${opportunities.length} types=${requiredTypes.filter((t) => opportunities.some((o) => o.opportunityType === t)).length}/4 valid=${valid}`,
  };
}
