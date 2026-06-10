import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildAcquiredLeads } from "./builders";
import type { LeadAcquisitionRuntimePayload } from "./types";
import { LEAD_ACQUISITION_RUNTIME_VERSION } from "./types";

export function validateLeadAcquisitionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const leads = buildAcquiredLeads(input);
  return { valid: leads.length >= 3 && leads.some((l) => l.quality === "high") };
}

export function runLeadAcquisitionRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<LeadAcquisitionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "lead-acq-default";
  const stages: GtmStageResult[] = [];

  const leads = runStage("lead-acq-build", "Acquired Leads", () => buildAcquiredLeads({ deploymentId }), stages);
  const validation = runStage("lead-acq-validate", "Lead Acquisition Validation", () => validateLeadAcquisitionRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Lead acquisition validation failed");

  const payload: LeadAcquisitionRuntimePayload = {
    version: LEAD_ACQUISITION_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    leads,
    pipelineCount: leads.filter((l) => l.stage !== "converted").length,
    highQualityCount: leads.filter((l) => l.quality === "high").length,
    conversionTrend: "up",
    summary: `lead-acquisition pipeline=${leads.filter((l) => l.stage !== "converted").length} highQuality=${leads.filter((l) => l.quality === "high").length}`,
  };

  return finalizeRuntime({ domain: "lead-acquisition", deploymentId, stages, payload, summary: payload.summary });
}
