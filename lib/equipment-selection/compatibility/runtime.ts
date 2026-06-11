import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildCompatibilitySnapshot } from "./builders";
import type { CompatibilityRuntimePayload } from "./types";
import { COMPATIBILITY_RUNTIME_VERSION } from "./types";

export function validateCompatibilityRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildCompatibilitySnapshot(input);
  return { valid: snapshot.compatibilityScore > 0 && snapshot.categoryCoverage > 0 };
}

export function runCompatibilityRuntime(input?: {
  deploymentId?: string;
}): SelectionRuntimeResult<CompatibilityRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "compatibility-default";
  const stages: SelectionStageResult[] = [];

  const snapshot = runStage("compatibility-build", "Compatibility", () => buildCompatibilitySnapshot({ deploymentId }), stages);
  const validation = runStage("compatibility-validate", "Compatibility Validation", () => validateCompatibilityRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Compatibility validation failed");

  const payload: CompatibilityRuntimePayload = {
    version: COMPATIBILITY_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    snapshot,
    compatibilityScore: snapshot.compatibilityScore,
    summary: `compatibility category=${snapshot.categoryCoverage}% quantity=${snapshot.quantityCoverage}% requirement=${snapshot.requirementCoverage}% score=${snapshot.compatibilityScore}%`,
  };

  return finalizeRuntime({ domain: "compatibility", deploymentId, stages, payload, summary: payload.summary });
}
