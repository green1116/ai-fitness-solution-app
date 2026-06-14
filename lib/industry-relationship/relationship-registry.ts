import { getDirectoryEntryById } from "@/lib/industry/directory/organization-directory";
import { getOrganizationById } from "@/lib/industry/organization-registry";
import type {
  IndustryRelationship,
  IndustryRelationshipArchiveEntry,
  IndustryRelationshipType,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_RELATIONSHIP_ID } from "./shared/types";

export const RELATIONSHIP_REGISTRY: IndustryRelationship[] = [
  {
    relationshipId: "ind-rel-supplies-lf-sh",
    sourceId: "ind-org-supplier-life-fitness-cn",
    targetId: "ind-org-buyer-sh-gym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "SUPPLIES",
    status: "active",
    createdAt: "2026-03-01T00:00:00.000Z",
    metadata: { region: "East China", channel: "direct-supply" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-supplies-tg-bj",
    sourceId: "ind-org-supplier-technogym-cn",
    targetId: "ind-org-buyer-bj-hotel",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "SUPPLIES",
    status: "active",
    createdAt: "2026-03-01T00:00:00.000Z",
    metadata: { region: "North China", channel: "project-supply" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-distributes-lf-brand",
    sourceId: "ind-org-supplier-life-fitness-cn",
    targetId: "ind-org-brand-life-fitness",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "DISTRIBUTES",
    status: "active",
    createdAt: "2026-03-02T00:00:00.000Z",
    metadata: { territory: "China", tier: "national-distributor" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-represents-lf",
    sourceId: "ind-org-supplier-life-fitness-cn",
    targetId: "ind-org-brand-life-fitness",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "REPRESENTS",
    status: "active",
    createdAt: "2026-03-02T00:00:00.000Z",
    metadata: { representationScope: "China", portalLayer: "v27-supplier-portal" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-represents-tg",
    sourceId: "ind-org-supplier-technogym-cn",
    targetId: "ind-org-brand-technogym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "REPRESENTS",
    status: "active",
    createdAt: "2026-03-02T00:00:00.000Z",
    metadata: { representationScope: "China", portalLayer: "v27-supplier-portal" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-consults-sh",
    sourceId: "ind-org-consultant-fitness-advisory",
    targetId: "ind-org-buyer-sh-gym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "CONSULTS",
    status: "active",
    createdAt: "2026-03-03T00:00:00.000Z",
    metadata: { engagement: "commercial-gym-planning", region: "East China" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-consults-bj",
    sourceId: "ind-org-consultant-fitness-advisory",
    targetId: "ind-org-buyer-bj-hotel",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "CONSULTS",
    status: "active",
    createdAt: "2026-03-03T00:00:00.000Z",
    metadata: { engagement: "hotel-fitness-advisory", region: "North China" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-owns-lf-mfg",
    sourceId: "ind-org-brand-life-fitness",
    targetId: "ind-dir-manufacturer-lf-global",
    sourceType: "organization",
    targetType: "directory-entry",
    relationshipType: "OWNS",
    status: "active",
    createdAt: "2026-03-04T00:00:00.000Z",
    metadata: { ownershipScope: "global-manufacturing" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-partners-lf-tg",
    sourceId: "ind-org-brand-life-fitness",
    targetId: "ind-org-brand-technogym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "PARTNERS_WITH",
    status: "active",
    createdAt: "2026-03-04T00:00:00.000Z",
    metadata: { partnershipType: "co-marketing", region: "East China" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-bid-tg-hotel",
    sourceId: "ind-org-supplier-technogym-cn",
    targetId: "ind-org-buyer-bj-hotel",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "BID_ON",
    status: "active",
    createdAt: "2026-03-05T00:00:00.000Z",
    metadata: { tenderRef: "tender-bj-hotel-2025-002", portalLayer: "v28-tender-marketplace" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-bid-lf-gym",
    sourceId: "ind-org-supplier-life-fitness-cn",
    targetId: "ind-org-buyer-sh-gym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "BID_ON",
    status: "active",
    createdAt: "2026-03-05T00:00:00.000Z",
    metadata: { tenderRef: "tender-sh-commercial-gym-2025-001", portalLayer: "v28-tender-marketplace" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-serves-lf-sh",
    sourceId: "ind-org-supplier-life-fitness-cn",
    targetId: "ind-org-buyer-sh-gym",
    sourceType: "organization",
    targetType: "organization",
    relationshipType: "SERVES",
    status: "active",
    createdAt: "2026-03-06T00:00:00.000Z",
    metadata: { serviceScope: "maintenance-and-installation", region: "East China" },
    mode: "industry-relationship",
  },
  {
    relationshipId: "ind-rel-serves-contractor-fitout",
    sourceId: "ind-dir-contractor-sh-fitout",
    targetId: "ind-dir-buyer-sh-gym",
    sourceType: "directory-entry",
    targetType: "directory-entry",
    relationshipType: "SERVES",
    status: "active",
    createdAt: "2026-03-06T00:00:00.000Z",
    metadata: { serviceScope: "gym-fit-out", contractorFor: "ind-org-buyer-sh-gym" },
    mode: "industry-relationship",
  },
];

export const ARCHIVED_RELATIONSHIP_REGISTRY: IndustryRelationshipArchiveEntry[] = [
  {
    archiveId: "ind-rel-archive-partners-matrix-lf",
    relationship: {
      relationshipId: "ind-rel-partners-matrix-lf",
      sourceId: "ind-org-brand-matrix",
      targetId: "ind-org-brand-life-fitness",
      sourceType: "organization",
      targetType: "organization",
      relationshipType: "PARTNERS_WITH",
      status: "archived",
      createdAt: "2025-06-01T00:00:00.000Z",
      metadata: { partnershipType: "regional-co-marketing", endedReason: "strategy-shift" },
      mode: "industry-relationship",
    },
    archivedAt: "2026-01-15T00:00:00.000Z",
    reason: "Partnership concluded after regional strategy realignment",
    mode: "industry-relationship",
  },
  {
    archiveId: "ind-rel-archive-bid-matrix-hotel",
    relationship: {
      relationshipId: "ind-rel-bid-matrix-hotel",
      sourceId: "ind-org-brand-matrix",
      targetId: "ind-org-buyer-bj-hotel",
      sourceType: "organization",
      targetType: "organization",
      relationshipType: "BID_ON",
      status: "archived",
      createdAt: "2025-08-01T00:00:00.000Z",
      metadata: { tenderRef: "tender-bj-hotel-2024-legacy", outcome: "not-awarded" },
      mode: "industry-relationship",
    },
    archivedAt: "2025-12-01T00:00:00.000Z",
    reason: "Bid cycle closed without award",
    mode: "industry-relationship",
  },
];

function resolveEndpoint(
  endpointId: string,
  endpointType: IndustryRelationship["sourceType"],
): boolean {
  if (endpointType === "organization") {
    return getOrganizationById(endpointId) !== undefined;
  }
  return getDirectoryEntryById(endpointId) !== undefined;
}

export function getAllActiveRelationships(): IndustryRelationship[] {
  return [...RELATIONSHIP_REGISTRY];
}

export function getRelationshipById(relationshipId: string): IndustryRelationship | undefined {
  return RELATIONSHIP_REGISTRY.find((relationship) => relationship.relationshipId === relationshipId);
}

export function getRelationshipsByType(
  relationshipType: IndustryRelationshipType,
): IndustryRelationship[] {
  return RELATIONSHIP_REGISTRY.filter((relationship) => relationship.relationshipType === relationshipType);
}

export function getArchivedRelationships(): IndustryRelationship[] {
  return ARCHIVED_RELATIONSHIP_REGISTRY.map((entry) => entry.relationship);
}

export function getRelationshipArchiveById(
  archiveId: string,
): IndustryRelationshipArchiveEntry | undefined {
  return ARCHIVED_RELATIONSHIP_REGISTRY.find((entry) => entry.archiveId === archiveId);
}

export function archiveRelationship(relationshipId: string): IndustryRelationshipArchiveEntry | null {
  const archived = ARCHIVED_RELATIONSHIP_REGISTRY.find(
    (entry) => entry.relationship.relationshipId === relationshipId,
  );
  if (archived) {
    return archived;
  }

  const active = getRelationshipById(relationshipId);
  if (!active) {
    return null;
  }

  return {
    archiveId: `ind-rel-archive-sim-${relationshipId}`,
    relationship: { ...active, status: "archived" },
    archivedAt: "2026-06-13T00:00:00.000Z",
    reason: "Simulated archive for runtime description layer",
    mode: "industry-relationship",
  };
}

export function validateRelationshipRegistry(): RegistryValidation {
  const relationships = getAllActiveRelationships();
  const requiredTypes: IndustryRelationshipType[] = [
    "SUPPLIES",
    "DISTRIBUTES",
    "REPRESENTS",
    "CONSULTS",
    "OWNS",
    "PARTNERS_WITH",
    "BID_ON",
    "SERVES",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    relationships.some((relationship) => relationship.relationshipType === type),
  );

  const endpointValid = relationships.every(
    (relationship) =>
      relationship.relationshipId.length > 0 &&
      resolveEndpoint(relationship.sourceId, relationship.sourceType) &&
      resolveEndpoint(relationship.targetId, relationship.targetType) &&
      relationship.status === "active" &&
      relationship.mode === "industry-relationship",
  );

  const canonical = getRelationshipById(CANONICAL_RELATIONSHIP_ID);
  const valid =
    relationships.length >= 13 && typeCoverage && endpointValid && canonical !== undefined;

  return {
    valid,
    count: relationships.length,
    summary: `relationship-registry count=${relationships.length} types=${requiredTypes.filter((t) => relationships.some((r) => r.relationshipType === t)).length}/8 valid=${valid}`,
  };
}

export function validateRelationshipArchive(): RegistryValidation {
  const archived = ARCHIVED_RELATIONSHIP_REGISTRY;
  const archiveLookup = archiveRelationship("ind-rel-partners-matrix-lf");
  const simulatedArchive = archiveRelationship("ind-rel-supplies-lf-sh");

  const fieldValid = archived.every(
    (entry) =>
      entry.archiveId.length > 0 &&
      entry.reason.length > 0 &&
      entry.relationship.status === "archived" &&
      resolveEndpoint(entry.relationship.sourceId, entry.relationship.sourceType) &&
      resolveEndpoint(entry.relationship.targetId, entry.relationship.targetType),
  );

  const valid =
    archived.length >= 2 &&
    fieldValid &&
    archiveLookup !== null &&
    archiveLookup.relationship.status === "archived" &&
    simulatedArchive !== null &&
    simulatedArchive.relationship.status === "archived";

  return {
    valid,
    count: archived.length,
    summary: `relationship-archive count=${archived.length} lookup=${archiveLookup !== null} simulate=${simulatedArchive !== null} valid=${valid}`,
  };
}
