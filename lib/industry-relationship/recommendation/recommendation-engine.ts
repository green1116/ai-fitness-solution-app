import { getAssignmentsByCategoryId, getAssignmentsByTarget } from "@/lib/industry/classification/category-assignment";
import { getCategoryByCode } from "@/lib/industry/classification/category-registry";
import { getDirectoryEntriesByOrganizationId } from "@/lib/industry/directory/organization-directory";
import {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationsByType,
} from "@/lib/industry/organization-registry";
import { computeNodeDegree } from "../analytics/network-metrics";
import { findNeighbors, findOutbound } from "../graph/graph-traversal";
import { getAllActiveRelationships } from "../relationship-registry";
import type { IndustryRelationshipType } from "../shared/types";
import { buildRecommendationScore, rankCandidates, toRecommendationResult } from "./recommendation-scoring";
import type {
  RecommendationCandidate,
  RecommendationContext,
  RecommendationQuery,
  RecommendationQueryResult,
} from "./types";
import {
  CANONICAL_RECOMMENDATION_ANCHOR,
  INDUSTRY_RECOMMENDATION_VERSION,
} from "./types";

function getCategoryIdsForEntity(entityId: string, entityType: "organization" | "directory-entry"): string[] {
  return getAssignmentsByTarget(entityType, entityId).map((assignment) => assignment.categoryId);
}

function getNeighborSet(nodeId: string): Set<string> {
  return new Set(findNeighbors(nodeId).neighborNodeIds);
}

function sharedNeighborCount(nodeA: string, nodeB: string): number {
  const neighborsA = getNeighborSet(nodeA);
  let shared = 0;
  for (const neighbor of getNeighborSet(nodeB)) {
    if (neighborsA.has(neighbor)) {
      shared += 1;
    }
  }
  return shared;
}

function sharedCategoryCount(entityA: string, entityB: string): number {
  const categoriesA = new Set(getCategoryIdsForEntity(entityA, "organization"));
  const categoriesB = getCategoryIdsForEntity(entityB, "organization");
  return categoriesB.filter((categoryId) => categoriesA.has(categoryId)).length;
}

function makeOrganizationCandidate(
  organizationId: string,
  kind: RecommendationCandidate["candidateKind"],
): RecommendationCandidate | null {
  const organization = getOrganizationById(organizationId);
  if (!organization) {
    return null;
  }

  return {
    candidateId: `rec-candidate-${kind}-${organizationId}`,
    entityId: organizationId,
    entityType: "organization",
    displayName: organization.organizationName,
    candidateKind: kind,
    mode: "industry-recommendation",
  };
}

export function findSimilarOrganizations(
  organizationId: string,
  limit = 5,
): RecommendationQueryResult {
  const anchor = getOrganizationById(organizationId);
  const organizations = getAllOrganizations().filter(
    (organization) =>
      organization.organizationId !== organizationId && organization.status === "active",
  );

  const candidates = organizations
    .map((organization) => makeOrganizationCandidate(organization.organizationId, "similar-organization"))
    .filter((candidate): candidate is RecommendationCandidate => candidate !== null);

  const ranked = rankCandidates(
    candidates,
    (candidate) => {
      const sharedNeighbors = sharedNeighborCount(organizationId, candidate.entityId);
      const sharedCategories = sharedCategoryCount(organizationId, candidate.entityId);
      const degree = computeNodeDegree(candidate.entityId).totalDegree;
      const typeMatch =
        getOrganizationById(candidate.entityId)?.organizationType === anchor?.organizationType ? 15 : 0;
      const score = sharedNeighbors * 20 + sharedCategories * 25 + degree * 3 + typeMatch;

      return buildRecommendationScore({
        candidate,
        score,
        confidence: Math.min(1, (sharedNeighbors + sharedCategories + 1) / 6),
        reasons: [
          `Shared neighbors: ${sharedNeighbors}`,
          `Shared categories: ${sharedCategories}`,
          `Network degree: ${degree}`,
        ],
        signals: { sharedNeighbors, sharedCategories, degree, typeMatch },
      });
    },
    limit,
  );

  return toRecommendationResult({
    queryId: `recommendation-similar-${organizationId}`,
    query: { anchorId: organizationId, recommendationType: "similar", limit },
    ...ranked,
  });
}

