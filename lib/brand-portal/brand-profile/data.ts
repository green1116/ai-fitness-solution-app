import type { BrandProfile } from "../shared/types";

export const BRAND_PROFILES: BrandProfile[] = [
  {
    brandId: "brand-life-fitness",
    brandName: "Life Fitness",
    country: "USA",
    category: "premium",
    website: "https://www.lifefitness.com",
    description: "Global commercial cardio and strength equipment leader",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-technogym",
    brandName: "Technogym",
    country: "Italy",
    category: "premium",
    website: "https://www.technogym.com",
    description: "Global premium wellness and design-led fitness equipment leader",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-matrix",
    brandName: "Matrix",
    country: "USA",
    category: "mid-market",
    website: "https://www.matrixfitness.com",
    description: "Commercial mid-market fitness with strong price-performance ratio",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-relax",
    brandName: "Relax",
    country: "China",
    category: "commercial",
    website: "https://www.relaxfitness.cn",
    description: "Mid-tier commercial fitness brand for hotel and community projects",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-shuhua",
    brandName: "Shuhua",
    country: "China",
    category: "domestic",
    website: "https://www.shuhua.com.cn",
    description: "Leading domestic fitness equipment brand for government procurement",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-precor",
    brandName: "Precor",
    country: "USA",
    category: "premium",
    website: "https://www.precor.com",
    description: "Premium commercial cardio with biomechanically optimized motion",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-impulse",
    brandName: "Impulse",
    country: "China",
    category: "value",
    website: "https://www.impulsefitness.com",
    description: "Value commercial strength equipment for budget-conscious projects",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-dhz",
    brandName: "DHZ",
    country: "China",
    category: "domestic",
    website: "https://www.dhzfitness.com",
    description: "Domestic commercial fitness brand for campus and community projects",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-bodystrength",
    brandName: "BodyStrong",
    country: "China",
    category: "value",
    website: "https://www.bodystrength.cn",
    description: "Value strength and functional training equipment for budget projects",
    status: "active",
    mode: "brand-portal",
  },
  {
    brandId: "brand-sportsart",
    brandName: "SportsArt",
    country: "Taiwan",
    category: "commercial",
    website: "https://www.gosportsart.com",
    description: "Eco-friendly commercial cardio with ECO-POWR technology",
    status: "active",
    mode: "brand-portal",
  },
];

export function getAllBrandProfiles(): BrandProfile[] {
  return [...BRAND_PROFILES];
}

export function getBrandProfileById(brandId: string): BrandProfile | undefined {
  return BRAND_PROFILES.find((b) => b.brandId === brandId);
}
