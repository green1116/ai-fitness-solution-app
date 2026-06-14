import { getDirectoryEntryById } from "@/lib/industry/directory/organization-directory";
import { getOrganizationById } from "@/lib/industry/organization-registry";
import { getAllActiveRelationships } from "@/lib/industry-relationship/relationship-registry";
import type { IndustryEvent, IndustryEventType, RegistryValidation } from "./shared/types";

export const EVENT_REGISTRY: IndustryEvent[] = [
  {
    eventId: "ind-event-rel-supplies-lf-sh",
    eventType: "RELATIONSHIP_ESTABLISHED",
    subjectId: "ind-rel-supplies-lf-sh",
    subjectType: "relationship",
    occurredAt: "2026-03-01T00:00:00.000Z",
    status: "active",
    metadata: { relationshipType: "SUPPLIES", sourceId: "ind-org-supplier-life-fitness-cn" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-bid-lf-gym",
    eventType: "BID_SUBMITTED",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    occurredAt: "2026-03-05T00:00:00.000Z",
    status: "active",
    metadata: { tenderRef: "tender-sh-commercial-gym-2025-001", relationshipRef: "ind-rel-bid-lf-gym" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-bid-tg-hotel",
    eventType: "BID_SUBMITTED",
    subjectId: "ind-org-supplier-technogym-cn",
    subjectType: "organization",
    occurredAt: "2026-03-05T00:00:00.000Z",
    status: "active",
    metadata: { tenderRef: "tender-bj-hotel-2025-002", relationshipRef: "ind-rel-bid-tg-hotel" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-supplier-linked-lf-brand",
    eventType: "SUPPLIER_LINKED",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    occurredAt: "2026-03-02T00:00:00.000Z",
    status: "active",
    metadata: { brandRef: "ind-org-brand-life-fitness", linkType: "REPRESENTS" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-directory-lf-brand",
    eventType: "DIRECTORY_PUBLISHED",
    subjectId: "ind-dir-brand-life-fitness",
    subjectType: "directory-entry",
    occurredAt: "2026-02-01T00:00:00.000Z",
    status: "active",
    metadata: { organizationRef: "ind-org-brand-life-fitness", portalLayer: "v26-brand-portal" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-directory-buyer-sh",
    eventType: "DIRECTORY_PUBLISHED",
    subjectId: "ind-dir-buyer-sh-gym",
    subjectType: "directory-entry",
    occurredAt: "2026-02-03T00:00:00.000Z",
    status: "active",
    metadata: { organizationRef: "ind-org-buyer-sh-gym", portalLayer: "v28-tender-marketplace" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-recommendation-lf-supplier",
    eventType: "RECOMMENDATION_MATCH",
    subjectId: "ind-org-supplier-life-fitness-cn",
    subjectType: "organization",
    occurredAt: "2026-04-06T08:00:00.000Z",
    status: "active",
    metadata: { buyerRef: "ind-org-buyer-sh-gym", recommendationLayer: "v31-recommendation" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-rel-consults-sh",
    eventType: "RELATIONSHIP_ESTABLISHED",
    subjectId: "ind-rel-consults-sh",
    subjectType: "relationship",
    occurredAt: "2026-03-03T00:00:00.000Z",
    status: "active",
    metadata: { relationshipType: "CONSULTS", consultantRef: "ind-org-consultant-fitness-advisory" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-recommendation-tg-supplier",
    eventType: "RECOMMENDATION_MATCH",
    subjectId: "ind-org-supplier-technogym-cn",
    subjectType: "organization",
    occurredAt: "2026-04-06T09:00:00.000Z",
    status: "active",
    metadata: { buyerRef: "ind-org-buyer-bj-hotel", recommendationLayer: "v31-recommendation" },
    mode: "industry-data-network",
  },
  {
    eventId: "ind-event-supplier-linked-tg-brand",
    eventType: "SUPPLIER_LINKED",
    subjectId: "ind-org-supplier-technogym-cn",
    subjectType: "organization",
    occurredAt: "2026-03-02T00:00:00.000Z",
    status: "active",
    metadata: { brandRef: "ind-org-brand-technogym", linkType: "REPRESENTS" },
    mode: "industry-data-network",
  },
];

function resolveSubject(event: IndustryEvent): boolean {
  if (event.subjectType === "organization") {
    return getOrganizationById(event.subjectId) !== undefined;
  }
  if (event.subjectType === "directory-entry") {
    return getDirectoryEntryById(event.subjectId) !== undefined;
  }
  return getAllActiveRelationships().some(
    (relationship) => relationship.relationshipId === event.subjectId,
  );
}

export function getAllEvents(): IndustryEvent[] {
  return [...EVENT_REGISTRY];
}

export function getEventById(eventId: string): IndustryEvent | undefined {
  return EVENT_REGISTRY.find((event) => event.eventId === eventId);
}

export function getEventsByType(eventType: IndustryEventType): IndustryEvent[] {
  return EVENT_REGISTRY.filter((event) => event.eventType === eventType);
}

export function getEventsBySubject(subjectId: string): IndustryEvent[] {
  return EVENT_REGISTRY.filter((event) => event.subjectId === subjectId);
}

export function validateEventRegistry(): RegistryValidation {
  const events = getAllEvents();
  const requiredTypes: IndustryEventType[] = [
    "RELATIONSHIP_ESTABLISHED",
    "BID_SUBMITTED",
    "SUPPLIER_LINKED",
    "DIRECTORY_PUBLISHED",
    "RECOMMENDATION_MATCH",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    events.some((event) => event.eventType === type),
  );
  const subjectLinksValid = events.every(
    (event) =>
      event.eventId.length > 0 &&
      resolveSubject(event) &&
      event.status === "active" &&
      event.mode === "industry-data-network",
  );

  const valid = events.length >= 10 && typeCoverage && subjectLinksValid;

  return {
    valid,
    count: events.length,
    summary: `event-registry count=${events.length} types=${requiredTypes.filter((t) => events.some((e) => e.eventType === t)).length}/5 valid=${valid}`,
  };
}
