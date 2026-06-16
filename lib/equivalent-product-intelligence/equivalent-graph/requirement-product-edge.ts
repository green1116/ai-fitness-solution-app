import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { EPI_CANONICAL_ID } from "../shared/constants";
import { buildProductSpecContext } from "../product-foundation/product-spec-context";
import type { RequirementProductEdge } from "./equivalent-graph-types";

function computeSpecFitScore(
  requirementSpecIds: Set<string>,
  productSpecIds: string[],
): number {
  if (requirementSpecIds.size === 0 || productSpecIds.length === 0) return 0;
  const overlap = productSpecIds.filter((id) => requirementSpecIds.has(id)).length;
  return Math.round((overlap / requirementSpecIds.size) * 100);
}

let cachedEdges: RequirementProductEdge[] | undefined;

export function buildRequirementProductEdges(): RequirementProductEdge[] {
  if (cachedEdges) return cachedEdges;

  const context = buildProductSpecContext();
  const requirements = buildRequirementRegistryRecords();
  const specIdsByRequirement = new Map<string, Set<string>>();

  for (const edge of context.edges) {
    const existing = specIdsByRequirement.get(edge.requirementId) ?? new Set<string>();
    existing.add(edge.specificationId);
    specIdsByRequirement.set(edge.requirementId, existing);
  }

  const edges: RequirementProductEdge[] = [];

  for (const requirement of requirements) {
    const requirementSpecIds =
      specIdsByRequirement.get(requirement.requirementId) ?? new Set<string>();

    for (const product of context.products) {
      const specFitScore = computeSpecFitScore(requirementSpecIds, product.specifications);
      if (specFitScore === 0) continue;

      const fitScore = Math.min(
        100,
        Math.round(
          (specFitScore +
            requirement.matchScore * 0.3 +
            requirement.coverageScore * 0.2) /
            1.5,
        ),
      );
      const confidence = Math.min(
        100,
        Math.round((specFitScore + requirement.confidenceScore) / 2),
      );

      edges.push({
        edgeId: `epi-req-product-${requirement.requirementId}-${product.id}`,
        requirementId: requirement.requirementId,
        productId: product.id,
        fitScore,
        specFitScore,
        confidence,
        mode: EPI_CANONICAL_ID,
      });
    }
  }

  cachedEdges = edges;
  return edges;
}

export function findRequirementProductEdgesByRequirementId(
  requirementId: string,
): RequirementProductEdge[] {
  return buildRequirementProductEdges().filter(
    (edge) => edge.requirementId === requirementId,
  );
}

export function findRequirementProductEdgesByProductId(
  productId: string,
): RequirementProductEdge[] {
  return buildRequirementProductEdges().filter((edge) => edge.productId === productId);
}
