import { findRequirementById } from "@/lib/requirement-intelligence";
import { findEquivalentProducts } from "../equivalent-graph/equivalent-mapping-builder";
import {
  findRequirementProductEdgesByRequirementId,
} from "../equivalent-graph/requirement-product-edge";
import { EPI_CANONICAL_ID } from "../shared/constants";
import type { RequirementProductMatch } from "./equivalent-decision-types";

const cachedMatches = new Map<string, RequirementProductMatch>();

export function matchRequirementToProduct(requirementId: string): RequirementProductMatch | undefined {
  const cached = cachedMatches.get(requirementId);
  if (cached) return cached;

  const requirement = findRequirementById(requirementId);
  if (!requirement) return undefined;

  const productEdges = findRequirementProductEdgesByRequirementId(requirementId);
  if (productEdges.length === 0) return undefined;

  const primaryEdge = [...productEdges].sort((a, b) => b.fitScore - a.fitScore)[0]!;
  const equivalentEdges = findEquivalentProducts(primaryEdge.productId);
  const equivalentProductIds = equivalentEdges.map((edge) => edge.targetProductId);

  const match: RequirementProductMatch = {
    matchId: `epi-req-product-match-${requirementId}`,
    requirementId,
    primaryProductId: primaryEdge.productId,
    equivalentProductIds,
    specFitScore: primaryEdge.specFitScore,
    fitScore: primaryEdge.fitScore,
    confidence: primaryEdge.confidence,
    mode: EPI_CANONICAL_ID,
  };

  cachedMatches.set(requirementId, match);
  return match;
}

export function findPrimaryProductForRequirement(requirementId: string): string | undefined {
  return matchRequirementToProduct(requirementId)?.primaryProductId;
}

export function findEquivalentProductsForRequirement(requirementId: string): string[] {
  return matchRequirementToProduct(requirementId)?.equivalentProductIds ?? [];
}
