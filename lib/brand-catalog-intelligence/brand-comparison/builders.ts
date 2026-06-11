import { buildBrandIntelligenceProfiles } from "../brand-intelligence/builders";
import type { BrandComparisonPair, BrandComparisonSnapshot } from "./types";

const COMPARISON_PAIRS: Array<[string, string]> = [
  ["Technogym", "Life Fitness"],
  ["Matrix", "Johnson"],
  ["Shuhua", "Impulse"],
];

function findProfile(profiles: ReturnType<typeof buildBrandIntelligenceProfiles>, name: string) {
  const profile = profiles.find((p) => p.brandName === name);
  if (!profile) throw new Error(`Brand profile not found: ${name}`);
  return profile;
}

function tierCostLabel(tier: string): string {
  if (tier === "premium") return "high TCO (premium)";
  if (tier === "commercial") return "mid TCO (commercial)";
  return "low TCO (value)";
}

export function buildBrandComparisons(input?: { deploymentId?: string }): BrandComparisonPair[] {
  const deploymentId = input?.deploymentId ?? "brand-comparison-default";
  const profiles = buildBrandIntelligenceProfiles({ deploymentId });

  return COMPARISON_PAIRS.map(([brandA, brandB]) => {
    const profileA = findProfile(profiles, brandA);
    const profileB = findProfile(profiles, brandB);

    const positioningDifference =
      profileA.brandTier === profileB.brandTier
        ? `${brandA} and ${brandB} compete in ${profileA.brandTier} tier; ${brandA} focuses on ${profileA.marketPosition}, ${brandB} on ${profileB.marketPosition}`
        : `${brandA} (${profileA.brandTier}) vs ${brandB} (${profileB.brandTier}): ${profileA.marketPosition} vs ${profileB.marketPosition}`;

    const costDifference = `${brandA}: ${tierCostLabel(profileA.brandTier)}; ${brandB}: ${tierCostLabel(profileB.brandTier)}`;

    const maintenanceDifference =
      `${brandA}: ${profileA.maintenanceCharacteristics[0]}; ${brandB}: ${profileB.maintenanceCharacteristics[0]}`;

    const recommendationDifference =
      profileA.intelligenceScore >= profileB.intelligenceScore
        ? `Prefer ${brandA} for premium positioning; ${brandB} for cost-sensitive procurement`
        : `Prefer ${brandB} for balanced value; ${brandA} for specialized requirements`;

    return {
      comparisonId: `compare-${brandA.toLowerCase()}-vs-${brandB.toLowerCase()}-${deploymentId}`,
      brandA,
      brandB,
      positioningDifference,
      costDifference,
      maintenanceDifference,
      recommendationDifference,
      comparisonScore: Math.round((profileA.intelligenceScore + profileB.intelligenceScore) / 2),
    };
  });
}

export function buildBrandComparisonSnapshot(input?: { deploymentId?: string }): BrandComparisonSnapshot {
  const deploymentId = input?.deploymentId ?? "brand-comparison-default";
  const comparisons = buildBrandComparisons({ deploymentId });
  const comparisonReadiness = Math.round(
    comparisons.reduce((sum, c) => sum + c.comparisonScore, 0) / comparisons.length,
  );

  return {
    snapshotId: `brand-comparison-${deploymentId}`,
    comparisons,
    comparisonReadiness,
  };
}
