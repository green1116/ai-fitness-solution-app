import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ProposalRuntimeResult, ProposalStageResult } from "../shared/types";
import { PROPOSAL_GENERATION_VERSION } from "../shared/types";
import {
  buildEscalationPaths,
  buildMitigationStrategies,
  buildRiskRegister,
} from "./builders";
import type { RiskAnalysisRuntimePayload } from "./types";
import { RISK_ANALYSIS_RUNTIME_VERSION } from "./types";

export function validateRiskAnalysisRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const risks = buildRiskRegister({ deploymentId });
  const mitigations = buildMitigationStrategies({ deploymentId, risks });
  return {
    valid:
      risks.length >= 4 &&
      mitigations.length === risks.length &&
      buildEscalationPaths({ deploymentId }).length >= 3,
  };
}

export function runRiskAnalysisRuntime(input?: {
  deploymentId?: string;
}): ProposalRuntimeResult<RiskAnalysisRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "risk-default";
  const stages: ProposalStageResult[] = [];

  const riskRegister = runStage("risk-register", "Risk Register", () => buildRiskRegister({ deploymentId }), stages);
  const mitigationStrategies = runStage("risk-mitigation", "Mitigation Strategy", () => buildMitigationStrategies({ deploymentId, risks: riskRegister }), stages);
  const escalationPaths = runStage("risk-escalation", "Escalation Path", () => buildEscalationPaths({ deploymentId }), stages);

  const validation = runStage("risk-validate", "Risk Analysis Validation", () => validateRiskAnalysisRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Risk analysis validation failed");

  const payload: RiskAnalysisRuntimePayload = {
    version: RISK_ANALYSIS_RUNTIME_VERSION,
    proposalVersion: PROPOSAL_GENERATION_VERSION,
    riskRegister,
    mitigationStrategies,
    escalationPaths,
    summary: `risk-analysis risks=${riskRegister.length} mitigations=${mitigationStrategies.length} escalation=${escalationPaths.length}`,
  };

  return finalizeRuntime({ domain: "risk-analysis", deploymentId, stages, payload, summary: payload.summary });
}
