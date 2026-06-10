import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildVersionState } from "./builders";
import type { VersionRuntimePayload } from "./types";
import { VERSION_RUNTIME_VERSION } from "./types";

export function validateVersionRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const state = buildVersionState(input);
  return {
    valid:
      state.versionHistory.length >= 2 &&
      state.currentVersion.isCurrent &&
      state.previousVersion !== null,
  };
}

export function runVersionRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<VersionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "version-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const state = runStage(
    "version-state",
    "Version State",
    () => buildVersionState({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "version-validate",
    "Version Validation",
    () => validateVersionRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Version runtime validation failed");

  const payload: VersionRuntimePayload = {
    version: VERSION_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    currentVersion: state.currentVersion,
    previousVersion: state.previousVersion,
    versionHistory: state.versionHistory,
    summary: `version-runtime current=${state.currentVersion.versionLabel} history=${state.versionHistory.length}`,
  };

  return finalizeRuntime({
    domain: "version-runtime",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
