import { getAllRealReplacement } from "@/lib/real-catalog-foundation";
import { buildProductSpecContext } from "../product-foundation/product-spec-context";
import type { ProductRecord } from "../product-foundation/product-spec-types";
import { EPI_P2_MIN_MAPPING_SCORE } from "../shared/constants";
import { buildEquivalentProductEdge, dedupeEquivalentEdges } from "./graph-edges";
import type { EquivalentMappingKind, EquivalentProductEdge } from "./equivalent-graph-types";
import {
  calculateEquivalentScore,
  resolveMappingKind,
} from "./equivalent-mapping-scoring";

const EQUIPMENT_CATEGORIES = new Set([
  "cardio",
  "strength",
  "functional",
  "group-training",
  "recovery",
  "equipment",
  "smart-connected",
]);

const RELATED_CATEGORIES: Record<string, string[]> = {
  cardio: ["cardio", "group-training", "smart-connected"],
  "group-training": ["group-training", "cardio", "smart-connected"],
  strength: ["strength", "functional"],
  functional: ["functional", "strength", "recovery"],
  recovery: ["recovery", "functional"],
  "smart-connected": ["smart-connected", "cardio", "group-training"],
  equipment: ["equipment", "cardio", "strength", "functional", "group-training", "recovery"],
};

function isEquipmentCategory(category: string): boolean {
  return EQUIPMENT_CATEGORIES.has(category);
}

function categoriesAlign(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  if (RELATED_CATEGORIES[a]?.includes(b)) return true;
  if (RELATED_CATEGORIES[b]?.includes(a)) return true;
  if (isEquipmentCategory(a) && isEquipmentCategory(b)) return true;
  return false;
}

function buildUpgradeSubstituteEdges(
  products: ProductRecord[],
  productsBySku: Map<string, ProductRecord>,
): EquivalentProductEdge[] {
  const edges: EquivalentProductEdge[] = [];

  for (const replacement of getAllRealReplacement()) {
    const source = productsBySku.get(replacement.sku);
    if (!source) continue;

    const upgradeHint = replacement.upgradePath.toLowerCase();
    for (const target of products) {
      if (target.id === source.id) continue;
      if (!categoriesAlign(source.category, target.category)) continue;

      const targetName = target.name.toLowerCase();
      const hinted =
        upgradeHint.includes(targetName) ||
        targetName.includes(replacement.modelName.toLowerCase());

      if (!hinted && source.brandId !== target.brandId) continue;

      const scoreBreakdown = calculateEquivalentScore(source, target);
      if (scoreBreakdown.totalScore < EPI_P2_MIN_MAPPING_SCORE) continue;

      edges.push(
        buildEquivalentProductEdge({
          sourceProductId: source.id,
          targetProductId: target.id,
          kind: "upgrade-substitute",
          score: Math.min(100, scoreBreakdown.totalScore + 8),
          confidence: Math.min(95, scoreBreakdown.totalScore),
          reason: [
            "replacement-catalog-upgrade-path",
            replacement.upgradePath,
            `score=${scoreBreakdown.totalScore}`,
          ],
        }),
      );
    }
  }

  return edges;
}

function buildCategoryMappingEdges(
  source: ProductRecord,
  products: ProductRecord[],
): EquivalentProductEdge[] {
  const edges: EquivalentProductEdge[] = [];

  for (const target of products) {
    if (target.id === source.id) continue;
    if (!categoriesAlign(source.category, target.category)) continue;

    const scoreBreakdown = calculateEquivalentScore(source, target);
    const kind = resolveMappingKind(source, target, scoreBreakdown);

    if (kind === "emergency-substitute" && scoreBreakdown.totalScore < 22) continue;
    if (
      kind !== "emergency-substitute" &&
      scoreBreakdown.totalScore < EPI_P2_MIN_MAPPING_SCORE
    ) {
      continue;
    }

    const confidence = Math.min(
      100,
      Math.round((scoreBreakdown.totalScore + scoreBreakdown.specOverlapScore) / 2),
    );

    edges.push(
      buildEquivalentProductEdge({
        sourceProductId: source.id,
        targetProductId: target.id,
        kind,
        score: scoreBreakdown.totalScore,
        confidence,
        reason: [
          `category=${source.category}`,
          `specOverlap=${scoreBreakdown.specOverlapScore}`,
          `brandDistance=${scoreBreakdown.brandDistanceScore}`,
          `functional=${scoreBreakdown.functionalSimilarityScore}`,
          `catalog=${scoreBreakdown.catalogSimilarityScore}`,
        ],
      }),
    );
  }

  return edges;
}

let cachedAllEdges: EquivalentProductEdge[] | undefined;

export function buildAllEquivalentProductEdges(): EquivalentProductEdge[] {
  if (cachedAllEdges) return cachedAllEdges;

  const context = buildProductSpecContext();
  const products = context.products;
  const productsBySku = new Map(products.map((product) => [product.skuId, product]));

  const edges: EquivalentProductEdge[] = [
    ...buildUpgradeSubstituteEdges(products, productsBySku),
  ];

  for (const product of products) {
    if (product.specifications.length === 0 && !isEquipmentCategory(product.category)) {
      continue;
    }
    edges.push(...buildCategoryMappingEdges(product, products));
  }

  cachedAllEdges = dedupeEquivalentEdges(edges);
  return cachedAllEdges;
}

export function buildEquivalentMappings(productId: string): EquivalentProductEdge[] {
  return buildAllEquivalentProductEdges().filter(
    (edge) => edge.sourceProductId === productId,
  );
}

export function findEquivalentProducts(
  productId: string,
  kind?: EquivalentMappingKind,
): EquivalentProductEdge[] {
  const mappings = buildEquivalentMappings(productId);
  if (!kind) return mappings;
  return mappings.filter((edge) => edge.kind === kind);
}

export function rankEquivalentProducts(productId: string): EquivalentProductEdge[] {
  return [...buildEquivalentMappings(productId)].sort((a, b) => b.score - a.score);
}
