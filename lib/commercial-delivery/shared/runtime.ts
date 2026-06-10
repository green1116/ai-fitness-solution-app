import type {
  CommercialDeliveryRuntimeResult,
  CommercialDeliveryStageResult,
} from "./types";
import { COMMERCIAL_DELIVERY_VERSION } from "./types";

export function runStage<T>(
  stageId: string,
  label: string,
  fn: () => T,
  stages: CommercialDeliveryStageResult[],
): T {
  const started = Date.now();
  try {
    const result = fn();
    stages.push({
      stageId,
      label,
      status: "completed",
      durationMs: Date.now() - started,
      message: `${label} — 完成`,
    });
    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    stages.push({
      stageId,
      label,
      status: "failed",
      durationMs: Date.now() - started,
      message,
    });
    throw err;
  }
}

export function finalizeRuntime<TPayload>(input: {
  domain: string;
  deploymentId: string;
  stages: CommercialDeliveryStageResult[];
  payload: TPayload;
  summary: string;
}): CommercialDeliveryRuntimeResult<TPayload> {
  const failed = input.stages.some((stage) => stage.status === "failed");
  return {
    version: COMMERCIAL_DELIVERY_VERSION,
    runtimeId: `${input.domain}-runtime-${input.deploymentId}`,
    domain: input.domain,
    status: failed ? "failed" : "success",
    stages: input.stages,
    payload: input.payload,
    evidenceId: `evidence-${input.domain}-${input.deploymentId}`,
    summary: input.summary,
    completedAt: new Date().toISOString(),
  };
}

export function assertRuntimeSuccess<TPayload>(
  result: CommercialDeliveryRuntimeResult<TPayload>,
): void {
  if (result.status !== "success") {
    const failed = result.stages.filter((stage) => stage.status === "failed");
    throw new Error(
      `Runtime ${result.runtimeId} failed: ${failed.map((stage) => stage.message).join("; ")}`,
    );
  }
}
