import { getOrganizationById } from "@/lib/industry/organization-registry";
import { computeNodeDegree } from "@/lib/industry-relationship/analytics/network-metrics";
import { getAllActiveRelationships } from "@/lib/industry-relationship/relationship-registry";
import type { IndustrySignal, IndustrySignalType, RegistryValidation } from "./shared/types";

export const SIGNAL_REGISTRY: IndustrySignal[] = [
  {
    signalId: "ind-signal-supply-lf-sh",
    signalType: "SUPPLY_ACTIVITY",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    severity: "high",
    observedAt: "2026-04-01T08:00:00.000Z",
    status: "active",
    metadata: { relationshipRef: "ind-rel-supplies-lf-sh", region: "East China" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-supply-tg-bj",
    signalType: "SUPPLY_ACTIVITY",
    subjectId: "ind-org-supplier-technogym-cn",
    subjectType: "organization",
    severity: "medium",
    observedAt: "2026-04-01T09:00:00.000Z",
    status: "active",
    metadata: { relationshipRef: "ind-rel-supplies-tg-bj", region: "North China" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-tender-lf-gym",
    signalType: "TENDER_INTEREST",
    subjectId: "ind-org-buyer-sh-gym",
    subjectType: "organization",
    severity: "high",
    observedAt: "2026-04-02T10:00:00.000Z",
    status: "active",
    metadata: { tenderRef: "tender-sh-commercial-gym-2025-001", portalLayer: "v28-tender-marketplace" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-tender-bj-hotel",
    signalType: "TENDER_INTEREST",
    subjectId: "ind-org-buyer-bj-hotel",
    subjectType: "organization",
    severity: "medium",
    observedAt: "2026-04-02T11:00:00.000Z",
    status: "active",
    metadata: { tenderRef: "tender-bj-hotel-2025-002", portalLayer: "v28-tender-marketplace" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-centrality-lf-supplier",
    signalType: "NETWORK_CENTRALITY",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    severity: "high",
    observedAt: "2026-04-03T08:00:00.000Z",
    status: "active",
    metadata: { graphLayer: "v31-industry-graph-query", rank: "top-connected" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-category-gym-buyer",
    signalType: "CATEGORY_SHIFT",
    subjectId: "ind-org-buyer-sh-gym",
    subjectType: "organization",
    severity: "low",
    observedAt: "2026-04-03T12:00:00.000Z",
    status: "active",
    metadata: { categoryRef: "ind-cat-commercial-gym", classificationLayer: "v30-classification" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-relationship-growth-lf",
    signalType: "RELATIONSHIP_GROWTH",
    subjectId: "ind-rel-supplies-lf-sh",
    subjectType: "relationship",
    severity: "medium",
    observedAt: "2026-04-04T08:00:00.000Z",
    status: "active",
    metadata: { relationshipType: "SUPPLIES", networkLayer: "v31-relationship" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-centrality-consultant",
    signalType: "NETWORK_CENTRALITY",
    subjectId: "ind-org-consultant-fitness-advisory",
    subjectType: "organization",
    severity: "low",
    observedAt: "2026-04-04T09:00:00.000Z",
    status: "active",
    metadata: { engagement: "multi-buyer-advisory" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-category-hotel-buyer",
    signalType: "CATEGORY_SHIFT",
    subjectId: "ind-org-buyer-bj-hotel",
    subjectType: "organization",
    severity: "low",
    observedAt: "2026-04-05T08:00:00.000Z",
    status: "active",
    metadata: { categoryRef: "ind-cat-hotel-fitness" },
    mode: "industry-data-network",
  },
  {
    signalId: "ind-signal-relationship-growth-brand-partner",
    signalType: "RELATIONSHIP_GROWTH",
    subjectId: "ind-rel-partners-lf-tg",
    subjectType: "relationship",
    severity: "medium",
    observedAt: "2026-04-05T10:00:00.000Z",
    status: "active",
    metadata: { relationshipType: "PARTNERS_WITH" },
    mode: "industry-data-network",
  },
];

function resolveSubject(signal: IndustrySignal): boolean {
  if (signal.subjectType === "organization") {
    return getOrganizationById(signal.subjectId) !== undefined;
  }
  if (signal.subjectType === "relationship") {
    return getAllActiveRelationships().some(
      (relationship) => relationship.relationshipId === signal.subjectId,
    );
  }
  return true;
}

export function getAllSignals(): IndustrySignal[] {
  return [...SIGNAL_REGISTRY];
}

export function getSignalById(signalId: string): IndustrySignal | undefined {
  return SIGNAL_REGISTRY.find((signal) => signal.signalId === signalId);
}

export function getSignalsByType(signalType: IndustrySignalType): IndustrySignal[] {
  return SIGNAL_REGISTRY.filter((signal) => signal.signalType === signalType);
}

export function getSignalsBySubject(subjectId: string): IndustrySignal[] {
  return SIGNAL_REGISTRY.filter((signal) => signal.subjectId === subjectId);
}

export function validateSignalRegistry(): RegistryValidation {
  const signals = getAllSignals();
  const requiredTypes: IndustrySignalType[] = [
    "SUPPLY_ACTIVITY",
    "TENDER_INTEREST",
    "NETWORK_CENTRALITY",
    "CATEGORY_SHIFT",
    "RELATIONSHIP_GROWTH",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    signals.some((signal) => signal.signalType === type),
  );
  const subjectLinksValid = signals.every(
    (signal) =>
      signal.signalId.length > 0 &&
      resolveSubject(signal) &&
      signal.status === "active" &&
      signal.mode === "industry-data-network",
  );

  const lfDegree = computeNodeDegree("ind-org-supplier-life-fitness-cn").totalDegree;
  const centralitySignal = getSignalById("ind-signal-centrality-lf-supplier");

  const valid =
    signals.length >= 10 &&
    typeCoverage &&
    subjectLinksValid &&
    centralitySignal !== undefined &&
    lfDegree >= 5;

  return {
    valid,
    count: signals.length,
    summary: `signal-registry count=${signals.length} types=${requiredTypes.filter((t) => signals.some((s) => s.signalType === t)).length}/5 valid=${valid}`,
  };
}
