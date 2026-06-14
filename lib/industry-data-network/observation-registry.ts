import { getDirectoryEntryById } from "@/lib/industry/directory/organization-directory";
import { getOrganizationById } from "@/lib/industry/organization-registry";
import { getAllActiveRelationships } from "@/lib/industry-relationship/relationship-registry";
import { getEventById } from "./event-registry";
import { getSignalById } from "./signal-registry";
import type { IndustryObservation, RegistryValidation } from "./shared/types";

export const OBSERVATION_REGISTRY: IndustryObservation[] = [
  {
    observationId: "ind-obs-lf-supplier-network",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    signalIds: [
      "ind-signal-supply-lf-sh",
      "ind-signal-centrality-lf-supplier",
    ],
    eventIds: [
      "ind-event-rel-supplies-lf-sh",
      "ind-event-bid-lf-gym",
      "ind-event-supplier-linked-lf-brand",
      "ind-event-recommendation-lf-supplier",
    ],
    summary: "High-activity supplier hub with supply, bid, and recommendation signals",
    observedAt: "2026-04-06T12:00:00.000Z",
    status: "active",
    metadata: { networkRole: "supplier-hub", region: "East China" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-sh-gym-buyer",
    subjectId: "ind-org-buyer-sh-gym",
    subjectType: "organization",
    signalIds: ["ind-signal-tender-lf-gym", "ind-signal-category-gym-buyer"],
    eventIds: ["ind-event-directory-buyer-sh"],
    summary: "Commercial gym buyer with active tender and category signals",
    observedAt: "2026-04-06T12:30:00.000Z",
    status: "active",
    metadata: { venueType: "commercial-gym", tenderActive: "true" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-tg-supplier-network",
    subjectId: "ind-org-supplier-technogym-cn",
    subjectType: "organization",
    signalIds: ["ind-signal-supply-tg-bj"],
    eventIds: [
      "ind-event-bid-tg-hotel",
      "ind-event-supplier-linked-tg-brand",
      "ind-event-recommendation-tg-supplier",
    ],
    summary: "Technogym supplier linked to hotel buyer and brand representation",
    observedAt: "2026-04-06T13:00:00.000Z",
    status: "active",
    metadata: { networkRole: "regional-supplier", region: "North China" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-bj-hotel-buyer",
    subjectId: "ind-org-buyer-bj-hotel",
    subjectType: "organization",
    signalIds: ["ind-signal-tender-bj-hotel", "ind-signal-category-hotel-buyer"],
    eventIds: [],
    summary: "Hotel fitness buyer with tender interest observation",
    observedAt: "2026-04-06T13:30:00.000Z",
    status: "active",
    metadata: { venueType: "hotel" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-supply-relationship-lf-sh",
    subjectId: "ind-rel-supplies-lf-sh",
    subjectType: "relationship",
    signalIds: ["ind-signal-relationship-growth-lf"],
    eventIds: ["ind-event-rel-supplies-lf-sh"],
    summary: "Core supply relationship between LF supplier and Shanghai gym buyer",
    observedAt: "2026-04-06T14:00:00.000Z",
    status: "active",
    metadata: { relationshipType: "SUPPLIES" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-brand-partnership",
    subjectId: "ind-rel-partners-lf-tg",
    subjectType: "relationship",
    signalIds: ["ind-signal-relationship-growth-brand-partner"],
    eventIds: [],
    summary: "Brand partnership relationship growth signal",
    observedAt: "2026-04-06T14:30:00.000Z",
    status: "active",
    metadata: { relationshipType: "PARTNERS_WITH" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-consultant-advisory",
    subjectId: "ind-org-consultant-fitness-advisory",
    subjectType: "organization",
    signalIds: ["ind-signal-centrality-consultant"],
    eventIds: ["ind-event-rel-consults-sh"],
    summary: "Consultant organization with multi-buyer advisory footprint",
    observedAt: "2026-04-06T15:00:00.000Z",
    status: "active",
    metadata: { engagement: "advisory" },
    mode: "industry-data-network",
  },
  {
    observationId: "ind-obs-lf-brand-directory",
    subjectId: "ind-dir-brand-life-fitness",
    subjectType: "directory-entry",
    signalIds: [],
    eventIds: ["ind-event-directory-lf-brand"],
    summary: "Life Fitness brand directory publication event captured",
    observedAt: "2026-04-06T15:30:00.000Z",
    status: "active",
    metadata: { portalLayer: "v26-brand-portal" },
    mode: "industry-data-network",
  },
];

function resolveSubject(observation: IndustryObservation): boolean {
  if (observation.subjectType === "organization") {
    return getOrganizationById(observation.subjectId) !== undefined;
  }
  if (observation.subjectType === "relationship") {
    return getAllActiveRelationships().some(
      (relationship) => relationship.relationshipId === observation.subjectId,
    );
  }
  return getDirectoryEntryById(observation.subjectId) !== undefined;
}

export function getAllObservations(): IndustryObservation[] {
  return [...OBSERVATION_REGISTRY];
}

export function getObservationById(observationId: string): IndustryObservation | undefined {
  return OBSERVATION_REGISTRY.find((observation) => observation.observationId === observationId);
}

export function getObservationsBySubject(subjectId: string): IndustryObservation[] {
  return OBSERVATION_REGISTRY.filter((observation) => observation.subjectId === subjectId);
}

export function validateObservationRegistry(): RegistryValidation {
  const observations = getAllObservations();

  const linkValid = observations.every(
    (observation) =>
      observation.observationId.length > 0 &&
      observation.summary.length > 0 &&
      observation.signalIds.every((signalId) => getSignalById(signalId) !== undefined || signalId.length === 0) &&
      observation.eventIds.every((eventId) => getEventById(eventId) !== undefined || eventId.length === 0) &&
      resolveSubject(observation) &&
      observation.status === "active" &&
      observation.mode === "industry-data-network",
  );

  const orgObservations = observations.filter(
    (observation) => observation.subjectType === "organization",
  );
  const relationshipObservations = observations.filter(
    (observation) => observation.subjectType === "relationship",
  );

  const valid =
    observations.length >= 8 &&
    orgObservations.length >= 4 &&
    relationshipObservations.length >= 2 &&
    linkValid;

  return {
    valid,
    count: observations.length,
    summary: `observation-registry count=${observations.length} org=${orgObservations.length} relationship=${relationshipObservations.length} valid=${valid}`,
  };
}
