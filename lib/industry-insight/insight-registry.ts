import { getOrganizationById } from "@/lib/industry/organization-registry";
import {
  getAllEvents,
  getAllObservations,
  getAllSignals,
  getEventById,
  getObservationById,
  getSignalById,
} from "@/lib/industry-data-network";
import type { IndustryObservation } from "@/lib/industry-data-network";
import type { IndustryInsight, IndustryInsightType, RegistryValidation } from "./shared/types";
import { CANONICAL_INSIGHT_SUBJECT_ID } from "./shared/types";

function insightFromObservation(
  observation: IndustryObservation,
  insightType: IndustryInsightType,
  title: string,
  explanation: string,
  priority: IndustryInsight["priority"],
  confidence: number,
): IndustryInsight {
  return {
    insightId: `ind-insight-${insightType}-${observation.observationId}`,
    insightType,
    subjectId: observation.subjectId,
    subjectType: observation.subjectType,
    title,
    summary: observation.summary,
    explanation,
    signalIds: [...observation.signalIds],
    eventIds: [...observation.eventIds],
    observationIds: [observation.observationId],
    confidence,
    priority,
    generatedAt: observation.observedAt,
    status: "active",
    metadata: { ...observation.metadata, sourceLayer: "v32-industry-data-network" },
    mode: "industry-insight",
  };
}

function buildTrendInsights(observations: IndustryObservation[]): IndustryInsight[] {
  const insights: IndustryInsight[] = [];

  for (const observation of observations) {
    const tenderSignals = observation.signalIds.filter(
      (id) => getSignalById(id)?.signalType === "TENDER_INTEREST",
    );
    const categorySignals = observation.signalIds.filter(
      (id) => getSignalById(id)?.signalType === "CATEGORY_SHIFT",
    );

    if (tenderSignals.length > 0) {
      insights.push(
        insightFromObservation(
          observation,
          "trend",
          "Active tender interest trend",
          "Tender interest signals indicate sustained buyer procurement activity in the network.",
          "high",
          0.88,
        ),
      );
    }

    if (categorySignals.length > 0 && tenderSignals.length === 0) {
      insights.push(
        insightFromObservation(
          observation,
          "trend",
          "Category alignment trend",
          "Category shift signals show evolving venue classification within the industry network.",
          "medium",
          0.72,
        ),
      );
    }
  }

  return insights;
}

function buildOpportunityInsights(observations: IndustryObservation[]): IndustryInsight[] {
  const insights: IndustryInsight[] = [];

  for (const observation of observations) {
    const bidEvents = observation.eventIds.filter(
      (id) => getEventById(id)?.eventType === "BID_SUBMITTED",
    );
    const recommendationEvents = observation.eventIds.filter(
      (id) => getEventById(id)?.eventType === "RECOMMENDATION_MATCH",
    );
    const supplySignals = observation.signalIds.filter(
      (id) => getSignalById(id)?.signalType === "SUPPLY_ACTIVITY",
    );

    if (bidEvents.length > 0 || recommendationEvents.length > 0) {
      insights.push(
        insightFromObservation(
          observation,
          "opportunity",
          "Commercial engagement opportunity",
          "Bid submissions and recommendation matches indicate actionable commercial opportunities.",
          bidEvents.length > 0 ? "high" : "medium",
          0.85,
        ),
      );
    } else if (supplySignals.length > 0 && observation.subjectType === "organization") {
      const org = getOrganizationById(observation.subjectId);
      if (org?.organizationType === "supplier") {
        insights.push(
          insightFromObservation(
            observation,
            "opportunity",
            "Supply chain expansion opportunity",
            "Supply activity signals suggest room to expand regional supply coverage.",
            "medium",
            0.7,
          ),
        );
      }
    }
  }

  return insights;
}

function buildRiskInsights(observations: IndustryObservation[]): IndustryInsight[] {
  const insights: IndustryInsight[] = [];

  for (const observation of observations) {
    const org = getOrganizationById(observation.subjectId);
    if (org?.organizationType === "buyer" && observation.eventIds.length === 0) {
      insights.push(
        insightFromObservation(
          observation,
          "risk",
          "Limited supplier engagement risk",
          "Buyer shows tender signals but lacks recorded engagement events, indicating potential supplier coverage gap.",
          "medium",
          0.68,
        ),
      );
    }

    if (observation.metadata.tenderActive === "true" && observation.eventIds.length <= 1) {
      insights.push(
        insightFromObservation(
          observation,
          "risk",
          "Tender fulfillment risk",
          "Active tender with minimal downstream events may indicate fulfillment or response risk.",
          "high",
          0.75,
        ),
      );
    }
  }

  return insights;
}

