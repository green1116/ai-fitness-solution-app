import type { BrandEntry, BrandLibrarySnapshot } from "./types";

export function buildBrandLibrary(input?: { deploymentId?: string }): BrandEntry[] {
  const deploymentId = input?.deploymentId ?? "brand-library-default";
  return [
    {
      brand: { brandId: `brand-lf-${deploymentId}`, brandName: "Life Fitness", manufacturer: "Life Fitness LLC", originCountry: "USA", category: "Commercial Cardio", mode: "readiness-stub" },
      priceTier: "premium",
      strengths: ["Global brand recognition", "Enterprise-grade durability", "Wide service network"],
      weaknesses: ["Higher price point", "Longer lead time for custom configs"],
      targetSegments: ["enterprise", "hotel", "government"],
      brandScore: 92,
    },
    {
      brand: { brandId: `brand-ts-${deploymentId}`, brandName: "Technogym", manufacturer: "Technogym S.p.A.", originCountry: "Italy", category: "Premium Wellness", mode: "readiness-stub" },
      priceTier: "enterprise",
      strengths: ["Design excellence", "Digital ecosystem integration", "Premium positioning"],
      weaknesses: ["Premium pricing", "Limited economy tier options"],
      targetSegments: ["hotel", "enterprise"],
      brandScore: 90,
    },
    {
      brand: { brandId: `brand-sh-${deploymentId}`, brandName: "Shuhua", manufacturer: "Shuhua Sports", originCountry: "China", category: "Domestic Fitness", mode: "readiness-stub" },
      priceTier: "standard",
      strengths: ["Cost-effective", "Fast domestic delivery", "Government procurement friendly"],
      weaknesses: ["Limited international brand prestige", "Fewer smart integrations"],
      targetSegments: ["government", "campus", "community"],
      brandScore: 85,
    },
    {
      brand: { brandId: `brand-int-${deploymentId}`, brandName: "IntelligentFit", manufacturer: "AI Fitness Solution OEM", originCountry: "China", category: "Smart Connected Fitness", mode: "readiness-stub" },
      priceTier: "standard",
      strengths: ["AI-native platform", "Tender intelligence integration", "Flexible customization"],
      weaknesses: ["Newer market presence", "Building brand awareness"],
      targetSegments: ["campus", "enterprise", "community"],
      brandScore: 88,
    },
  ];
}

export function buildBrandLibrarySnapshot(input?: { deploymentId?: string }): BrandLibrarySnapshot {
  const deploymentId = input?.deploymentId ?? "brand-library-default";
  const brands = buildBrandLibrary({ deploymentId });

  const tierCoverage = { economy: 0, standard: 0, premium: 0, enterprise: 0 };
  const segmentCoverage = { government: 0, enterprise: 0, campus: 0, hotel: 0, community: 0 };

  for (const entry of brands) {
    tierCoverage[entry.priceTier] += 1;
    for (const segment of entry.targetSegments) {
      segmentCoverage[segment] += 1;
    }
  }

  const avgScore = Math.round(brands.reduce((sum, b) => sum + b.brandScore, 0) / brands.length);
  const tierBreadth = Object.values(tierCoverage).filter((count) => count > 0).length;
  const brandReadiness = Math.round((avgScore * tierBreadth) / 4);

  return {
    libraryId: `brand-library-${deploymentId}`,
    brands,
    tierCoverage,
    segmentCoverage,
    brandReadiness,
  };
}
