/**
 * V60 P2 — Lead pipeline stages
 */

export const LEAD_PIPELINE_STAGES = ["NEW", "QUALIFIED", "LOST"] as const;
export type LeadPipelineStage = (typeof LEAD_PIPELINE_STAGES)[number];

export function canAdvanceLead(from: LeadPipelineStage, to: LeadPipelineStage): boolean {
  if (from === "LOST") return false;
  if (from === "NEW" && (to === "QUALIFIED" || to === "LOST")) return true;
  if (from === "QUALIFIED" && to === "LOST") return true;
  return from === to;
}

export function nextLeadStage(current: LeadPipelineStage, score: number): LeadPipelineStage {
  if (score >= 50) return "QUALIFIED";
  if (score < 20) return "LOST";
  return current;
}
