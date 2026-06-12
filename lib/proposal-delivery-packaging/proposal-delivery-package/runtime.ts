import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildAllProposalDeliveryPackages } from "./builders";
import type { ProposalDeliveryPackageRuntimePayload } from "./types";
import { PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION } from "./types";

export function validateProposalDeliveryPackageRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { packages } = buildAllProposalDeliveryPackages(input);
  return {
    valid:
      packages.length === 4 &&
      packages.every((p) => p.deliveryPackageReadiness >= 80),
  };
}

export function runProposalDeliveryPackageRuntime(input?: {
  deploymentId?: string;
}): PackagingRuntimeResult<ProposalDeliveryPackageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-delivery-package-default";
  const stages: PackagingStageResult[] = [];

  const result = runStage("proposal-delivery-package-build", "Proposal Delivery Package", () => buildAllProposalDeliveryPackages(input), stages);
  const validation = runStage("proposal-delivery-package-validate", "Delivery Package Validation", () => validateProposalDeliveryPackageRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal delivery package validation failed");

  const payload: ProposalDeliveryPackageRuntimePayload = {
    version: PROPOSAL_DELIVERY_PACKAGE_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    packages: result.packages,
    packageCount: result.packages.length,
    summary: `proposal-delivery-package count=${result.packages.length} avgReadiness=${Math.round(result.packages.reduce((s, p) => s + p.deliveryPackageReadiness, 0) / result.packages.length)}%`,
  };

  return finalizeRuntime({ domain: "proposal-delivery-package", deploymentId, stages, payload, summary: payload.summary });
}
