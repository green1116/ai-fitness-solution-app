import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildRiskIntelligence } from "./builders";
import type { RiskIntelligenceRuntimePayload } from "./types";
import { RISK_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateRiskIntelligenceRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const risk = buildRiskIntelligence({ deploymentId });
  return { valid: risk.drivers.length >= 3 && risk.summary.length > 0 };
}

export function runRiskIntelligenceRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<RiskIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const risk = runStage("risk-intelligence", "Risk Intelligence", () => buildRiskIntelligence({ deploymentId }), stages);
  const validation = runStage("risk-validate", "Risk Validation", () => validateRiskIntelligenceRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Risk intelligence validation failed");

  const payload: RiskIntelligenceRuntimePayload = {
    version: RISK_INTELLIGENCE_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    risk,
    summary: `risk-intelligence level=${risk.riskLevel} drivers=${risk.drivers.length}`,
  };

  return finalizeRuntime({ domain: "risk-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
