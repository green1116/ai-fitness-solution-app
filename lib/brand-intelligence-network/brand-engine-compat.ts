import { BRAND_PORTAL_VERSION } from "@/lib/brand-portal";
import { PRODUCT_CATALOG_VERSION } from "@/lib/product-catalog";
import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import type { BrandEngineCompatibility } from "./shared/types";

export const SUPPLIER_NETWORK_LAYER_VERSION = "v37-supplier-network-1" as const;
export const EVIDENCE_INTELLIGENCE_LAYER_PLACEHOLDER = "v39-evidence-intelligence-pending" as const;

export function buildBrandEngineCompatibility(): BrandEngineCompatibility {
  return {
    realCatalogFoundation: REAL_CATALOG_FOUNDATION_VERSION,
    brandPortalLayer: BRAND_PORTAL_VERSION,
    productCatalogLayer: PRODUCT_CATALOG_VERSION,
    supplierNetworkLayer: SUPPLIER_NETWORK_LAYER_VERSION,
    evidenceIntelligenceLayer: EVIDENCE_INTELLIGENCE_LAYER_PLACEHOLDER,
  };
}

export function buildBrandCompatibilityMetadata(
  brandId: string,
  manufacturerId: string,
): Record<string, string> {
  const compatibility = buildBrandEngineCompatibility();
  return {
    realCatalogFoundation: compatibility.realCatalogFoundation,
    brandPortalLayer: compatibility.brandPortalLayer,
    productCatalogLayer: compatibility.productCatalogLayer,
    supplierNetworkLayer: compatibility.supplierNetworkLayer,
    evidenceIntelligenceLayer: compatibility.evidenceIntelligenceLayer,
    brandId,
    manufacturerId,
    sourceLayer: "v38-brand-intelligence-network",
  };
}
