import type { RealBrandEntry } from "../shared/types";

export const REAL_BRAND_CATALOG: RealBrandEntry[] = [
  {
    brandId: "brand-technogym",
    brandName: "Technogym",
    manufacturer: "Technogym S.p.A.",
    originCountry: "Italy",
    headquarters: "Cesena, Italy",
    brandTier: "premium",
    marketPosition: "Global premium wellness and design-led fitness equipment leader",
    chinaDistributor: "Technogym China (Shanghai)",
    officialWebsite: "https://www.technogym.com",
    targetSegments: ["hotel", "enterprise", "flagship-campus"],
    competitiveAdvantages: ["Italian design IP", "Mywellness digital ecosystem", "Flagship venue prestige"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-life-fitness",
    brandName: "Life Fitness",
    manufacturer: "Life Fitness LLC (KPS Capital Partners)",
    originCountry: "USA",
    headquarters: "Rosemont, Illinois, USA",
    brandTier: "premium",
    marketPosition: "Global commercial cardio and strength equipment leader",
    chinaDistributor: "Life Fitness Asia Pacific (Shanghai)",
    officialWebsite: "https://www.lifefitness.com",
    targetSegments: ["enterprise", "government", "municipal-sports", "university"],
    competitiveAdvantages: ["Industry-leading durability", "Global service network", "Broad product portfolio"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-matrix",
    brandName: "Matrix",
    manufacturer: "Johnson Health Tech (Matrix Fitness)",
    originCountry: "USA",
    headquarters: "Cottage Grove, Wisconsin, USA",
    brandTier: "mid-market",
    marketPosition: "Commercial mid-market fitness with strong price-performance ratio",
    chinaDistributor: "Matrix Fitness China (Shanghai)",
    officialWebsite: "https://www.matrixfitness.com",
    targetSegments: ["enterprise", "campus", "community-fitness"],
    competitiveAdvantages: ["Modern UX", "Competitive pricing", "Compact footprint options"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-shuhua",
    brandName: "Shuhua",
    manufacturer: "Shandong Shuhua Sports Equipment Co., Ltd.",
    originCountry: "China",
    headquarters: "Dezhou, Shandong, China",
    brandTier: "domestic",
    marketPosition: "Leading domestic fitness equipment brand for government procurement",
    chinaDistributor: "Direct factory sales + provincial agents",
    officialWebsite: "https://www.shuhua.com.cn",
    targetSegments: ["government", "campus", "community", "school"],
    competitiveAdvantages: ["Government procurement compliance", "Fast domestic delivery", "Lowest TCO"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-johnson",
    brandName: "Johnson",
    manufacturer: "Johnson Health Tech Co., Ltd.",
    originCountry: "Taiwan",
    headquarters: "Taichung, Taiwan",
    brandTier: "commercial",
    marketPosition: "Global OEM and commercial strength equipment manufacturer",
    chinaDistributor: "Johnson Health Tech (Shanghai)",
    officialWebsite: "https://www.johnsonhealthtech.com",
    targetSegments: ["enterprise", "hotel", "campus"],
    competitiveAdvantages: ["Vertical integration", "OEM scale", "Reliable supply chain"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-impulse",
    brandName: "Impulse",
    manufacturer: "Impulse Health Tech Ltd.",
    originCountry: "China",
    headquarters: "Qingdao, Shandong, China",
    brandTier: "value",
    marketPosition: "Value commercial strength equipment for budget-conscious projects",
    chinaDistributor: "Impulse direct + regional dealers",
    officialWebsite: "https://www.impulsefitness.com",
    targetSegments: ["government", "community", "school"],
    competitiveAdvantages: ["Low unit cost", "Fast domestic fulfillment", "Wide strength line"],
    mode: "real-catalog",
  },
  {
    brandId: "brand-intelligentfit",
    brandName: "IntelligentFit",
    manufacturer: "AI Fitness Solution OEM",
    originCountry: "China",
    headquarters: "Shanghai, China",
    brandTier: "commercial",
    marketPosition: "AI-native smart connected fitness with tender intelligence integration",
    chinaDistributor: "AI Fitness Solution direct",
    officialWebsite: "https://www.aifitness.solution",
    targetSegments: ["campus", "enterprise", "community"],
    competitiveAdvantages: ["AI-native platform", "Tender intelligence SDK", "Flexible OEM customization"],
    mode: "real-catalog",
  },
];

export function getRealBrandById(brandId: string): RealBrandEntry | undefined {
  return REAL_BRAND_CATALOG.find((b) => b.brandId === brandId);
}

export function getRealBrandByName(brandName: string): RealBrandEntry | undefined {
  return REAL_BRAND_CATALOG.find((b) => b.brandName === brandName);
}

export function getAllRealBrands(): RealBrandEntry[] {
  return [...REAL_BRAND_CATALOG];
}
