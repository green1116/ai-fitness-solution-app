import { buildBrandLibrarySnapshot } from "@/lib/bidder-intelligence/brand-library/builders";
import type { BrandIntelligenceProfile, BrandIntelligenceSnapshot, BrandPositioningTier } from "./types";

const EXTENDED_BRANDS: Array<{
  brandName: string;
  brandTier: BrandPositioningTier;
  marketPosition: string;
  typicalCustomer: string;
  competitiveAdvantages: string[];
  competitiveDisadvantages: string[];
  maintenanceCharacteristics: string[];
  lifecycleCharacteristics: string[];
}> = [
  {
    brandName: "Technogym",
    brandTier: "premium",
    marketPosition: "Global premium wellness leader",
    typicalCustomer: "Luxury hotels, flagship enterprise fitness centers",
    competitiveAdvantages: ["Design leadership", "Digital ecosystem", "Brand prestige"],
    competitiveDisadvantages: ["Highest TCO", "Long procurement cycles for custom projects"],
    maintenanceCharacteristics: ["Certified technician network", "Premium spare parts pricing", "Predictive maintenance APIs"],
    lifecycleCharacteristics: ["8-10 year design lifecycle", "Frequent software updates", "High residual value"],
  },
  {
    brandName: "Life Fitness",
    brandTier: "premium",
    marketPosition: "Global commercial cardio & strength leader",
    typicalCustomer: "Enterprise chains, municipal sports centers, universities",
    competitiveAdvantages: ["Durability", "Global service network", "Broad product line"],
    competitiveDisadvantages: ["Premium pricing", "Less design differentiation vs Technogym"],
    maintenanceCharacteristics: ["Wide parts availability", "Standardized service intervals", "Modular component replacement"],
    lifecycleCharacteristics: ["7-9 year equipment lifecycle", "Proven depreciation curve", "Strong secondary market"],
  },
  {
    brandName: "Matrix",
    brandTier: "commercial",
    marketPosition: "Mid-to-high commercial fitness",
    typicalCustomer: "Mid-size gyms, corporate wellness, campus facilities",
    competitiveAdvantages: ["Balanced price-performance", "Modern console UX", "Compact footprint options"],
    competitiveDisadvantages: ["Less government procurement recognition", "Smaller China service network"],
    maintenanceCharacteristics: ["Moderate parts cost", "Regional service partners", "Quarterly preventive maintenance"],
    lifecycleCharacteristics: ["6-8 year lifecycle", "Good upgrade path", "Moderate resale value"],
  },
  {
    brandName: "Johnson",
    brandTier: "commercial",
    marketPosition: "Established commercial fitness brand",
    typicalCustomer: "Community fitness, hotel gyms, rehabilitation centers",
    competitiveAdvantages: ["Reliable build quality", "Competitive pricing", "Established dealer network"],
    competitiveDisadvantages: ["Less smart connectivity", "Older industrial design language"],
    maintenanceCharacteristics: ["Affordable spare parts", "Local technician availability", "Simple maintenance protocols"],
    lifecycleCharacteristics: ["6-7 year lifecycle", "Stable depreciation", "Adequate parts support"],
  },
  {
    brandName: "Shuhua",
    brandTier: "value",
    marketPosition: "Domestic value leader for public procurement",
    typicalCustomer: "Government, campus, community fitness projects",
    competitiveAdvantages: ["Cost-effective", "Fast domestic delivery", "Procurement compliance friendly"],
    competitiveDisadvantages: ["Limited premium positioning", "Fewer smart integrations"],
    maintenanceCharacteristics: ["Low maintenance cost", "Domestic parts supply chain", "Simple service training"],
    lifecycleCharacteristics: ["5-7 year lifecycle", "Rapid model refresh", "Value-oriented replacement cycle"],
  },
  {
    brandName: "Impulse",
    brandTier: "value",
    marketPosition: "Budget commercial fitness",
    typicalCustomer: "Community centers, budget hotel gyms, startup fitness studios",
    competitiveAdvantages: ["Lowest entry price", "Quick installation", "Basic coverage across categories"],
    competitiveDisadvantages: ["Shorter durability vs premium brands", "Limited smart features"],
    maintenanceCharacteristics: ["Low-cost parts", "Basic service requirements", "Higher wear on high-traffic sites"],
    lifecycleCharacteristics: ["4-6 year lifecycle", "Frequent replacement recommended", "Limited resale market"],
  },
  {
    brandName: "IntelligentFit",
    brandTier: "commercial",
    marketPosition: "AI-native smart fitness OEM",
    typicalCustomer: "Smart campus, enterprise digital fitness, innovation pilots",
    competitiveAdvantages: ["AI tender integration", "Connected equipment platform", "Flexible customization"],
    competitiveDisadvantages: ["Newer brand awareness", "Building service network"],
    maintenanceCharacteristics: ["Remote diagnostics", "OTA firmware updates", "Hybrid on-site support"],
    lifecycleCharacteristics: ["Software-driven lifecycle", "Continuous feature upgrades", "Platform lock-in potential"],
  },
];

