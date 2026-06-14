import { buildCatalogRegistryRecords, getCatalogById } from "@/lib/product-catalog";
import { getProposalById } from "@/lib/tender-proposal";
import { getSkuLinksBySku } from "./brand-mapping/sku-link-registry";
import {
  matchBrandToCatalog as matchBrandToCatalogNetwork,
  matchBrandToSku as matchBrandToSkuNetwork,
  matchBrandToSupplier,
} from "./brand-network-context";
import { buildBrandRegistryRecords, findBrandById } from "./brand-registry";
import { getTenderBrandStubByTenderId } from "./tender-stub/tender-brand-stub";
import type { BrandMatchResult, RegistryValidation } from "./shared/types";

export function matchBrandToSku(sku: string): BrandMatchResult[] {
  const links = getSkuLinksBySku(sku);
  if (links.length === 0) return [];

  return links.map((link) => matchBrandToSkuNetwork(link.brandId, sku));
}

export function matchBrandToCatalog(catalogId: string): BrandMatchResult[] {
  return matchBrandToCatalogNetwork(catalogId);
}

export function matchBrandToProposal(proposalId: string): BrandMatchResult[] {
  const proposal = getProposalById(proposalId);
  if (!proposal) return [];

  const sectorMatches = buildBrandRegistryRecords().filter((b) =>
    b.industrySectors.includes(proposal.industrySector),
  );

  return sectorMatches.slice(0, 3).map((brand) => ({
    matchId: `match-brand-proposal-${brand.brandId}-${proposalId}`,
    brandId: brand.brandId,
    targetType: "proposal" as const,
    targetId: proposalId,
    matchScore: Math.min(
      100,
      Math.round((brand.score.totalBrandScore + proposal.score.totalProposalScore) / 2),
    ),
    matchedLinkIds: brand.supplierLinkIds,
    matchReady: brand.score.totalBrandScore >= 50,
    mode: "brand-intelligence-network",
  }));
}

export function matchBrandToTender(tenderId: string): BrandMatchResult[] {
  const stubs = getTenderBrandStubByTenderId(tenderId);
  return stubs.map((stub) => ({
    matchId: `match-brand-tender-${stub.brandId}-${tenderId}`,
    brandId: stub.brandId,
    targetType: "tender" as const,
    targetId: tenderId,
    matchScore: stub.matchScore,
    matchedLinkIds: [],
    matchReady: stub.stubReady,
    mode: "brand-intelligence-network",
  }));
}

export function validateBrandMatcherRegistry(): RegistryValidation {
  const brand = findBrandById("brand-life-fitness");
  const supplierMatch = brand ? matchBrandToSupplier(brand.brandId) : undefined;
  const skuMatches = matchBrandToSku("LF-T5-001");
  const catalog = getCatalogById(buildCatalogRegistryRecords()[0]?.catalogId ?? "");
  const catalogMatches = catalog ? matchBrandToCatalog(catalog.catalogId) : [];

  const valid =
    Boolean(supplierMatch?.matchReady) &&
    skuMatches.some((m) => m.matchReady) &&
    catalogMatches.length >= 1;

  return {
    valid,
    count: skuMatches.length,
    summary: `brand-matcher supplier=${supplierMatch?.matchReady} sku=${skuMatches.length} valid=${valid}`,
  };
}

export { matchBrandToSupplier } from "./brand-network-context";
