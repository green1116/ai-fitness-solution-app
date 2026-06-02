import type { GovernanceControlResult, GovernancePolicyResult } from "./types";

export function buildGovernanceControls(policy: GovernancePolicyResult[]): GovernanceControlResult[] {
  return policy.map((p, idx) => ({
    controlId: `gctrl-${idx + 1}`,
    controlType:
      p.action === "mustExecute"
        ? "runtimeControl"
        : p.action === "needsApproval"
          ? "approvalControl"
          : p.action === "needsEscalation"
            ? "riskControl"
            : "changeControl",
    title: `Control for ${p.recommendationId}`,
    required: p.action !== "canDefer",
    status: p.action === "riskException" ? "pending" : "active",
    source: "governance.controls",
    traceId: `trace-control-${p.recommendationId}`,
    evidence: [p.reason],
  }));
}
