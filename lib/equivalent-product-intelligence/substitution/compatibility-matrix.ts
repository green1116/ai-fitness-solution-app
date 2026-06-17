import { buildAllEquivalentProductEdges } from "../equivalent-graph/equivalent-mapping-builder";
import { findSpecificationsByRequirement } from "../product-foundation/product-spec-context";
import { findSpecificationById } from "../product-foundation/specification-registry";
import { EPI_CANONICAL_ID, EPI_COMPATIBLE_RATIO, EPI_PARTIAL_RATIO } from "../shared/constants";
import type { CompatibilityLevel, CompatibilityMatrix } from "./substitution-types";
import { resolveProductWithSpecifications } from "./substitution-context";

function resolveProduct(productId: string) {
  return resolveProductWithSpecifications(productId);
}

function resolveCompatibilityLevel(specMatchRatio: number): CompatibilityLevel {
  if (specMatchRatio >= EPI_COMPATIBLE_RATIO) return "compatible";
  if (specMatchRatio >= EPI_PARTIAL_RATIO) return "partial";
  return "incompatible";
}

export function buildCompatibilityMatrix(
  sourceProductId: string,
  targetProductId: string,
  requirementId?: string,
): CompatibilityMatrix {
  const source = resolveProduct(sourceProductId);
  const target = resolveProduct(targetProductId);

  if (!source || !target) {
    return {
      matrixId: `epi-compat-${sourceProductId}-${targetProductId}`,
      requirementId,
      sourceProductId,
      targetProductId,
      specMatches: 0,
      specGaps: 0,
      specExcess: 0,
      totalSpecs: 0,
      compatibilityLevel: "incompatible",
      specMatchRatio: 0,
      mode: EPI_CANONICAL_ID,
    };
  }

  let baselineSpecIds: string[];

  if (requirementId) {
    baselineSpecIds = findSpecificationsByRequirement(requirementId).map((spec) => spec.id);
    if (baselineSpecIds.length === 0) {
      baselineSpecIds = source.specifications;
    }
  } else {
    baselineSpecIds =
      source.specifications.length > 0
        ? source.specifications
        : [...new Set([...source.specifications, ...target.specifications])];
  }

  const targetSpecIds = new Set(target.specifications);
  const baselineSet = new Set(baselineSpecIds);
  const specMatches = baselineSpecIds.filter((specId) => targetSpecIds.has(specId)).length;
  const specGaps = baselineSpecIds.filter((specId) => !targetSpecIds.has(specId)).length;
  const specExcess = [...targetSpecIds].filter((specId) => !baselineSet.has(specId)).length;
  const totalSpecs = Math.max(baselineSpecIds.length, 1);
  let specMatchRatio = specMatches / totalSpecs;

  const equivalentEdge = buildAllEquivalentProductEdges().find(
    (edge) =>
      edge.sourceProductId === sourceProductId && edge.targetProductId === targetProductId,
  );
  if (equivalentEdge && specMatchRatio < EPI_PARTIAL_RATIO) {
    if (
      equivalentEdge.kind === "functional-substitute" ||
      equivalentEdge.kind === "cross-brand-equivalent" ||
      equivalentEdge.kind === "upgrade-substitute"
    ) {
      specMatchRatio = Math.max(specMatchRatio, 0.55);
    } else if (
      equivalentEdge.kind === "downgrade-substitute" ||
      equivalentEdge.kind === "emergency-substitute"
    ) {
      specMatchRatio = Math.max(specMatchRatio, 0.45);
    }
  }

  return {
    matrixId: `epi-compat-${sourceProductId}-${targetProductId}${requirementId ? `-${requirementId}` : ""}`,
    requirementId,
    sourceProductId,
    targetProductId,
    specMatches,
    specGaps,
    specExcess,
    totalSpecs,
    compatibilityLevel: resolveCompatibilityLevel(specMatchRatio),
    specMatchRatio: Math.round(specMatchRatio * 100) / 100,
    mode: EPI_CANONICAL_ID,
  };
}

export function resolveCompatibilityLevelFromRatio(ratio: number): CompatibilityLevel {
  return resolveCompatibilityLevel(ratio);
}

export function getSpecificationLabel(specId: string): string {
  return findSpecificationById(specId)?.name ?? specId;
}
