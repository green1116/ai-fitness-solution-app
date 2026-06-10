import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import { buildAcceptancePlan, buildDeliveryPlan, buildSupportPlan } from "./builders";
import type { DeliveryScheduleRuntimePayload } from "./types";
import { DELIVERY_SCHEDULE_RUNTIME_VERSION } from "./types";

export function validateDeliveryScheduleRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  return {
    valid:
      buildDeliveryPlan({ deploymentId }).length >= 4 &&
      buildAcceptancePlan({ deploymentId }).length >= 3 &&
      buildSupportPlan({ deploymentId }).length >= 3,
  };
}

export function runDeliveryScheduleRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<DeliveryScheduleRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "delivery-default";
  const stages: ProposalStageResult[] = [];

  const deliveryPlan = runStage("delivery-plan", "Delivery Plan", () => buildDeliveryPlan({ deploymentId }), stages);
  const acceptancePlan = runStage("acceptance-plan", "Acceptance Plan", () => buildAcceptancePlan({ deploymentId }), stages);
  const supportPlan = runStage("support-plan", "Support Plan", () => buildSupportPlan({ deploymentId }), stages);

  const validation = runStage("delivery-validate", "Delivery Schedule Validation", () => validateDeliveryScheduleRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Delivery schedule validation failed");

  const payload: DeliveryScheduleRuntimePayload = {
    version: DELIVERY_SCHEDULE_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    deliveryPlan,
    acceptancePlan,
    supportPlan,
    summary: `delivery-schedule delivery=${deliveryPlan.length} acceptance=${acceptancePlan.length} support=${supportPlan.length}`,
  };

  return finalizeRuntime({ domain: "delivery-schedule", deploymentId, stages, payload, summary: payload.summary });
}