function mapPriceTierToPositioning(priceTier: string): BrandPositioningTier {
  if (priceTier === "premium" || priceTier === "enterprise") return "premium";
  if (priceTier === "standard") return "commercial";
  return "value";
}

export function buildBrandIntelligenceProfiles(input?: { deploymentId?: string }): BrandIntelligenceProfile[] {
  const deploymentId = input?.deploymentId ?? "brand-intelligence-default";
  const library = buildBrandLibrarySnapshot({ deploymentId });

  const profiles: BrandIntelligenceProfile[] = [];

  for (const extended of EXTENDED_BRANDS) {
    const libraryMatch = library.brands.find((b) => b.brand.brandName === extended.brandName);
    profiles.push({
      brandId: libraryMatch?.brand.brandId ?? `brand-ext-${extended.brandName.toLowerCase()}-${deploymentId}`,
      brandName: extended.brandName,
      brandTier: extended.brandTier,
      marketPosition: extended.marketPosition,
      typicalCustomer: extended.typicalCustomer,
      competitiveAdvantages: extended.competitiveAdvantages,
      competitiveDisadvantages: extended.competitiveDisadvantages,
      maintenanceCharacteristics: extended.maintenanceCharacteristics,
      lifecycleCharacteristics: extended.lifecycleCharacteristics,
      intelligenceScore: libraryMatch?.brandScore ?? 80,
      mode: "readiness-stub",
    });
  }

  for (const entry of library.brands) {
    if (!profiles.some((p) => p.brandName === entry.brand.brandName)) {
      profiles.push({
        brandId: entry.brand.brandId,
        brandName: entry.brand.brandName,
        brandTier: mapPriceTierToPositioning(entry.priceTier),
        marketPosition: `${entry.brand.category} — ${entry.priceTier} tier`,
        typicalCustomer: entry.targetSegments.join(", "),
        competitiveAdvantages: entry.strengths,
        competitiveDisadvantages: entry.weaknesses,
        maintenanceCharacteristics: ["Standard preventive maintenance", "Regional parts support"],
        lifecycleCharacteristics: ["Standard commercial lifecycle", "Tier-appropriate depreciation"],
        intelligenceScore: entry.brandScore,
        mode: "readiness-stub",
      });
    }
  }

  return profiles;
}

export function buildBrandIntelligenceSnapshot(input?: { deploymentId?: string }): BrandIntelligenceSnapshot {
  const deploymentId = input?.deploymentId ?? "brand-intelligence-default";
  const profiles = buildBrandIntelligenceProfiles({ deploymentId });

  const tierDistribution = { premium: 0, commercial: 0, value: 0 };
  for (const profile of profiles) {
    tierDistribution[profile.brandTier] += 1;
  }

  const tierBreadth = Object.values(tierDistribution).filter((c) => c > 0).length;
  const avgScore = Math.round(profiles.reduce((s, p) => s + p.intelligenceScore, 0) / profiles.length);
  const intelligenceReadiness = Math.round((tierBreadth / 3) * avgScore);

  return {
    snapshotId: `brand-intelligence-${deploymentId}`,
    profiles,
    tierDistribution,
    intelligenceReadiness,
  };
}
