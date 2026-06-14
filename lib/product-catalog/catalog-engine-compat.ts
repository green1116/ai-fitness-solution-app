import { REAL_CATALOG_FOUNDATION_VERSION } from "@/lib/real-catalog-foundation";
import { TENDER_PROPOSAL_VERSION } from "@/lib/tender-proposal";
import type { CatalogEngineCompatibility } from "./shared/types";

export const MARKETPLACE_LAYER_LABEL = "v35-industry-marketplace-1" as const;

export function buildCatalogEngineCompatibility(): CatalogEngineCompatibility {
  return {
    realCatalogFoundation: REAL_CATALOG_FOUNDATION_VERSION,
    tenderProposalLayer: TENDER_PROPOSAL_VERSION,
    marketplaceLayer: MARKETPLACE_LAYER_LABEL,
  };
}

export function buildCatalogCompatibilityMetadata(
  catalogId: string,
  proposalId: string,
): Record<string, string> {
  const compatibility = buildCatalogEngineCompatibility();
  return {
    realCatalogFoundation: compatibility.realCatalogFoundation,
    tenderProposalLayer: compatibility.tenderProposalLayer,
    marketplaceLayer: compatibility.marketplaceLayer,
    catalogId,
    proposalId,
    sourceLayer: "v36-product-catalog",
  };
}