export function recommendSuppliers(buyerOrganizationId: string, limit = 5): RecommendationQueryResult {
  const relationships = getAllActiveRelationships();
  const supplierTypes: IndustryRelationshipType[] = ["SUPPLIES", "BID_ON", "SERVES", "DISTRIBUTES"];

  const directSupplierIds = new Set(
    relationships
      .filter(
        (relationship) =>
          relationship.targetId === buyerOrganizationId &&
          supplierTypes.includes(relationship.relationshipType),
      )
      .map((relationship) => relationship.sourceId),
  );

  const similarBuyerIds = findSimilarOrganizations(buyerOrganizationId, 3).candidates.map(
    (candidate) => candidate.entityId,
  );

  const inferredSupplierIds = new Set<string>();
  for (const similarBuyerId of similarBuyerIds) {
    for (const relationship of relationships) {
      if (
        relationship.targetId === similarBuyerId &&
        supplierTypes.includes(relationship.relationshipType)
      ) {
        inferredSupplierIds.add(relationship.sourceId);
      }
    }
  }

  const supplierCandidates = getOrganizationsByType("supplier")
    .map((organization) => makeOrganizationCandidate(organization.organizationId, "supplier"))
    .filter((candidate): candidate is RecommendationCandidate => candidate !== null);

  const ranked = rankCandidates(
    supplierCandidates,
    (candidate) => {
      const directLink = directSupplierIds.has(candidate.entityId) ? 40 : 0;
      const inferredLink = inferredSupplierIds.has(candidate.entityId) ? 25 : 0;
      const degree = computeNodeDegree(candidate.entityId).totalDegree;
      const representsBrand = findOutbound(candidate.entityId).relationships.some(
        (relationship) => relationship.relationshipType === "REPRESENTS",
      )
        ? 10
        : 0;
      const score = directLink + inferredLink + degree * 4 + representsBrand;

      return buildRecommendationScore({
        candidate,
        score,
        confidence: Math.min(1, (directLink + inferredLink + 10) / 75),
        reasons: [
          directLink > 0 ? "Direct supply relationship to buyer" : "Inferred from similar buyers",
          `Network degree: ${degree}`,
          representsBrand > 0 ? "Represents a brand" : "Supplier profile match",
        ],
        signals: { directLink, inferredLink, degree, representsBrand },
      });
    },
    limit,
  );

  return toRecommendationResult({
    queryId: `recommendation-suppliers-${buyerOrganizationId}`,
    query: { anchorId: buyerOrganizationId, recommendationType: "supplier", limit },
    ...ranked,
  });
}

export function recommendBrands(supplierOrganizationId: string, limit = 5): RecommendationQueryResult {
  const outbound = findOutbound(supplierOrganizationId);
  const directBrandIds = new Set(
    outbound.relationships
      .filter((relationship) =>
        ["REPRESENTS", "DISTRIBUTES", "PARTNERS_WITH"].includes(relationship.relationshipType),
      )
      .map((relationship) => relationship.targetId),
  );

  const brandCandidates = getOrganizationsByType("brand")
    .map((organization) => makeOrganizationCandidate(organization.organizationId, "brand"))
    .filter((candidate): candidate is RecommendationCandidate => candidate !== null);

  const ranked = rankCandidates(
    brandCandidates,
    (candidate) => {
      const directLink = directBrandIds.has(candidate.entityId) ? 45 : 0;
      const sharedNeighbors = sharedNeighborCount(supplierOrganizationId, candidate.entityId);
      const degree = computeNodeDegree(candidate.entityId).totalDegree;
      const directoryEntries = getDirectoryEntriesByOrganizationId(candidate.entityId).length;
      const score = directLink + sharedNeighbors * 15 + degree * 3 + directoryEntries * 5;

      return buildRecommendationScore({
        candidate,
        score,
        confidence: Math.min(1, (directLink + sharedNeighbors * 10 + 5) / 60),
        reasons: [
          directLink > 0 ? "Direct brand representation link" : "Brand network proximity",
          `Shared network neighbors: ${sharedNeighbors}`,
          `Directory presence: ${directoryEntries}`,
        ],
        signals: { directLink, sharedNeighbors, degree, directoryEntries },
      });
    },
    limit,
  );

  return toRecommendationResult({
    queryId: `recommendation-brands-${supplierOrganizationId}`,
    query: { anchorId: supplierOrganizationId, recommendationType: "brand", limit },
    ...ranked,
  });
}

