import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildMaintenanceNarrative } from "./builders";
import type { MaintenanceNarrativeRuntimePayload } from "./types";
import { MAINTENANCE_NARRATIVE_RUNTIME_VERSION } from "./types";

export function validateMaintenanceNarrativeRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): { valid: boolean } {
  const n = buildMaintenanceNarrative(input);
  return { valid: n.supportReadiness >= 80 && n.serviceCoverage.length > 40 };
}

export function runMaintenanceNarrativeRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): PackagingRuntimeResult<MaintenanceNarrativeRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "maintenance-narrative-default";
  const stages: PackagingStageResult[] = [];

  const narrative = runStage("maintenance-narrative-build", "Maintenance Narrative", () => buildMaintenanceNarrative(input), stages);
  const validation = runStage("maintenance-narrative-validate", "Maintenance Validation", () => validateMaintenanceNarrativeRuntime(input), stages);
  if (!validation.valid) throw new Error("Maintenance narrative validation failed");

  const payload: MaintenanceNarrativeRuntimePayload = {
    version: MAINTENANCE_NARRATIVE_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    narrative,
    maintenanceReadiness: narrative.maintenanceReadiness,
    summary: `maintenance-narrative ${narrative.proposalLabel} support=${narrative.supportReadiness}%`,
  };

  return finalizeRuntime({ domain: "maintenance-narrative", deploymentId, stages, payload, summary: payload.summary });
}
