/**
 * V60 P2 — Opportunity stage definitions
 */

export const OPPORTUNITY_STAGES = [
  "INIT",
  "PROPOSAL",
  "NEGOTIATION",
  "WON",
  "LOST",
] as const;

export type OpportunityStageName = (typeof OPPORTUNITY_STAGES)[number];

export function canAdvanceOpportunityStage(
  from: OpportunityStageName,
  to: OpportunityStageName,
): boolean {
  const order = OPPORTUNITY_STAGES.indexOf(from);
  const target = OPPORTUNITY_STAGES.indexOf(to);
  if (order < 0 || target < 0) return false;
  if (from === "WON" || from === "LOST") return false;
  return target === order + 1 || to === "LOST";
}

export function isWonStage(stage: string): boolean {
  return stage.toUpperCase() === "WON";
}

export function isLostStage(stage: string): boolean {
  return stage.toUpperCase() === "LOST";
}
