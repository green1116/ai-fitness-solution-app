import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "../shared/types";
import { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";
import { buildApprovalRecords, resolveCurrentApprovalStatus } from "./builders";
import type { ApprovalRuntimePayload } from "./types";
import { APPROVAL_RUNTIME_VERSION } from "./types";

export function validateApprovalRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const records = buildApprovalRecords(input);
  const currentStatus = resolveCurrentApprovalStatus(records);
  return {
    valid: records.length === 4 && currentStatus === "review",
  };
}

export function runApprovalRuntime(input?: {
  deploymentId?: string;
}): CommercialDeliveryRuntimeResult<ApprovalRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "approval-default";
  const stages: CommercialDeliveryStageResult[] = [];

  const records = runStage(
    "approval-records",
    "Approval Records",
    () => buildApprovalRecords({ deploymentId }),
    stages,
  );
  const currentStatus = runStage(
    "approval-status",
    "Current Approval Status",
    () => resolveCurrentApprovalStatus(records),
    stages,
  );
  const validation = runStage(
    "approval-validate",
    "Approval Validation",
    () => validateApprovalRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Approval runtime validation failed");

  const payload: ApprovalRuntimePayload = {
    version: APPROVAL_RUNTIME_VERSION,
    deliveryVersion: COMMERCIAL_DELIVERY_VERSION,
    records,
    currentStatus,
    summary: `approval-runtime status=${currentStatus} records=${records.length}`,
  };

  return finalizeRuntime({
    domain: "approval-runtime",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
