import type {
  GovernanceOversight,
  TenderGovernanceResult,
  TenderGovernanceRuntimeInput,
} from "../types";
import { TENDER_GOVERNANCE_RUNTIME_VERSION } from "../types";
import { assessGovernanceRisk, buildGovernanceInputsSnapshot } from "./assessGovernanceRisk";
import { appendGovernanceEvent, createGovernanceTrace } from "./governanceTrace";
import {
  resolveGovernanceEscalation,
  resolveGovernancePosture,
} from "./resolveGovernancePosture";
import { runGovernanceControls } from "./runGovernanceControls";

/**
 * V3.4-E8 Tender Governance Runtime
 *
 * Decision → Governance Controls → Risk → Posture → Escalation → Result
 */
export function runTenderGovernanceRuntime(
  input: TenderGovernanceRuntimeInput,
): TenderGovernanceResult {
  const started = Date.now();
  const ranAt = new Date().toISOString();
  let trace = createGovernanceTrace(input.runId);

  trace = appendGovernanceEvent(trace, "collect_inputs", "收集治理输入");
  const inputs = buildGovernanceInputsSnapshot(input);

  trace = appendGovernanceEvent(trace, "assess_risk", "评估治理风险");
  const riskLevel = assessGovernanceRisk(inputs);
  trace = appendGovernanceEvent(trace, "assess_risk", `风险等级 ${riskLevel}`, { inputs });

  trace = appendGovernanceEvent(trace, "run_controls", "执行治理控制");
  const controls = runGovernanceControls(input);
  const controlsPassed = controls.filter((c) => c.passed).length;
  const controlsFailed = controls.length - controlsPassed;
  trace = appendGovernanceEvent(trace, "run_controls", `${controlsPassed}/${controls.length} 通过`);

  const escalation = resolveGovernanceEscalation({
    riskLevel,
    inputs,
    controls,
    policy: input.policy,
  });
  trace = appendGovernanceEvent(trace, "escalation", escalation.reason, {
    level: escalation.level,
    required: escalation.required,
  });

  const resolved = resolveGovernancePosture({
    riskLevel,
    controls,
    escalation,
    policy: input.policy,
  });
  trace = appendGovernanceEvent(trace, "resolve_posture", `姿态 ${resolved.posture}`);

  const oversight: GovernanceOversight = {
    riskLevel,
    posture: resolved.posture,
    decisionStatus: inputs.decisionStatus,
    validationOutcome: inputs.validationOutcome,
    auditGovernance: inputs.governanceStatus,
    coverageScore: inputs.coverageScore,
    controlsPassed,
    controlsFailed,
  };

  const explain = [
    ...resolved.explain,
    ...input.tenderDecision?.recommendedActions.slice(0, 2) ?? [],
  ];

  return {
    version: TENDER_GOVERNANCE_RUNTIME_VERSION,
    runId: input.runId,
    ranAt,
    durationMs: Date.now() - started,
    documentId: input.documentId,
    riskLevel,
    posture: resolved.posture,
    title: resolved.title,
    message: resolved.message,
    oversight,
    controls,
    escalation,
    explain: [...new Set(explain)],
    inputs,
    trace,
  };
}
