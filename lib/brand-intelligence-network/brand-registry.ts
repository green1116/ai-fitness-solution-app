import { getAllRealBrands } from "@/lib/real-catalog-foundation";
import type { RealBrandTier } from "@/lib/real-catalog-foundation";
import { buildBrandAliasRecords, resolveBrandIdByAlias } from "./brand-alias";
import {
  buildBrandCompatibilityMetadata,
  buildBrandEngineCompatibility,
} from "./brand-engine-compat";
import { findManufacturerByBrandId } from "./manufacturer-registry";
import { deriveInitialBrandScore } from "./brand-scoring";
import type {
  BrandQuery,
  BrandRecord,
  BrandRegistry,
  BrandStatus,
  BrandTier,
  IndustrySector,
  RegistryValidation,
} from "./shared/types";
import {
  BRAND_STATUSES,
  BRAND_TIERS,
  CANONICAL_BRAND_BUYER_ID,
  INDUSTRY_SECTORS,
} from "./shared/types";

const TIER_WEIGHT: Record<RealBrandTier, number> = {
  premium: 8,
  commercial: 6,
  "mid-market": 5,
  value: 4,
  domestic: 7,
};

const STATUS_BY_RANK: BrandStatus[] = [
  "draft",
  "active",
  "verified",
  "authorized",
  "matched",
  "restricted",
  "archived",
];

function mapTier(tier: RealBrandTier): BrandTier {
  return tier;
}

function resolveSectors(rank: number): IndustrySector[] {
  const primary = INDUSTRY_SECTORS[(rank - 1) % INDUSTRY_SECTORS.length]!;
  const secondary = INDUSTRY_SECTORS[rank % INDUSTRY_SECTORS.length]!;
  return rank % 3 === 0 ? [primary, secondary] : [primary];
}

function resolveOrganizationId(brandId: string): string | undefined {
  const map: Record<string, string> = {
    "brand-life-fitness": "ind-org-brand-life-fitness",
    "brand-technogym": "ind-org-brand-technogym",
  };
  return map[brandId];
}

const brandOverrides = new Map<string, BrandRecord>();

function seedBrandRecords(): BrandRecord[] {
  const realBrands = getAllRealBrands();
  const aliases = buildBrandAliasRecords();

  const supplementalBrand = {
    brandId: "brand-relax",
    brandName: "Relax",
    brandTier: "commercial" as const,
    manufacturer: "Relax Fitness Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Shanghai, China",
    marketPosition: "Mid-tier commercial fitness brand",
    chinaDistributor: "Relax direct",
    officialWebsite: "https://www.relaxfitness.cn",
    targetSegments: ["hotel", "community"],
    competitiveAdvantages: ["Cost-effective", "Hotel project experience"],
    mode: "real-catalog" as const,
  };

  const allBrands = realBrands.some((b) => b.brandId === supplementalBrand.brandId)
    ? realBrands
    : [...realBrands, supplementalBrand as (typeof realBrands)[number]];

  return allBrands.map((brand, index) => {
    const rank = index + 1;
    const manufacturer = findManufacturerByBrandId(brand.brandId);
    const manufacturerId = manufacturer?.manufacturerId ?? `mfr-${brand.brandId}`;
    const brandAliasNames = aliases
      .filter((a) => a.brandId === brand.brandId)
      .map((a) => a.aliasName);

    return {
      brandId: brand.brandId,
      brandName: brand.brandName,
      brandTier: mapTier(brand.brandTier),
      brandStatus: STATUS_BY_RANK[(rank - 1) % STATUS_BY_RANK.length]!,
      organizationId: resolveOrganizationId(brand.brandId),
      manufacturerId,
      industrySectors: resolveSectors(rank),
      aliasNames: brandAliasNames,
      score: deriveInitialBrandScore(brand.brandId, TIER_WEIGHT[brand.brandTier]),
      supplierLinkIds: [],
      skuLinkIds: [],
      authorizationLinkIds: [],
      evidenceLinkIds: [],
      metadata: {
        ...buildBrandCompatibilityMetadata(brand.brandId, manufacturerId),
        marketPosition: brand.marketPosition,
        officialWebsite: brand.officialWebsite,
        canonicalBuyer: CANONICAL_BRAND_BUYER_ID,
      },
      compatibility: buildBrandEngineCompatibility(),
      mode: "brand-intelligence-network",
    };
  });
}

export function buildBrandRegistryRecords(): BrandRecord[] {
  const seeded = seedBrandRecords();
  const merged = seeded.map((brand) => brandOverrides.get(brand.brandId) ?? brand);
  for (const override of brandOverrides.values()) {
    if (!merged.some((b) => b.brandId === override.brandId)) {
      merged.push(override);
    }
  }
  return merged;
}

