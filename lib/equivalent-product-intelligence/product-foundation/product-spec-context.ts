import { EPI_CANONICAL_ID } from "../shared/constants";
import type {
  ProductRecord,
  ProductSpecContext,
  SpecificationRecord,
} from "./product-spec-types";
import { buildProductRegistry } from "./product-registry";
import { buildRequirementSpecificationEdges } from "./requirement-spec-edge";
import { buildSpecificationRegistry } from "./specification-registry";

function categoriesAlign(productCategory: string, specCategory: string): boolean {
  if (productCategory === specCategory) return true;
  if (productCategory.includes(specCategory) || specCategory.includes(productCategory)) {
    return true;
  }

  const equipmentCategories = new Set([
    "cardio",
    "strength",
    "functional",
    "group-training",
    "recovery",
    "equipment",
  ]);

  return (
    equipmentCategories.has(productCategory) &&
    equipmentCategories.has(specCategory) &&
    productCategory === specCategory
  );
}

function linkProductSpecifications(
  product: ProductRecord,
  specifications: SpecificationRecord[],
): string[] {
  const linked = specifications
    .filter((spec) => categoriesAlign(product.category, spec.category))
    .map((spec) => spec.id);

  return [...new Set(linked)].slice(0, 8);
}

function attachProductSpecificationLinks(
  products: ProductRecord[],
  specifications: SpecificationRecord[],
): ProductRecord[] {
  return products.map((product) => ({
    ...product,
    specifications: linkProductSpecifications(product, specifications),
  }));
}

let cachedContext: ProductSpecContext | undefined;

export function buildProductSpecContext(): ProductSpecContext {
  if (cachedContext) return cachedContext;

  const products = buildProductRegistry().products;
  const specifications = buildSpecificationRegistry().specifications;
  const edges = buildRequirementSpecificationEdges();
  const linkedProducts = attachProductSpecificationLinks(products, specifications);
  const linkedProductCount = linkedProducts.filter((product) => product.specifications.length > 0)
    .length;
  const contextReady =
    products.length > 0 &&
    specifications.length > 0 &&
    edges.length > 0 &&
    linkedProductCount > 0;

  cachedContext = {
    contextId: "epi-product-spec-context-v42-p1",
    products: linkedProducts,
    specifications,
    edges,
    contextReady,
    mode: EPI_CANONICAL_ID,
  };

  return cachedContext;
}

export function findProductsBySpecification(specId: string): ProductRecord[] {
  const context = buildProductSpecContext();
  const specification = context.specifications.find((spec) => spec.id === specId);
  if (!specification) return [];

  return context.products.filter(
    (product) =>
      product.specifications.includes(specId) ||
      categoriesAlign(product.category, specification.category),
  );
}

export function findSpecificationsByRequirement(requirementId: string): SpecificationRecord[] {
  const context = buildProductSpecContext();
  const specificationIds = new Set(
    context.edges
      .filter((edge) => edge.requirementId === requirementId)
      .map((edge) => edge.specificationId),
  );

  return context.specifications.filter((specification) =>
    specificationIds.has(specification.id),
  );
}
