import type { TenderGovernanceResult } from "../types";

export function summarizeTenderGovernance(result: TenderGovernanceResult): string {
  return [
    `Tender Governance ${result.version}`,
    `risk=${result.riskLevel}`,
    `posture=${result.posture}`,
    result.title,
    `controls=${result.oversight.controlsPassed}/${result.oversight.controlsPassed + result.oversight.controlsFailed}`,
    result.escalation.required ? `escalate=${result.escalation.level}` : "no-escalation",
  ].join(" | ");
}
