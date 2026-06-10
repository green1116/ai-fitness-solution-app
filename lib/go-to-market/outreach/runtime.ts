import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildOutreachRecords, summarizeOutreach } from "./builders";
import type { OutreachRuntimePayload } from "./types";
import { OUTREACH_RUNTIME_VERSION } from "./types";

export function validateOutreachRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildOutreachRecords(input);
  const summary = summarizeOutreach(records);
  return { valid: records.length >= 4 && summary.responseRate > 0 };
}

export function runOutreachRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<OutreachRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "outreach-default";
  const stages: GtmStageResult[] = [];

  const records = runStage("outreach-build", "Outreach Records", () => buildOutreachRecords({ deploymentId }), stages);
  const summary = runStage("outreach-summarize", "Outreach Summary", () => summarizeOutreach(records), stages);
  const validation = runStage("outreach-validate", "Outreach Validation", () => validateOutreachRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Outreach runtime validation failed");

  const payload: OutreachRuntimePayload = {
    version: OUTREACH_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    records,
    responseRate: summary.responseRate,
    conversionRate: summary.conversionRate,
    summary: `outreach-runtime records=${records.length} responseRate=${(summary.responseRate * 100).toFixed(0)}% conversion=${(summary.conversionRate * 100).toFixed(0)}%`,
  };

  return finalizeRuntime({ domain: "outreach-runtime", deploymentId, stages, payload, summary: payload.summary });
}