export function recommendRelationships(organizationId: string, limit = 5): RecommendationQueryResult {
  const existingTypes = new Set(
    getAllActiveRelationships()
      .filter(
        (relationship) =>
          relationship.sourceId === organizationId || relationship.targetId === organizationId,
      )
      .map((relationship) => relationship.relationshipType),
  );

  const organization = getOrganizationById(organizationId);
  const suggestedTypes: IndustryRelationshipType[] = [];

  if (organization?.organizationType === "buyer") {
    suggestedTypes.push(
      "SUPPLIES",
      "CONSULTS",
      "BID_ON",
      "SERVES",
      "PARTNERS_WITH",
      "DISTRIBUTES",
      "REPRESENTS",
    );
  } else if (organization?.organizationType === "supplier") {
    suggestedTypes.push(
      "REPRESENTS",
      "DISTRIBUTES",
      "SUPPLIES",
      "BID_ON",
      "PARTNERS_WITH",
      "SERVES",
    );
  } else if (organization?.organizationType === "brand") {
    suggestedTypes.push("PARTNERS_WITH", "OWNS", "DISTRIBUTES", "REPRESENTS", "SUPPLIES");
  } else {
    suggestedTypes.push("PARTNERS_WITH", "CONSULTS", "SERVES", "SUPPLIES", "BID_ON");
  }

  const missingTypes = suggestedTypes.filter((type) => !existingTypes.has(type));

  const candidates: RecommendationCandidate[] = missingTypes.map((relationshipType) => ({
    candidateId: `rec-candidate-relationship-${organizationId}-${relationshipType}`,
    entityId: relationshipType,
    entityType: "relationship-type",
    displayName: `Establish ${relationshipType} relationship`,
    candidateKind: "relationship",
    mode: "industry-recommendation",
  }));

  const ranked = rankCandidates(
    candidates,
    (candidate) => {
      const networkUsage = getAllActiveRelationships().filter(
        (relationship) => relationship.relationshipType === candidate.entityId,
      ).length;
      const score = 30 + networkUsage * 5;

      return buildRecommendationScore({
        candidate,
        score,
        confidence: Math.min(1, networkUsage / 5),
        reasons: [
          `Missing ${candidate.entityId} relationship for ${organization?.organizationType ?? "organization"}`,
          `Network usage count: ${networkUsage}`,
        ],
        signals: { networkUsage, missing: 1 },
      });
    },
    limit,
  );

  return toRecommendationResult({
    queryId: `recommendation-relationships-${organizationId}`,
    query: { anchorId: organizationId, recommendationType: "relationship", limit },
    ...ranked,
  });
}

export function recommendByCategory(input: {
  categoryId?: string;
  categoryCode?: string;
  limit?: number;
}): RecommendationQueryResult {
  const limit = input.limit ?? 5;
  const categoryId =
    input.categoryId ??
    (input.categoryCode ? getCategoryByCode(input.categoryCode)?.categoryId : undefined);

  if (!categoryId) {
    return toRecommendationResult({
      queryId: "recommendation-category-empty",
      query: { ...input, recommendationType: "category", limit },
      candidates: [],
      scores: [],
    });
  }

  const assignments = getAssignmentsByCategoryId(categoryId);
  const candidateMap = new Map<string, RecommendationCandidate>();

  for (const assignment of assignments) {
    if (assignment.targetType === "organization") {
      const candidate = makeOrganizationCandidate(assignment.targetId, "category-match");
      if (candidate) {
        candidateMap.set(candidate.entityId, candidate);
      }
    }
  }

  const ranked = rankCandidates(
    [...candidateMap.values()],
    (candidate) => {
      const degree = computeNodeDegree(candidate.entityId).totalDegree;
      const categoryCount = getCategoryIdsForEntity(candidate.entityId, "organization").length;
      const score = 35 + degree * 4 + categoryCount * 8;

      return buildRecommendationScore({
        candidate,
        score,
        confidence: Math.min(1, (degree + categoryCount) / 10),
        reasons: [
          `Matches category assignment`,
          `Network degree: ${degree}`,
          `Total category tags: ${categoryCount}`,
        ],
        signals: { degree, categoryCount },
      });
    },
    limit,
  );

  return toRecommendationResult({
    queryId: `recommendation-category-${categoryId}`,
    query: {
      categoryId,
      categoryCode: input.categoryCode,
      recommendationType: "category",
      limit,
    },
    ...ranked,
  });
}

export function buildRecommendationContext(anchorId: string): RecommendationContext {
  const supplierRec = recommendSuppliers(anchorId, 5);
  const similarRec = findSimilarOrganizations(anchorId, 3);
  const relationshipRec = recommendRelationships(anchorId, 3);

  const candidates = [
    ...supplierRec.candidates,
    ...similarRec.candidates,
    ...relationshipRec.candidates,
  ];
  const scores = [...supplierRec.scores, ...similarRec.scores, ...relationshipRec.scores];

  return {
    contextId: `recommendation-context-${INDUSTRY_RECOMMENDATION_VERSION}-${anchorId}`,
    anchorId,
    candidates,
    scores,
    recommendationReady: candidates.length > 0,
    mode: "industry-recommendation",
  };
}

export function executeRecommendationQuery(query: RecommendationQuery = {}): RecommendationQueryResult {
  const limit = query.limit ?? 5;

  switch (query.recommendationType) {
    case "similar":
      return findSimilarOrganizations(query.anchorId ?? CANONICAL_RECOMMENDATION_ANCHOR, limit);
    case "supplier":
      return recommendSuppliers(query.anchorId ?? CANONICAL_RECOMMENDATION_ANCHOR, limit);
    case "brand":
      return recommendBrands(query.anchorId ?? "ind-org-supplier-life-fitness-cn", limit);
    case "relationship":
      return recommendRelationships(query.anchorId ?? CANONICAL_RECOMMENDATION_ANCHOR, limit);
    case "category":
      return recommendByCategory({
        categoryId: query.categoryId,
        categoryCode: query.categoryCode,
        limit,
      });
    default:
      return recommendSuppliers(CANONICAL_RECOMMENDATION_ANCHOR, limit);
  }
}
