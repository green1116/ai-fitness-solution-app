import { buildProductCatalog } from "@/lib/commercial-products/product-catalog/product-catalog";
import { PRODUCT_SKU } from "@/lib/commercial-products/shared/constants";
import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import { PRODUCT_ERROR_CODES, SaasProductError } from "../shared/product-errors";
import type { ProductCode, ProductDefinition } from "../shared/product-types";

const PRODUCT_DEFINITIONS: ProductDefinition[] = [
  {
    productCode: "kickstart-package",
    displayName: "Kickstart Package",
    v47Sku: "kickstart-package",
    workflowKeys: ["commercial.quote", "commercial.package"],
    portalTypes: ["enterprise", "contractor"],
    requiredFeatures: ["commercial.quote", "commercial.deliverable_package"],
  },
  {
    productCode: "tender-ready-package",
    displayName: "Tender Ready Package",
    v47Sku: "tender-ready-package",
    workflowKeys: ["commercial.quote", "commercial.package", "commercial.approval"],
    portalTypes: ["enterprise", "contractor"],
    requiredFeatures: ["commercial.quote", "commercial.deliverable_package", "commercial.approval"],
  },
  {
    productCode: "delivery-intelligence-package",
    displayName: "Delivery Intelligence Package",
    v47Sku: "delivery-intelligence-package",
    workflowKeys: [
      "commercial.quote",
      "commercial.package",
      "commercial.delivery",
      "commercial.approval",
      "commercial.audit",
      "commercial.release",
    ],
    portalTypes: ["enterprise", "contractor"],
    requiredFeatures: [
      "commercial.quote",
      "commercial.deliverable_package",
      "commercial.delivery_orchestrator",
      "commercial.approval",
      "commercial.audit",
      "commercial.release",
    ],
  },
];

const PRODUCT_REGISTRY = new Map<ProductCode, ProductDefinition>(
  PRODUCT_DEFINITIONS.map((product) => [product.productCode, product]),
);

export function resolveProduct(productCode: ProductCode): ProductDefinition {
  const product = PRODUCT_REGISTRY.get(productCode);
  if (!product) {
    throw new SaasProductError(PRODUCT_ERROR_CODES.PRODUCT_NOT_FOUND, `Product not found: ${productCode}`);
  }
  return { ...product, workflowKeys: [...product.workflowKeys], portalTypes: [...product.portalTypes], requiredFeatures: [...product.requiredFeatures] };
}

export function listProducts(): ProductDefinition[] {
  return PRODUCT_DEFINITIONS.map((product) => resolveProduct(product.productCode));
}

export function listProductsForPortal(portalType: PortalType): ProductDefinition[] {
  return listProducts().filter((product) => product.portalTypes.includes(portalType));
}

export function assertProductRegistryAlignedWithV47(): boolean {
  const catalog = buildProductCatalog();
  if (catalog.count !== PRODUCT_DEFINITIONS.length) return false;
  return PRODUCT_SKU.every((sku) => {
    const catalogEntry = catalog.records.find((record) => record.sku === sku);
    const product = PRODUCT_REGISTRY.get(sku);
    return Boolean(catalogEntry && product && product.v47Sku === catalogEntry.sku);
  });
}
