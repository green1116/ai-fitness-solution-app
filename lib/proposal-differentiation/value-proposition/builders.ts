import { buildBidderProfileSnapshot } from "@/lib/bidder-intelligence/bidder-profile/builders";
import { buildBrandIntelligenceProfiles } from "@/lib/brand-catalog-intelligence/brand-intelligence/builders";
import { buildDifferentiationTenderContext } from "../bridge/tender-context";
import type { DifferentiationBidderBrand } from "../shared/types";
import type { ValuePropositionSnapshot } from "./types";

const BRAND_VALUE_MESSAGES: Record<DifferentiationBidderBrand, { core: string; diff: string; position: string }> = {
  Technogym: {
    core: "Premium wellness experience with Italian design excellence",
    diff: "World-class aesthetic and digital ecosystem for flagship venues",
    position: "Premium wellness leader — design + technology differentiation",
  },
  "Life Fitness": {
    core: "Proven commercial durability with global service reliability",
    diff: "Enterprise-grade equipment with the widest commercial product portfolio",
    position: "Commercial fitness leader — durability + service network",
  },
  Matrix: {
    core: "Balanced innovation with modern UX at competitive price points",
    diff: "Mid-tier excellence — premium features without premium pricing",
    position: "Commercial mid-market — price-performance sweet spot",
  },
  Shuhua: {
    core: "Domestic value leader for government and campus procurement",
    diff: "Compliance-friendly, fast delivery, lowest total cost of ownership",
    position: "Value procurement champion — cost + compliance advantage",
  },
};

export function buildValuePropositionSnapshot(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): ValuePropositionSnapshot {
  const deploymentId = input?.deploymentId ?? "value-proposition-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const tender = buildDifferentiationTenderContext({ deploymentId, bidderBrand });
  const bidderProfile = buildBidderProfileSnapshot({ deploymentId });
  const brandProfiles = buildBrandIntelligenceProfiles({ deploymentId });
  const brandProfile = brandProfiles.find((p) => p.brandName === bidderBrand);
  const messages = BRAND_VALUE_MESSAGES[bidderBrand];

  const keyBenefits = [
    messages.core,
    `${brandProfile?.competitiveAdvantages[0] ?? "Brand strength"} for ${tender.projectName}`,
    `${bidderProfile.profile.displayName} delivery with ${bidderProfile.certifications.length} certifications`,
    ...tender.knowledgeInsights.slice(0, 1),
  ];

  const propositionScore = Math.round(
    (brandProfile?.intelligenceScore ?? 80) * 0.6 +
      bidderProfile.profileReadiness * 0.4,
  );

  return {
    snapshotId: `value-proposition-${bidderBrand}-${deploymentId}`,
    bidderBrand,
    coreValue: messages.core,
    differentiationMessage: messages.diff,
    competitivePosition: messages.position,
    keyBenefits,
    propositionScore,
  };
}
