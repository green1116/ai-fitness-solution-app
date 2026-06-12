import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildAllDeliveryReadinessAssessments } from "./builders";
import type { DeliveryReadinessRuntimePayload } from "./types";
import { DELIVERY_READINESS_RUNTIME_VERSION } from "./types";

export function validateDeliveryReadinessRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { assessments, averageDeliveryReadinessScore } = buildAllDeliveryReadinessAssessments(input);
  return {
    valid:
      assessments.length === 4 &&
      averageDeliveryReadinessScore >= 90 &&
      assessments.every((a) => a.budgetAlignment >= 80),
  };
}

export function runDeliveryReadinessRuntime(input?: {
  deploymentId?: string;
}): PackagingRuntimeResult<DeliveryReadinessRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "delivery-readiness-default";
  const stages: PackagingStageResult[] = [];

  const result = runStage("delivery-readiness-build", "Delivery Readiness", () => buildAllDeliveryReadinessAssessments(input), stages);
  const validation = runStage("delivery-readiness-validate", "Delivery Readiness Validation", () => validateDeliveryReadinessRuntime(input), stages);
  if (!validation.valid) throw new Error("Delivery readiness validation failed");

  const payload: DeliveryReadinessRuntimePayload = {
    version: DELIVERY_READINESS_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    assessments: result.assessments,
    averageDeliveryReadinessScore: result.averageDeliveryReadinessScore,
    summary: `delivery-readiness avg=${result.averageDeliveryReadinessScore}%`,
  };

  return finalizeRuntime({ domain: "delivery-readiness", deploymentId, stages, payload, summary: payload.summary });
}
