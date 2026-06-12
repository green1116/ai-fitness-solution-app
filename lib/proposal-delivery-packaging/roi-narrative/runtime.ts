import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildROINarrative } from "./builders";
import type { ROINarrativeRuntimePayload } from "./types";
import { ROI_NARRATIVE_RUNTIME_VERSION } from "./types";

export function validateROINarrativeRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): { valid: boolean } {
  const n = buildROINarrative(input);
  return { valid: n.roiReadiness >= 70 && n.investmentLogic.length > 80 };
}

export function runROINarrativeRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): PackagingRuntimeResult<ROINarrativeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "roi-narrative-default";
  const stages: PackagingStageResult[] = [];

  const narrative = runStage("roi-narrative-build", "ROI Narrative", () => buildROINarrative(input), stages);
  const validation = runStage("roi-narrative-validate", "ROI Validation", () => validateROINarrativeRuntime(input), stages);
  if (!validation.valid) throw new Error("ROI narrative validation failed");

  const payload: ROINarrativeRuntimePayload = {
    version: ROI_NARRATIVE_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    narrative,
    roiReadiness: narrative.roiReadiness,
    summary: `roi-narrative ${narrative.proposalLabel} readiness=${narrative.roiReadiness}%`,
  };

  return finalizeRuntime({ domain: "roi-narrative", deploymentId, stages, payload, summary: payload.summary });
}
