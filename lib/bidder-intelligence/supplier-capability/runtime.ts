import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildSupplierCapabilitySnapshot } from "./builders";
import type { SupplierCapabilityRuntimePayload } from "./types";
import { SUPPLIER_CAPABILITY_RUNTIME_VERSION } from "./types";

export function validateSupplierCapabilityRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildSupplierCapabilitySnapshot(input);
  return {
    valid:
      snapshot.supplierReadiness > 0 &&
      snapshot.deliveryCoverage.length >= 2 &&
      snapshot.installationCapability.teamSize > 0,
  };
}

export function runSupplierCapabilityRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<SupplierCapabilityRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "supplier-capability-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const snapshot = runStage("supplier-capability-build", "Supplier Capability", () => buildSupplierCapabilitySnapshot({ deploymentId }), stages);
  const validation = runStage("supplier-capability-validate", "Supplier Validation", () => validateSupplierCapabilityRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Supplier capability validation failed");

  const payload: SupplierCapabilityRuntimePayload = {
    version: SUPPLIER_CAPABILITY_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    snapshot,
    supplierReadiness: snapshot.supplierReadiness,
    summary: `supplier-capability regions=${snapshot.deliveryCoverage.length} services=${snapshot.serviceCoverage.length} readiness=${snapshot.supplierReadiness}%`,
  };

  return finalizeRuntime({ domain: "supplier-capability", deploymentId, stages, payload, summary: payload.summary });
}
