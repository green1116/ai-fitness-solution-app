import { buildLeads } from "@/lib/revenue-operations/lead/builders";
import type { AcquiredLead, LeadQuality, LeadStage } from "./types";

const STAGE_MAP: Record<string, LeadStage> = {
  new: "new",
  qualified: "mql",
  contacted: "sql",
  converted: "converted",
  lost: "new",
};

function resolveQuality(score: number): LeadQuality {
  if (score >= 80) return "high";
  if (score >= 55) return "medium";
  return "low";
}

export function buildAcquiredLeads(input?: { deploymentId?: string }): AcquiredLead[] {
  const deploymentId = input?.deploymentId ?? "lead-acq-default";
  const revLeads = buildLeads({ deploymentId });

  return revLeads.map((l) => ({
    leadId: `gtm-lead-${l.leadId}`,
    source: l.source,
    stage: STAGE_MAP[l.status] ?? "new",
    score: l.score,
    quality: resolveQuality(l.score),
    companyName: l.companyName,
    mode: "readiness-stub" as const,
  }));
}
