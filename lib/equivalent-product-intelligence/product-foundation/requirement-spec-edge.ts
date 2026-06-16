import { buildRequirementRegistryRecords } from "@/lib/requirement-intelligence";
import { EPI_CANONICAL_ID } from "../shared/constants";
import type { RequirementSpecificationEdge } from "./product-spec-types";
import { buildSpecificationRegistry } from "./specification-registry";

function buildRequirementDirectEdges(
  specificationsById: Map<string, { id: string; category: string }>,
): RequirementSpecificationEdge[] {
  const edges: RequirementSpecificationEdge[] = [];

  for (const requirement of buildRequirementRegistryRecords()) {
    const specificationId = `epi-spec-req-${requirement.requirementId}`;
    if (!specificationsById.has(specificationId)) continue;

    edges.push({
      edgeId: `epi-edge-req-spec-${requirement.requirementId}`,
      requirementId: requirement.requirementId,
      specificationId,
      confidence: Math.min(
        100,
        Math.round(
          (requirement.matchScore + requirement.coverageScore + requirement.confidenceScore) / 3,
        ),
      ),
      mode: EPI_CANONICAL_ID,
    });
  }

  return edges;
}

function buildCategoryBridgeEdges(
  specificationsById: Map<string, { id: string; category: string; source: string }>,
): RequirementSpecificationEdge[] {
  const edges: RequirementSpecificationEdge[] = [];
  const equipmentSpecs = [...specificationsById.values()].filter(
    (spec) => spec.source === "equipment-intelligence",
  );

  for (const requirement of buildRequirementRegistryRecords()) {
    if (requirement.requirementKind !== "equipment") continue;

    const requirementSpecId = `epi-spec-req-${requirement.requirementId}`;
    const requirementSpec = specificationsById.get(requirementSpecId);
    if (!requirementSpec) continue;

    for (const equipmentSpec of equipmentSpecs) {
      if (equipmentSpec.category !== requirementSpec.category) continue;

      const edgeId = `epi-edge-bridge-${requirement.requirementId}-${equipmentSpec.id}`;
      edges.push({
        edgeId,
        requirementId: requirement.requirementId,
        specificationId: equipmentSpec.id,
        confidence: Math.min(85, Math.round(requirement.matchScore * 0.7)),
        mode: EPI_CANONICAL_ID,
      });
    }
  }

  return edges;
}

let cachedEdges: RequirementSpecificationEdge[] | undefined;

export function buildRequirementSpecificationEdges(): RequirementSpecificationEdge[] {
  if (cachedEdges) return cachedEdges;

  const specifications = buildSpecificationRegistry().specifications;
  const specificationsById = new Map(
    specifications.map((spec) => [spec.id, spec]),
  );

  const seen = new Set<string>();
  const edges: RequirementSpecificationEdge[] = [];

  for (const edge of [
    ...buildRequirementDirectEdges(specificationsById),
    ...buildCategoryBridgeEdges(specificationsById),
  ]) {
    const key = `${edge.requirementId}:${edge.specificationId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    edges.push(edge);
  }

  cachedEdges = edges;
  return edges;
}

export function findRequirementSpecificationEdgesByRequirementId(
  requirementId: string,
): RequirementSpecificationEdge[] {
  return buildRequirementSpecificationEdges().filter(
    (edge) => edge.requirementId === requirementId,
  );
}
