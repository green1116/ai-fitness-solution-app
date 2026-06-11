import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildEquipmentIntelligenceSnapshot } from "./builders";
import type { EquipmentIntelligenceRuntimePayload } from "./types";
import { EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateEquipmentIntelligenceRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildEquipmentIntelligenceSnapshot(input);
  return {
    valid:
      snapshot.equipmentReadiness > 0 &&
      snapshot.profiles.length >= 8 &&
      Object.values(snapshot.categoryCoverage).filter((c) => c > 0).length >= 4,
  };
}

export function runEquipmentIntelligenceRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<EquipmentIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-intelligence-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("equipment-intelligence-build", "Equipment Intelligence", () => buildEquipmentIntelligenceSnapshot({ deploymentId }), stages);
  const validation = runStage("equipment-intelligence-validate", "Equipment Validation", () => validateEquipmentIntelligenceRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment intelligence validation failed");

  const payload: EquipmentIntelligenceRuntimePayload = {
    version: EQUIPMENT_INTELLIGENCE_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    equipmentReadiness: snapshot.equipmentReadiness,
    summary: `equipment-intelligence profiles=${snapshot.profiles.length} categories=${Object.values(snapshot.categoryCoverage).filter((c) => c > 0).length} readiness=${snapshot.equipmentReadiness}%`,
  };

  return finalizeRuntime({ domain: "equipment-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
