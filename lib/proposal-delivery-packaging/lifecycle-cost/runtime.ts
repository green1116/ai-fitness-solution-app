import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildLifecycleCostProfile } from "./builders";
import type { LifecycleCostRuntimePayload } from "./types";
import { LIFECYCLE_COST_RUNTIME_VERSION } from "./types";

export function validateLifecycleCostRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): { valid: boolean } {
  const p = buildLifecycleCostProfile(input);
  return { valid: p.totalLifecycleCost > p.acquisitionCost && p.lifecycleReadiness > 0 };
}

export function runLifecycleCostRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): PackagingRuntimeResult<LifecycleCostRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "lifecycle-cost-default";
  const stages: PackagingStageResult[] = [];

  const profile = runStage("lifecycle-cost-build", "Lifecycle Cost", () => buildLifecycleCostProfile(input), stages);
  const validation = runStage("lifecycle-cost-validate", "Lifecycle Cost Validation", () => validateLifecycleCostRuntime(input), stages);
  if (!validation.valid) throw new Error("Lifecycle cost validation failed");

  const payload: LifecycleCostRuntimePayload = {
    version: LIFECYCLE_COST_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    profile,
    lifecycleReadiness: profile.lifecycleReadiness,
    summary: `lifecycle-cost ${profile.proposalLabel} tier=${profile.strategyTier} total=¥${profile.totalLifecycleCost.toLocaleString()}`,
  };

  return finalizeRuntime({ domain: "lifecycle-cost", deploymentId, stages, payload, summary: payload.summary });
}
