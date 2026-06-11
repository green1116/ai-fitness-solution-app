import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildEquipmentMatchingSnapshot } from "./builders";
import type { EquipmentMatchingRuntimePayload } from "./types";
import { EQUIPMENT_MATCHING_RUNTIME_VERSION } from "./types";

export function validateEquipmentMatchingRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildEquipmentMatchingSnapshot(input);
  return {
    valid:
      snapshot.matchingReadiness > 0 &&
      snapshot.preferredOptions.length >= 2 &&
      snapshot.alternativeOptions.length >= 1,
  };
}

export function runEquipmentMatchingRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<EquipmentMatchingRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-matching-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("equipment-matching-build", "Equipment Matching", () => buildEquipmentMatchingSnapshot({ deploymentId }), stages);
  const validation = runStage("equipment-matching-validate", "Matching Validation", () => validateEquipmentMatchingRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment matching validation failed");

  const payload: EquipmentMatchingRuntimePayload = {
    version: EQUIPMENT_MATCHING_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    matchingReadiness: snapshot.matchingReadiness,
    summary: `equipment-matching preferred=${snapshot.preferredOptions.length} alternative=${snapshot.alternativeOptions.length} readiness=${snapshot.matchingReadiness}%`,
  };

  return finalizeRuntime({ domain: "equipment-matching", deploymentId, stages, payload, summary: payload.summary });
}
