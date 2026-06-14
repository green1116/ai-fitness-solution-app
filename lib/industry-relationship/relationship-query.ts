import {
  getAllActiveRelationships,
  validateRelationshipArchive,
  validateRelationshipRegistry,
} from "./relationship-registry";
import { validateRelationshipContextRegistry } from "./relationship-context";
import type {
  IndustryRelationshipValidation,
  RelationshipQuery,
  RelationshipQueryResult,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_RELATIONSHIP_QUERY } from "./shared/types";

export function queryRelationships(input: RelationshipQuery = {}): RelationshipQueryResult {
  let relationships = getAllActiveRelationships();

  if (input.sourceId) {
    relationships = relationships.filter((relationship) => relationship.sourceId === input.sourceId);
  }

  if (input.targetId) {
    relationships = relationships.filter((relationship) => relationship.targetId === input.targetId);
  }

  if (input.relationshipType) {
    relationships = relationships.filter(
      (relationship) => relationship.relationshipType === input.relationshipType,
    );
  }

  if (input.status) {
    relationships = relationships.filter((relationship) => relationship.status === input.status);
  }

  const queryParts = [
    input.sourceId ?? "all-sources",
    input.targetId ?? "all-targets",
    input.relationshipType ?? "all-types",
    input.status ?? "all-status",
  ];

  return {
    queryId: `relationship-query-${queryParts.join("-")}`,
    query: input,
    relationships,
    hitCount: relationships.length,
    relationshipReady: relationships.length > 0,
  };
}

export function queryRelationshipsBySource(sourceId: string): RelationshipQueryResult {
  return queryRelationships({ sourceId, status: "active" });
}

export function queryRelationshipsByTarget(targetId: string): RelationshipQueryResult {
  return queryRelationships({ targetId, status: "active" });
}

export function queryRelationshipsByType(
  relationshipType: RelationshipQuery["relationshipType"] & string,
): RelationshipQueryResult {
  return queryRelationships({
    relationshipType: relationshipType as NonNullable<RelationshipQuery["relationshipType"]>,
    status: "active",
  });
}

export function validateRelationshipQueryRegistry(): RegistryValidation {
  const canonical = queryRelationships(CANONICAL_RELATIONSHIP_QUERY);
  const lfSource = queryRelationshipsBySource("ind-org-supplier-life-fitness-cn");
  const shTarget = queryRelationshipsByTarget("ind-org-buyer-sh-gym");
  const bidOn = queryRelationshipsByType("BID_ON");
  const serves = queryRelationshipsByType("SERVES");

  const valid =
    canonical.relationshipReady &&
    canonical.hitCount >= 1 &&
    lfSource.hitCount >= 4 &&
    shTarget.hitCount >= 4 &&
    bidOn.hitCount >= 2 &&
    serves.hitCount >= 2;

  return {
    valid,
    count: canonical.hitCount,
    summary: `relationship-query canonical=${canonical.hitCount} lfSource=${lfSource.hitCount} shTarget=${shTarget.hitCount} bidOn=${bidOn.hitCount} valid=${valid}`,
  };
}

export function validateIndustryRelationship(): IndustryRelationshipValidation {
  const relationshipRegistry = validateRelationshipRegistry();
  const relationshipContext = validateRelationshipContextRegistry();
  const relationshipQuery = validateRelationshipQueryRegistry();
  const relationshipArchive = validateRelationshipArchive();

  return {
    valid:
      relationshipRegistry.valid &&
      relationshipContext.valid &&
      relationshipQuery.valid &&
      relationshipArchive.valid,
    relationshipRegistry,
    relationshipContext,
    relationshipQuery,
    relationshipArchive,
  };
}
