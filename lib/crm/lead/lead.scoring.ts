/**
 * V60 P2 — Lead scoring
 */

export type LeadScoreInput = {
  source?: string;
  hasQuote?: boolean;
  hasProject?: boolean;
  engagementCount?: number;
  companySize?: number;
};

export function scoreLead(input: LeadScoreInput): number {
  let score = 10;

  const source = (input.source ?? "").toLowerCase();
  if (source.includes("referral")) score += 25;
  else if (source.includes("campaign") || source.includes("utm")) score += 15;
  else if (source.includes("organic")) score += 10;
  else if (source.includes("quote")) score += 20;

  if (input.hasQuote) score += 30;
  if (input.hasProject) score += 15;
  if (input.engagementCount) score += Math.min(20, input.engagementCount * 5);
  if (input.companySize && input.companySize > 100) score += 10;

  return Math.min(100, score);
}

export function isQualifiedLead(score: number): boolean {
  return score >= 50;
}

export function resolveLeadStatusFromScore(score: number): "NEW" | "QUALIFIED" | "LOST" {
  if (score >= 50) return "QUALIFIED";
  if (score < 20) return "LOST";
  return "NEW";
}
