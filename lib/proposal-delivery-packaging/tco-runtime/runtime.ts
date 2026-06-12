import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildTCOProfile } from "./builders";
import type { TCORuntimePayload } from "./types";
import { TCO_RUNTIME_VERSION } from "./types";

export function validateTCORuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): { valid: boolean } {
  const p = buildTCOProfile(input);
  return { valid: p.totalTCO > p.acquisition && p.tcoReadiness > 0 };
}

export function runTCORuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): PackagingRuntimeResult<TCORuntimePayload> {
  const deploymentId = input?.deploymentId ?? "tco-runtime-default";
  const stages: PackagingStageResult[] = [];

  const profile = runStage("tco-runtime-build", "TCO Runtime", () => buildTCOProfile(input), stages);
  const validation = runStage("tco-runtime-validate", "TCO Validation", () => validateTCORuntime(input), stages);
  if (!validation.valid) throw new Error("TCO runtime validation failed");

  const payload: TCORuntimePayload = {
    version: TCO_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    profile,
    tcoReadiness: profile.tcoReadiness,
    summary: `tco-runtime ${profile.proposalLabel} totalTCO=¥${profile.totalTCO.toLocaleString()}`,
  };

  return finalizeRuntime({ domain: "tco-runtime", deploymentId, stages, payload, summary: payload.summary });
}
