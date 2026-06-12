import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ResponsePackRuntimeResult, ResponsePackStageResult } from "../shared/types";
import { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";
import { buildTenderResponseDashboardMetrics } from "./builders";
import type { TenderResponseDashboardRuntimePayload } from "./types";
import { TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateTenderResponseDashboardRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const metrics = buildTenderResponseDashboardMetrics(input);
  return {
    valid:
      metrics.submissionReadiness >= 95 &&
      metrics.tenderResponseReadiness >= 90,
  };
}

export function runTenderResponseDashboardRuntime(input?: {
  deploymentId?: string;
}): ResponsePackRuntimeResult<TenderResponseDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "tender-response-dashboard-default";
  const stages: ResponsePackStageResult[] = [];

  const metrics = runStage("tender-response-dashboard-build", "Tender Response Dashboard", () => buildTenderResponseDashboardMetrics(input), stages);
  const validation = runStage("tender-response-dashboard-validate", "Dashboard Validation", () => validateTenderResponseDashboardRuntime(input), stages);
  if (!validation.valid) throw new Error("Tender response dashboard validation failed");

  const payload: TenderResponseDashboardRuntimePayload = {
    version: TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION,
    packVersion: TENDER_RESPONSE_PACK_VERSION,
    metrics,
    tenderResponseReadiness: metrics.tenderResponseReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "tender-response-dashboard", deploymentId, stages, payload, summary: payload.summary });
}
