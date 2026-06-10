import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildTenderDashboardMetrics } from "./builders";
import type { TenderDashboardRuntimePayload } from "./types";
import { TENDER_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateTenderDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const metrics = buildTenderDashboardMetrics({ deploymentId });
  return {
    valid:
      metrics.intelligenceCompleteness === 100 &&
      metrics.projectUnderstanding > 0 &&
      metrics.complianceUnderstanding > 0,
  };
}

export function runTenderDashboardRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<TenderDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const metrics = runStage(
    "tender-dashboard-metrics",
    "Tender Dashboard Metrics",
    () => buildTenderDashboardMetrics({ deploymentId }),
    stages,
  );
  const validation = runStage(
    "tender-dashboard-validate",
    "Dashboard Validation",
    () => validateTenderDashboardRuntime({ deploymentId }),
    stages,
  );
  if (!validation.valid) throw new Error("Tender dashboard validation failed");

  const payload: TenderDashboardRuntimePayload = {
    version: TENDER_DASHBOARD_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    intelligenceCompleteness: metrics.intelligenceCompleteness,
    projectUnderstanding: metrics.projectUnderstanding,
    riskUnderstanding: metrics.riskUnderstanding,
    complianceUnderstanding: metrics.complianceUnderstanding,
    summary: metrics.summary,
  };

  return finalizeRuntime({
    domain: "tender-dashboard",
    deploymentId,
    stages,
    payload,
    summary: payload.summary,
  });
}
