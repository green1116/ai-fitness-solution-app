import type { BrandAliasRecord } from "./shared/types";

export function normalizeBrandAlias(alias: string): string {
  return alias
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^\w\u4e00-\u9fff]/g, "");
}

export function buildBrandAliasRecord(brandId: string, aliasName: string): BrandAliasRecord {
  return {
    aliasId: `brand-alias-${brandId}-${normalizeBrandAlias(aliasName)}`,
    brandId,
    aliasName,
    normalizedAlias: normalizeBrandAlias(aliasName),
    mode: "brand-intelligence-network",
  };
}

const STATIC_ALIAS_SEEDS: Array<{ brandId: string; aliases: string[] }> = [
  { brandId: "brand-life-fitness", aliases: ["Life Fitness", "life fitness", "LIFE-FITNESS", "力健"] },
  { brandId: "brand-technogym", aliases: ["Technogym", "technogym", "泰诺健"] },
  { brandId: "brand-matrix", aliases: ["Matrix", "matrix fitness", "Matrix Fitness"] },
  { brandId: "brand-shuhua", aliases: ["Shuhua", "舒华", "shuhua sports"] },
  { brandId: "brand-johnson", aliases: ["Johnson", "Johnson Health Tech", "乔山"] },
  { brandId: "brand-impulse", aliases: ["Impulse", "impulse fitness", "英派斯"] },
  { brandId: "brand-intelligentfit", aliases: ["IntelligentFit", "智能健身", "AI Fitness OEM"] },
  { brandId: "brand-relax", aliases: ["Relax", "relax fitness", "瑞莱克斯"] },
];

export function buildBrandAliasRecords(extraAliases: BrandAliasRecord[] = []): BrandAliasRecord[] {
  const seeded = STATIC_ALIAS_SEEDS.flatMap((seed) =>
    seed.aliases.map((alias) => buildBrandAliasRecord(seed.brandId, alias)),
  );
  const merged = [...seeded, ...extraAliases];
  const seen = new Set<string>();
  return merged.filter((alias) => {
    if (seen.has(alias.normalizedAlias)) return false;
    seen.add(alias.normalizedAlias);
    return true;
  });
}

export function resolveBrandIdByAlias(
  alias: string,
  aliases: BrandAliasRecord[] = buildBrandAliasRecords(),
): string | undefined {
  const normalized = normalizeBrandAlias(alias);
  return aliases.find((record) => record.normalizedAlias === normalized)?.brandId;
}

export function validateAliasRegistry(aliases: BrandAliasRecord[]): {
  valid: boolean;
  conflicts: string[];
} {
  const map = new Map<string, string>();
  const conflicts: string[] = [];

  for (const alias of aliases) {
    const existing = map.get(alias.normalizedAlias);
    if (existing && existing !== alias.brandId) {
      conflicts.push(`${alias.normalizedAlias}:${existing}->${alias.brandId}`);
    } else {
      map.set(alias.normalizedAlias, alias.brandId);
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}
