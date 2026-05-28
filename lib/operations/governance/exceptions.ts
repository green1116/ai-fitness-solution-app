import type { GovernanceExceptionResult, GovernancePolicyResult } from "./types";

export function buildGovernanceExceptions(policy: GovernancePolicyResult[]): GovernanceExceptionResult[] {
  const exceptions = policy.filter((p) => p.action === "riskException");
  return exceptions.map((p, idx) => ({
    exceptionId: `gex-${idx + 1}`,
    exceptionType: "riskAccepted",
    active: true,
    reason: p.reason,
    expiresAt: null,
    source: "governance.exceptions",
    traceId: `trace-exception-${p.recommendationId}`,
  }));
}
