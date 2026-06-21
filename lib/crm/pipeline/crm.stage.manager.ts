/**
 * V60 P2 — CRM stage manager
 */

import { LEAD_PIPELINE_STAGES } from "../lead/lead.pipeline";
import { OPPORTUNITY_STAGES } from "../opportunity/opportunity.stage";

export type CRMEntityType = "lead" | "opportunity" | "deal";

export function getStagesForEntity(entity: CRMEntityType): readonly string[] {
  switch (entity) {
    case "lead":
      return LEAD_PIPELINE_STAGES;
    case "opportunity":
      return OPPORTUNITY_STAGES;
    case "deal":
      return ["OPEN", "CLOSED_WON", "CLOSED_LOST"];
    default:
      return [];
  }
}

export function isTerminalStage(entity: CRMEntityType, stage: string): boolean {
  const normalized = stage.toUpperCase();
  if (entity === "lead") return normalized === "LOST" || normalized === "QUALIFIED";
  if (entity === "opportunity") return normalized === "WON" || normalized === "LOST";
  if (entity === "deal") return normalized.startsWith("CLOSED");
  return false;
}

export function resolveStageLabel(entity: CRMEntityType, stage: string): string {
  return `${entity}:${stage}`;
}