function buildGrowthInsights(observations: IndustryObservation[]): IndustryInsight[] {
  const insights: IndustryInsight[] = [];

  for (const observation of observations) {
    const growthSignals = observation.signalIds.filter(
      (id) =>
        getSignalById(id)?.signalType === "RELATIONSHIP_GROWTH" ||
        getSignalById(id)?.signalType === "NETWORK_CENTRALITY",
    );

    if (growthSignals.length > 0) {
      insights.push(
        insightFromObservation(
          observation,
          "growth",
          "Network growth signal",
          "Relationship growth and centrality signals indicate expanding network influence.",
          growthSignals.some((id) => getSignalById(id)?.severity === "high") ? "high" : "medium",
          0.82,
        ),
      );
    }
  }

  return insights;
}

function buildNetworkChangeInsights(observations: IndustryObservation[]): IndustryInsight[] {
  const insights: IndustryInsight[] = [];

  for (const observation of observations) {
    const relEvents = observation.eventIds.filter(
      (id) => getEventById(id)?.eventType === "RELATIONSHIP_ESTABLISHED",
    );
    const directoryEvents = observation.eventIds.filter(
      (id) => getEventById(id)?.eventType === "DIRECTORY_PUBLISHED",
    );
    const supplierLinked = observation.eventIds.filter(
      (id) => getEventById(id)?.eventType === "SUPPLIER_LINKED",
    );

    if (relEvents.length > 0) {
      insights.push(
        insightFromObservation(
          observation,
          "network-change",
          "Relationship network change",
          "New relationship establishment events reflect structural network changes.",
          "medium",
          0.8,
        ),
      );
    }

    if (directoryEvents.length > 0) {
      insights.push(
        insightFromObservation(
          observation,
          "network-change",
          "Directory network expansion",
          "Directory publication events extend the visible industry network surface.",
          "low",
          0.65,
        ),
      );
    }

    if (supplierLinked.length > 0 && relEvents.length === 0 && directoryEvents.length === 0) {
      insights.push(
        insightFromObservation(
          observation,
          "network-change",
          "Supplier linkage change",
          "Supplier-brand linkage events indicate evolving supply network topology.",
          "medium",
          0.78,
        ),
      );
    }
  }

  return insights;
}

export function buildIndustryInsights(): IndustryInsight[] {
  const observations = getAllObservations();
  const dedup = new Map<string, IndustryInsight>();

  for (const insight of [
    ...buildTrendInsights(observations),
    ...buildOpportunityInsights(observations),
    ...buildRiskInsights(observations),
    ...buildGrowthInsights(observations),
    ...buildNetworkChangeInsights(observations),
  ]) {
    dedup.set(insight.insightId, insight);
  }

  return [...dedup.values()].sort((a, b) => b.confidence - a.confidence);
}

export function getInsightById(insightId: string): IndustryInsight | undefined {
  return buildIndustryInsights().find((insight) => insight.insightId === insightId);
}

export function getInsightsByType(insightType: IndustryInsightType): IndustryInsight[] {
  return buildIndustryInsights().filter((insight) => insight.insightType === insightType);
}

export function getInsightsBySubject(subjectId: string): IndustryInsight[] {
  return buildIndustryInsights().filter((insight) => insight.subjectId === subjectId);
}

function validateInsightLinks(insight: IndustryInsight): boolean {
  return (
    insight.signalIds.every((id) => getSignalById(id) !== undefined) &&
    insight.eventIds.every((id) => getEventById(id) !== undefined || id.length === 0) &&
    insight.observationIds.every((id) => getObservationById(id) !== undefined) &&
    insight.title.length > 0 &&
    insight.explanation.length > 0 &&
    insight.mode === "industry-insight"
  );
}

export function validateInsightRegistry(): RegistryValidation {
  const insights = buildIndustryInsights();
  const requiredTypes: IndustryInsightType[] = [
    "trend",
    "opportunity",
    "risk",
    "growth",
    "network-change",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    insights.some((insight) => insight.insightType === type),
  );
  const linksValid = insights.every(validateInsightLinks);
  const canonicalInsights = getInsightsBySubject(CANONICAL_INSIGHT_SUBJECT_ID);
  const dataNetworkRefs =
    getAllSignals().length >= 10 && getAllEvents().length >= 10 && getAllObservations().length >= 8;

  const valid =
    insights.length >= 10 &&
    typeCoverage &&
    linksValid &&
    canonicalInsights.length >= 3 &&
    dataNetworkRefs;

  return {
    valid,
    count: insights.length,
    summary: `insight-registry count=${insights.length} types=${requiredTypes.filter((t) => insights.some((i) => i.insightType === t)).length}/5 valid=${valid}`,
  };
}
