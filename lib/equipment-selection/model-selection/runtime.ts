import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildModelSelectionSnapshot } from "./builders";
import type { ModelSelectionRuntimePayload } from "./types";
import { MODEL_SELECTION_RUNTIME_VERSION } from "./types";

export function validateModelSelectionRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").SelectionBidderBrand;
}): { valid: boolean } {
  const snapshot = buildModelSelectionSnapshot(input);
  return { valid: snapshot.modelReadiness > 0 && snapshot.preferredModel.modelId.length > 0 };
}

export function runModelSelectionRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").SelectionBidderBrand;
}): SelectionRuntimeResult<ModelSelectionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "model-selection-default";
  const stages: SelectionStageResult[] = [];

  const snapshot = runStage("model-selection-build", "Model Selection", () => buildModelSelectionSnapshot(input), stages);
  const validation = runStage("model-selection-validate", "Model Validation", () => validateModelSelectionRuntime(input), stages);
  if (!validation.valid) throw new Error("Model selection validation failed");

  const payload: ModelSelectionRuntimePayload = {
    version: MODEL_SELECTION_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    snapshot,
    modelReadiness: snapshot.modelReadiness,
    summary: `model-selection bidder=${snapshot.bidderBrand} route=${snapshot.routeType} preferred=${snapshot.preferredModel.modelName} readiness=${snapshot.modelReadiness}%`,
  };

  return finalizeRuntime({ domain: "model-selection", deploymentId, stages, payload, summary: payload.summary });
}
