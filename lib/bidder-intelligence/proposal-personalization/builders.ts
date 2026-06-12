import { buildBidderProfileSnapshot } from "../bidder-profile/builders";
import { buildBrandLibrarySnapshot } from "../brand-library/builders";
import type { ProposalPersonalizationSnapshot, TenderContext } from "./types";

export function buildTenderContext(input?: { deploymentId?: string }): TenderContext {
  const deploymentId = input?.deploymentId ?? "proposal-personalization-default";
  return {
    tenderId: `tender-${deploymentId}`,
    projectName: "Smart Campus Fitness Center Equipment Procurement",
    projectType: "government-procurement",
    budgetTier: "5M-10M CNY",
    complianceRequirements: ["ISO 9001", "Domestic brand option", "3-year warranty", "On-site installation"],
    mode: "readiness-stub",
  };
}

export function buildProposalPersonalizationSnapshot(input?: {
  deploymentId?: string;
}): ProposalPersonalizationSnapshot {
  const deploymentId = input?.deploymentId ?? "proposal-personalization-default";
  const tenderContext = buildTenderContext({ deploymentId });
  const bidderProfile = buildBidderProfileSnapshot({ deploymentId });
  const brandLibrary = buildBrandLibrarySnapshot({ deploymentId });

  const govFriendlyBrands = brandLibrary.brands
    .filter((entry) => entry.targetSegments.includes("government") || entry.targetSegments.includes("campus"))
    .map((entry) => entry.brand.brandName);

  const differentiationStrategy = {
    strategyId: `diff-${deploymentId}`,
    focusAreas: ["AI-driven tender compliance", "Integrated delivery & support", "Multi-brand flexibility"],
    competitiveAdvantages: [
      bidderProfile.positioning.differentiator,
      `${bidderProfile.certifications.length} active certifications`,
      `On-time delivery rate ${Math.round(bidderProfile.deliveryCapabilities.reduce((s, c) => s + c.onTimeRate, 0) / bidderProfile.deliveryCapabilities.length * 100)}%`,
    ],
    riskMitigations: ["Dual-brand supply chain", "Regional service teams", "Compliance matrix automation"],
  };

  const brandStrategy = {
    strategyId: `brand-strat-${deploymentId}`,
    recommendedBrands: govFriendlyBrands.slice(0, 3),
    tierMix: "standard + premium blend",
    rationale: `Matched ${tenderContext.projectType} requirements with ${brandLibrary.brands.length} catalog brands across ${Object.values(brandLibrary.tierCoverage).filter((c) => c > 0).length} price tiers`,
  };

  const valueProposition = {
    propositionId: `vp-${deploymentId}`,
    headline: "End-to-end intelligent fitness solution with proven delivery capability",
    keyBenefits: [
      "Tender-aligned equipment selection",
      "Certified installation & premium support",
      "AI-enhanced proposal personalization",
    ],
    proofPoints: [
      `${bidderProfile.profile.displayName} — ${bidderProfile.scale} scale`,
      `${bidderProfile.deliveryCapabilities.length} regional delivery hubs`,
      `${brandLibrary.brands.length} brand options in library`,
    ],
    targetOutcome: "Win rate improvement through differentiated, compliant proposals",
  };

  const differentiationReadiness = Math.round(
    (bidderProfile.profileReadiness + brandLibrary.brandReadiness) / 2,
  );

  return {
    snapshotId: `personalization-${deploymentId}`,
    tenderContext,
    differentiationStrategy,
    brandStrategy,
    valueProposition,
    differentiationReadiness,
  };
}
