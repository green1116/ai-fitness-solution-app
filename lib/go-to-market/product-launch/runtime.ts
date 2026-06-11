import { finalizeRuntime, runStage } from "../shared/runtime";
import type { GtmRuntimeResult, GtmStageResult } from "../shared/types";
import { GO_TO_MARKET_VERSION } from "../shared/types";
import { buildCurrentLaunch, buildLaunchHistory } from "./builders";
import type { ProductLaunchRuntimePayload } from "./types";
import { PRODUCT_LAUNCH_RUNTIME_VERSION } from "./types";

export function validateProductLaunchRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const launch = buildCurrentLaunch(input);
  const history = buildLaunchHistory(input);
  return { valid: launch.launchReadiness > 0 && history.length >= 2 };
}

export function runProductLaunchRuntime(input?: {
  deploymentId?: string;
}): GtmRuntimeResult<ProductLaunchRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "launch-default";
  const stages: GtmStageResult[] = [];

  const currentLaunch = runStage("launch-build", "Product Launch", () => buildCurrentLaunch({ deploymentId }), stages);
  const launchHistory = runStage("launch-history", "Launch History", () => buildLaunchHistory({ deploymentId }), stages);
  const validation = runStage("launch-validate", "Launch Validation", () => validateProductLaunchRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Product launch validation failed");

  const payload: ProductLaunchRuntimePayload = {
    version: PRODUCT_LAUNCH_RUNTIME_VERSION,
    gtmVersion: GO_TO_MARKET_VERSION,
    currentLaunch,
    launchHistory,
    launchReadiness: currentLaunch.launchReadiness,
    summary: `product-launch version=${currentLaunch.launchVersion} readiness=${currentLaunch.launchReadiness}% history=${launchHistory.length}`,
  };

  return finalizeRuntime({ domain: "product-launch", deploymentId, stages, payload, summary: payload.summary });
}
