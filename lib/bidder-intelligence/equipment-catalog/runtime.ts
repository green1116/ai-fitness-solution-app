import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildEquipmentCatalogSnapshot } from "./builders";
import type { EquipmentCatalogRuntimePayload } from "./types";
import { EQUIPMENT_CATALOG_RUNTIME_VERSION } from "./types";

export function validateEquipmentCatalogRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildEquipmentCatalogSnapshot(input);
  return { valid: snapshot.catalogReadiness > 0 && snapshot.models.length >= 4 };
}

export function runEquipmentCatalogRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<EquipmentCatalogRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "equipment-catalog-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const snapshot = runStage("equipment-catalog-build", "Equipment Catalog", () => buildEquipmentCatalogSnapshot({ deploymentId }), stages);
  const validation = runStage("equipment-catalog-validate", "Catalog Validation", () => validateEquipmentCatalogRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Equipment catalog validation failed");

  const payload: EquipmentCatalogRuntimePayload = {
    version: EQUIPMENT_CATALOG_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    snapshot,
    catalogReadiness: snapshot.catalogReadiness,
    summary: `equipment-catalog models=${snapshot.models.length} readiness=${snapshot.catalogReadiness}% categories=${Object.values(snapshot.categoryCoverage).filter((c) => c > 0).length}`,
  };

  return finalizeRuntime({ domain: "equipment-catalog", deploymentId, stages, payload, summary: payload.summary });
}
