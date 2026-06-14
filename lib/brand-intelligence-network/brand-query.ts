import { buildAuthorizationLinkRecords } from "./brand-mapping/authorization-link-registry";
import {
  buildBrandRegistryRecords,
  findBrandById,
} from "./brand-registry";
import { enrichBrandWithNetworkLinks } from "./brand-network-context";
import { findTopBrands as findTopBrandsFromNetwork } from "./brand-network-context";
import type { BrandQuery, BrandQueryResult, BrandTier, IndustrySector, RegistryValidation } from "./shared/types";
import {
  CANONICAL_BRAND_QUERY,
  TOP_BRAND_SCORE_THRESHOLD,
} from "./shared/types";

function applyBrandQuery(input: BrandQuery, source: ReturnType<typeof buildBrandRegistryRecords>) {
  let brands = [...source];
  if (input.brandTier) brands = brands.filter((b) => b.brandTier === input.brandTier);
  if (input.brandStatus) brands = brands.filter((b) => b.brandStatus === input.brandStatus);
  if (input.industrySector) {
    brands = brands.filter((b) => b.industrySectors.includes(input.industrySector!));
  }
  if (input.minBrandScore !== undefined) {
    brands = brands.filter((b) => b.score.totalBrandScore >= input.minBrandScore!);
  }
  if (input.limit !== undefined) brands = brands.slice(0, input.limit);
  return brands;
}

function toQueryResult(query: BrandQuery, brands: ReturnType<typeof buildBrandRegistryRecords>): BrandQueryResult {
  return {
    queryId: `brand-query-${JSON.stringify(query)}`,
    query,
    brands,
    hitCount: brands.length,
    brandReady: brands.length > 0,
  };
}

export function findBrands(limit = 10): BrandQueryResult {
  return toQueryResult({ limit }, applyBrandQuery({ limit }, buildBrandRegistryRecords()));
}

export function findBrandsBySector(sector: IndustrySector, limit = 10): BrandQueryResult {
  return toQueryResult(
    { industrySector: sector, limit },
    applyBrandQuery({ industrySector: sector, limit }, buildBrandRegistryRecords()),
  );
}

export function findBrandsByTier(tier: BrandTier, limit = 10): BrandQueryResult {
  return toQueryResult(
    { brandTier: tier, limit },
    applyBrandQuery({ brandTier: tier, limit }, buildBrandRegistryRecords()),
  );
}

export function findAuthorizedBrands(region: string, limit = 10): BrandQueryResult {
  const authLinks = buildAuthorizationLinkRecords().filter(
    (l) => l.region.toLowerCase() === region.toLowerCase() && l.authorizationStatus === "active",
  );
  const brandIds = [...new Set(authLinks.map((l) => l.brandId))];
  const brands = brandIds
    .map((id) => findBrandById(id))
    .filter((b): b is NonNullable<typeof b> => Boolean(b))
    .slice(0, limit);

  return toQueryResult({ region, limit }, brands);
}

export function findTopBrands(limit = 5): BrandQueryResult {
  const brands = findTopBrandsFromNetwork(limit);
  return toQueryResult({ minBrandScore: TOP_BRAND_SCORE_THRESHOLD, limit }, brands);
}

export function executeBrandQuery(query: BrandQuery = {}): BrandQueryResult {
  return toQueryResult(query, applyBrandQuery(query, buildBrandRegistryRecords()));
}

export function validateBrandQueryRegistry(): RegistryValidation {
  const canonical = executeBrandQuery(CANONICAL_BRAND_QUERY);
  const all = findBrands(10);
  const sector = findBrandsBySector("gym-equipment", 5);
  const tier = findBrandsByTier("premium", 5);
  const authorized = findAuthorizedBrands("East China", 5);
  const top = findTopBrands(5);

  const valid =
    canonical.brandReady &&
    canonical.hitCount >= 1 &&
    all.hitCount >= 8 &&
    sector.hitCount >= 1 &&
    tier.hitCount >= 1 &&
    authorized.hitCount >= 1 &&
    top.hitCount >= 3;

  return {
    valid,
    count: canonical.hitCount,
    summary: `brand-query canonical=${canonical.hitCount} sector=${sector.hitCount} tier=${tier.hitCount} authorized=${authorized.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export { enrichBrandWithNetworkLinks };
