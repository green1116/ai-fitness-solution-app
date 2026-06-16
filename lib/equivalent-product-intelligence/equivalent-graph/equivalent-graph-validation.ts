import { findProductById } from "../product-foundation/product-registry";
import {
  EPI_P2_MIN_AVG_MAPPING_PER_PRODUCT,
  EPI_P2_MIN_CROSS_BRAND_COVERAGE,
  EPI_P2_MIN_EQUIVALENT_EDGE_COUNT,
  EPI_P2_PHASE,
  EPI_P2_TAG,
  EPI_P2_VERSION,
} from "../shared/constants";
import { validateEquivalentProductIntelligencePhase1 } from "../product-foundation/product-spec-validation";
import { buildEquivalentGraph } from "./equivalent-graph-context";
import { buildAllEquivalentProductEdges } from "./equivalent-mapping-builder";
import type {
  EquivalentMappingValidation,
  EquivalentProductIntelligencePhase2FreezeMeta,
  EquivalentProductIntelligencePhase2Validation,
} from "./equivalent-graph-types";

function isEquipmentCategory(category: string): boolean {
  return [
    "cardio",
    "strength",
    "functional",
    "group-training",
    "recovery",
    "equipment",
    "smart-connected",
  ].includes(category);
}

function isCrossBrandEdge(edge: {
  sourceProductId: string;
  targetProductId: string;
}): boolean {
  const source = findProductById(edge.sourceProductId);
  const target = findProductById(edge.targetProductId);
  if (!source?.brandId || !target?.brandId) return false;
  return source.brandId !== target.brandId;
}

function validateGraphConnectivity(
  edges: ReturnType<typeof buildAllEquivalentProductEdges>,
  productIds: string[],
): boolean {
  if (edges.length === 0 || productIds.length === 0) return false;

  const activeProductIds = productIds.filter((id) =>
    edges.some(
      (edge) => edge.sourceProductId === id || edge.targetProductId === id,
    ),
  );
  if (activeProductIds.length === 0) return false;

  const adjacency = new Map<string, Set<string>>();
  for (const productId of activeProductIds) {
    adjacency.set(productId, new Set());
  }

  for (const edge of edges) {
    if (!adjacency.has(edge.sourceProductId) || !adjacency.has(edge.targetProductId)) {
      continue;
    }
    adjacency.get(edge.sourceProductId)!.add(edge.targetProductId);
    adjacency.get(edge.targetProductId)!.add(edge.sourceProductId);
  }

  const start = activeProductIds[0]!;
  const visited = new Set<string>([start]);
  const queue = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of adjacency.get(current) ?? []) {
      if (visited.has(neighbor)) continue;
      visited.add(neighbor);
      queue.push(neighbor);
    }
  }

  return activeProductIds.every((id) => visited.has(id));
}

let cachedPhase2Validation: EquivalentProductIntelligencePhase2Validation | undefined;

export function validateEquivalentMappingPhase2(): EquivalentMappingValidation {
  const graph = buildEquivalentGraph();
  const edges = graph.equivalentEdges;
  const equipmentProductIds = graph.nodes
    .filter((node) => node.nodeType === "product")
    .map((node) => node.productId)
    .filter((productId) => {
      const product = findProductById(productId);
      return Boolean(
        product &&
          (product.specifications.length > 0 || isEquipmentCategory(product.category)),
      );
    });

  const mappingCounts = new Map<string, number>();
  for (const edge of edges) {
    mappingCounts.set(
      edge.sourceProductId,
      (mappingCounts.get(edge.sourceProductId) ?? 0) + 1,
    );
  }

  const mappedProductIds = [...mappingCounts.keys()];
  const averageMappingPerProduct =
    mappedProductIds.length === 0
      ? 0
      : mappedProductIds.reduce((sum, id) => sum + (mappingCounts.get(id) ?? 0), 0) /
        mappedProductIds.length;

  const crossBrandEdges = edges.filter(isCrossBrandEdge);
  const crossBrandCoverage =
    edges.length === 0 ? 0 : crossBrandEdges.length / edges.length;

  const graphConnectivity = validateGraphConnectivity(edges, equipmentProductIds);

  const valid =
    edges.length >= EPI_P2_MIN_EQUIVALENT_EDGE_COUNT &&
    averageMappingPerProduct >= EPI_P2_MIN_AVG_MAPPING_PER_PRODUCT &&
    crossBrandCoverage >= EPI_P2_MIN_CROSS_BRAND_COVERAGE &&
    graphConnectivity;

  return {
    valid,
    edgeCount: edges.length,
    averageMappingPerProduct: Math.round(averageMappingPerProduct * 100) / 100,
    crossBrandCoverage: Math.round(crossBrandCoverage * 100) / 100,
    graphConnectivity,
    productNodeCount: equipmentProductIds.length,
    summary: `equivalent-mapping edges=${edges.length} avg=${averageMappingPerProduct.toFixed(2)} crossBrand=${(crossBrandCoverage * 100).toFixed(1)}% connected=${graphConnectivity} valid=${valid}`,
  };
}

export function validateEquivalentProductIntelligencePhase2(): EquivalentProductIntelligencePhase2Validation {
  if (cachedPhase2Validation) return cachedPhase2Validation;

  const phase1 = validateEquivalentProductIntelligencePhase1();
  const equivalentMapping = validateEquivalentMappingPhase2();

  cachedPhase2Validation = {
    valid: phase1.valid && equivalentMapping.valid,
    phase1Valid: phase1.valid,
    equivalentMapping,
  };

  return cachedPhase2Validation;
}

export function getEquivalentProductIntelligencePhase2FreezeMeta(): EquivalentProductIntelligencePhase2FreezeMeta {
  const validation = validateEquivalentProductIntelligencePhase2();

  return {
    tag: EPI_P2_TAG,
    version: EPI_P2_VERSION,
    phase: EPI_P2_PHASE,
    valid: validation.valid,
  };
}
