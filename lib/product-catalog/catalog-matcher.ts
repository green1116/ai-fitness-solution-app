import { getCatalogById } from "./catalog-registry";
import type { TenderProposal } from "@/lib/tender-proposal";
import { getProposalById } from "@/lib/tender-proposal";
import { buildCatalogFromProposal } from "./catalog-builder";
import { getCatalogProductsBySector, getCatalogProductsByType } from "./catalog-product";
import type { CatalogMatchResult, ProductCatalog } from "./shared/types";

export function matchCatalogToProposal(
  catalog: ProductCatalog,
  proposal?: TenderProposal,
): CatalogMatchResult {
  const resolvedProposal = proposal ?? getProposalById(catalog.proposalId);
  if (!resolvedProposal) {
    return {
      matchId: `catalog-match-${catalog.catalogId}-missing`,
      catalogId: catalog.catalogId,
      proposalId: catalog.proposalId,
      tenderId: catalog.tenderId,
      matchScore: 0,
      matchedProductIds: [],
      matchReady: false,
      mode: "product-catalog",
    };
  }

  const sectorProducts = getCatalogProductsBySector(catalog.industrySector);
  const typeProducts = getCatalogProductsByType(catalog.catalogType);
  const matchedProductIds = (
    sectorProducts.length > 0 ? sectorProducts : typeProducts
  )
    .slice(0, 4)
    .map((product) => product.productId);

  const sectorMatch = catalog.industrySector === resolvedProposal.industrySector ? 25 : 0;
  const typeAlignment =
    catalog.catalogType === "equipment" && resolvedProposal.proposalType === "equipment"
      ? 20
      : catalog.catalogType === "construction" &&
          resolvedProposal.proposalType === "construction"
        ? 20
        : 10;
  const scoreAlignment = Math.round(
    (catalog.score.matchingScore + resolvedProposal.score.winningScore) / 2,
  );
  const matchScore = Math.min(100, sectorMatch + typeAlignment + Math.round(scoreAlignment * 0.55));

  return {
    matchId: `catalog-match-${catalog.catalogId}-${resolvedProposal.proposalId}`,
    catalogId: catalog.catalogId,
    proposalId: resolvedProposal.proposalId,
    tenderId: resolvedProposal.tenderId,
    matchScore,
    matchedProductIds,
    matchReady: matchedProductIds.length >= 1 && matchScore >= 50,
    mode: "product-catalog",
  };
}

export function matchCatalogToProposalById(
  catalogId: string,
  proposalId: string,
): CatalogMatchResult {
  const catalog = getCatalogById(catalogId);
  const proposal = getProposalById(proposalId);
  if (!catalog || !proposal) {
    return {
      matchId: `catalog-match-${catalogId}-${proposalId}-missing`,
      catalogId,
      proposalId,
      tenderId: catalog?.tenderId ?? "unknown",
      matchScore: 0,
      matchedProductIds: [],
      matchReady: false,
      mode: "product-catalog",
    };
  }
  return matchCatalogToProposal(catalog, proposal);
}

export function rebuildCatalogMatch(catalog: ProductCatalog): CatalogMatchResult {
  const proposal = getProposalById(catalog.proposalId);
  if (!proposal) {
    return matchCatalogToProposal(catalog);
  }
  return matchCatalogToProposal(buildCatalogFromProposal(proposal, catalog.catalogType), proposal);
}
