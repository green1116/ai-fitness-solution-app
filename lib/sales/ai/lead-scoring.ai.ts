/**
 * V60 P3 — AI-enhanced lead scoring
 */

import { scoreLead as crmScoreLead } from "@/lib/crm/lead/lead.scoring";
import { analyzeLeadIntent } from "../signals/intent.detector";

export type LeadQualityTier = "LOW" | "MEDIUM" | "HIGH";

export function resolveLeadQualityTier(score: number): LeadQualityTier {
  if (score >= 70) return "HIGH";
  if (score >= 30) return "MEDIUM";
  return "LOW";
}

export function scoreLeadQuality(input: {
  organizationId: string;
  customerId?: string;
  source?: string;
  hasQuote?: boolean;
  hasProject?: boolean;
  engagementCount?: number;
  companySize?: number;
}): { score: number; tier: LeadQualityTier; recommendation: string } {
  const baseScore = crmScoreLead({
    source: input.source,
    hasQuote: input.hasQuote,
    hasProject: input.hasProject,
    engagementCount: input.engagementCount,
    companySize: input.companySize,
  });

  const intent = analyzeLeadIntent({
    organizationId: input.organizationId,
    customerId: input.customerId,
    leadScore: baseScore,
  });

  const score = Math.min(100, Math.round((baseScore + intent.score) / 2));
  const tier = resolveLeadQualityTier(score);

  const recommendation =
    tier === "HIGH"
      ? "Push to deal — high conversion probability"
      : tier === "MEDIUM"
        ? "Follow-up — nurture with quote/budget content"
        : "Nurture — low priority, monitor engagement";

  return { score, tier, recommendation };
}
