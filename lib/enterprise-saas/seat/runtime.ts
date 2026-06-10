import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  EnterpriseSaasRuntimeResult,
  EnterpriseSaasStageResult,
} from "../shared/types";
import { ENTERPRISE_SAAS_VERSION } from "../shared/types";
import { buildSeatAllocation } from "./builders";
import type { SeatRuntimePayload } from "./types";
import { SEAT_RUNTIME_VERSION } from "./types";

export function validateSeatRuntime(input?: { deploymentId?: string }): {
  allocationValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "seat-default";
  const allocation = buildSeatAllocation({ deploymentId });

  return {
    allocationValid:
      allocation.licensedSeats > 0 &&
      allocation.activeSeats >= 0 &&
      allocation.availableSeats === allocation.licensedSeats - allocation.activeSeats &&
      allocation.utilizationRate >= 0,
  };
}

export function runSeatRuntime(input?: {
  deploymentId?: string;
}): EnterpriseSaasRuntimeResult<SeatRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "seat-default";
  const stages: EnterpriseSaasStageResult[] = [];

  const allocation = runStage(
    "seat-allocation",
    "Seat Allocation",
    () => buildSeatAllocation({ deploymentId }),
    stages,
  );

  const validation = runStage(
    "seat-validate",
    "Seat Validation",
    () => validateSeatRuntime({ deploymentId }),
    stages,
  );

  if (!Object.values(validation).every(Boolean)) {
    throw new Error("Seat runtime validation failed");
  }

  const payload: SeatRuntimePayload = {
    version: SEAT_RUNTIME_VERSION,
    saasVersion: ENTERPRISE_SAAS_VERSION,
    allocation,
    summary: `seat-runtime licensed=${allocation.licensedSeats} active=${allocation.activeSeats} available=${allocation.availableSeats} utilization=${allocation.utilizationRate}%`,
  };

  return finalizeRuntime({
    domain: "seat",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