export function buildBrandRegistry(): BrandRegistry {
  const brands = buildBrandRegistryRecords();
  const countBy = <T extends string>(items: T[]) =>
    items.reduce((acc, item) => ({ ...acc, [item]: (acc[item as T] ?? 0) + 1 }), {} as Record<T, number>);

  return {
    registryId: "brand-registry-v38",
    brands,
    brandCount: brands.length,
    tierBreakdown: countBy(brands.map((b) => b.brandTier)),
    statusBreakdown: countBy(brands.map((b) => b.brandStatus)),
    sectorBreakdown: countBy(brands.flatMap((b) => b.industrySectors)),
    registryReady: brands.length >= 8,
    mode: "brand-intelligence-network",
  };
}

export function registerBrand(record: BrandRecord): BrandRecord {
  const normalized = { ...record, mode: "brand-intelligence-network" as const };
  brandOverrides.set(record.brandId, normalized);
  return normalized;
}

export function updateBrand(brandId: string, patch: Partial<BrandRecord>): BrandRecord {
  const existing = findBrandById(brandId);
  if (!existing) {
    throw new Error(`Brand not found: ${brandId}`);
  }
  const updated: BrandRecord = {
    ...existing,
    ...patch,
    brandId,
    mode: "brand-intelligence-network",
  };
  brandOverrides.set(brandId, updated);
  return updated;
}

export function findBrandById(brandId: string): BrandRecord | undefined {
  return buildBrandRegistryRecords().find((b) => b.brandId === brandId);
}

export function findBrandByNameOrAlias(name: string): BrandRecord | undefined {
  const byAlias = resolveBrandIdByAlias(name);
  if (byAlias) return findBrandById(byAlias);
  const normalized = name.trim().toLowerCase();
  return buildBrandRegistryRecords().find(
    (b) => b.brandName.toLowerCase() === normalized,
  );
}

function applyBrandQuery(query: BrandQuery, source: BrandRecord[]): BrandRecord[] {
  let brands = [...source];
  if (query.brandTier) brands = brands.filter((b) => b.brandTier === query.brandTier);
  if (query.brandStatus) brands = brands.filter((b) => b.brandStatus === query.brandStatus);
  if (query.industrySector) {
    brands = brands.filter((b) => b.industrySectors.includes(query.industrySector!));
  }
  if (query.minBrandScore !== undefined) {
    brands = brands.filter((b) => b.score.totalBrandScore >= query.minBrandScore!);
  }
  if (query.limit !== undefined) brands = brands.slice(0, query.limit);
  return brands;
}

export function findBrands(limit = 10): BrandRecord[] {
  return applyBrandQuery({ limit }, buildBrandRegistryRecords());
}

export function findBrandsByTier(tier: BrandTier, limit = 10): BrandRecord[] {
  return applyBrandQuery({ brandTier: tier, limit }, buildBrandRegistryRecords());
}

export function findBrandsBySector(sector: IndustrySector, limit = 10): BrandRecord[] {
  return applyBrandQuery({ industrySector: sector, limit }, buildBrandRegistryRecords());
}

export function validateBrandRegistry(): RegistryValidation {
  const brands = buildBrandRegistryRecords();
  const ids = new Set(brands.map((b) => b.brandId));
  const unique = ids.size === brands.length;
  const tierCoverage = BRAND_TIERS.every((tier) => brands.some((b) => b.brandTier === tier));
  const statusCoverage = BRAND_STATUSES.every((status) =>
    brands.some((b) => b.brandStatus === status),
  );
  const manufacturerLinked = brands.every((b) => Boolean(findManufacturerByBrandId(b.brandId)));

  const valid =
    brands.length >= 8 && unique && tierCoverage && statusCoverage && manufacturerLinked;

  return {
    valid,
    count: brands.length,
    summary: `brand-registry count=${brands.length} tiers=${BRAND_TIERS.filter((t) => brands.some((b) => b.brandTier === t)).length}/5 statuses=${BRAND_STATUSES.filter((s) => brands.some((b) => b.brandStatus === s)).length}/7 unique=${unique} valid=${valid}`,
  };
}

export function validateBrandManufacturerRelations(): RegistryValidation {
  const brands = buildBrandRegistryRecords();
  const unresolved = brands.filter((b) => !findManufacturerByBrandId(b.brandId));
  const valid = unresolved.length === 0;

  return {
    valid,
    count: brands.length - unresolved.length,
    summary: `brand-manufacturer relations resolved=${brands.length - unresolved.length}/${brands.length} valid=${valid}`,
  };
}
