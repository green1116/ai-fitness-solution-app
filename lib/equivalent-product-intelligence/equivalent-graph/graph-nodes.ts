import { EPI_CANONICAL_ID } from "../shared/constants";
import type { ProductRecord, SpecificationRecord } from "../product-foundation/product-spec-types";
import type { EquivalentGraphNode, ProductNode, SpecificationNode } from "./equivalent-graph-types";

export function buildProductNodeId(productId: string): string {
  return `epi-node-product-${productId}`;
}

export function buildSpecificationNodeId(specificationId: string): string {
  return `epi-node-spec-${specificationId}`;
}

export function buildProductNodes(products: ProductRecord[]): ProductNode[] {
  return products.map((product) => ({
    nodeId: buildProductNodeId(product.id),
    nodeType: "product" as const,
    productId: product.id,
    skuId: product.skuId,
    brandId: product.brandId,
    category: product.category,
    label: product.name,
    mode: EPI_CANONICAL_ID,
  }));
}

export function buildSpecificationNodes(
  specifications: SpecificationRecord[],
): SpecificationNode[] {
  return specifications.map((specification) => ({
    nodeId: buildSpecificationNodeId(specification.id),
    nodeType: "specification" as const,
    specificationId: specification.id,
    category: specification.category,
    label: specification.name,
    mode: EPI_CANONICAL_ID,
  }));
}

export function buildEquivalentGraphNodes(input: {
  products: ProductRecord[];
  specifications: SpecificationRecord[];
}): EquivalentGraphNode[] {
  return [
    ...buildProductNodes(input.products),
    ...buildSpecificationNodes(input.specifications),
  ];
}
