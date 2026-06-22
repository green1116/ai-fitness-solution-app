/**
 * V60 P2 — Opportunity pipeline
 */

import { OPPORTUNITY_STAGES, type OpportunityStageName } from "./opportunity.stage";

export function getOpportunityPipeline(): readonly OpportunityStageName[] {
  return OPPORTUNITY_STAGES;
}

export function resolveNextOpportunityStage(current: OpportunityStageName): OpportunityStageName | null {
  const idx = OPPORTUNITY_STAGES.indexOf(current);
  if (idx < 0 || idx >= OPPORTUNITY_STAGES.length - 1) return null;
  const next = OPPORTUNITY_STAGES[idx + 1];
  if (next === "LOST") return null;
  return next;
}
