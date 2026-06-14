import {
  getAllActiveRelationships,
  getArchivedRelationships,
  getRelationshipById,
} from "./relationship-registry";
import type { IndustryRelationshipContext, IndustryRelationshipType, RegistryValidation } from "./shared/types";
import {
  CANONICAL_RELATIONSHIP_ID,
  INDUSTRY_RELATIONSHIP_TAG,
  INDUSTRY_RELATIONSHIP_VERSION,
} from "./shared/types";

function buildTypeBreakdown(
  relationships: ReturnType<typeof getAllActiveRelationships>,
): Record<IndustryRelationshipType, number> {
  const breakdown: Record<IndustryRelationshipType, number> = {
    SUPPLIES: 0,
    DISTRIBUTES: 0,
    REPRESENTS: 0,
    CONSULTS: 0,
    OWNS: 0,
    PARTNERS_WITH: 0,
    BID_ON: 0,
    SERVES: 0,
  };

  for (const relationship of relationships) {
    breakdown[relationship.relationshipType] += 1;
  }

  return breakdown;
}

export function buildIndustryRelationshipContext(): IndustryRelationshipContext {
  const relationships = getAllActiveRelationships();
  const archivedRelationships = getArchivedRelationships();

  return {
    contextId: `industry-relationship-context-${INDUSTRY_RELATIONSHIP_VERSION}`,
    relationships,
    archivedRelationships,
    typeBreakdown: buildTypeBreakdown(relationships),
    totalActive: relationships.length,
    totalArchived: archivedRelationships.length,
    mode: "industry-relationship",
  };
}

export function validateIndustryRelationshipContext(context: IndustryRelationshipContext): boolean {
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

  return (
    context.totalActive >= 13 &&
    context.totalArchived >= 2 &&
    context.relationships.length === context.totalActive &&
    context.archivedRelationships.length === context.totalArchived &&
    requiredTypes.every((type) => context.typeBreakdown[type] > 0) &&
    getRelationshipById(CANONICAL_RELATIONSHIP_ID) !== undefined &&
    context.mode === "industry-relationship"
  );
}

export function validateRelationshipContextRegistry(): RegistryValidation {
  const context = buildIndustryRelationshipContext();
  const valid =
    validateIndustryRelationshipContext(context) &&
    INDUSTRY_RELATIONSHIP_VERSION === "v31-industry-relationship-1" &&
    INDUSTRY_RELATIONSHIP_TAG === "v31-industry-relationship-foundation";

  return {
    valid,
    count: context.totalActive,
    summary: `relationship-context active=${context.totalActive} archived=${context.totalArchived} types=8/8 valid=${valid}`,
  };
}
