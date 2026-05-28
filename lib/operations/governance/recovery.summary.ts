import type { GovernanceRecoveryRuntimeResult } from "./recovery.types";

export function summarizeGovernanceRecovery(
  runtime: Omit<GovernanceRecoveryRuntimeResult, "summary">,
): GovernanceRecoveryRuntimeResult["summary"] {
  return {
    summaryId: `recovery-sum-${Date.now()}`,
    text: [
      `status=${runtime.status}`,
      `strategy=${runtime.strategy}`,
      `rollback=${runtime.rollback.executed}`,
      `replay=${runtime.replay.executed}`,
      `partial=${runtime.partial.executed}`,
      `degraded=${runtime.degraded.active}`,
      `manualIntervention=${runtime.strategy === "manualIntervention"}`,
      `auditActions=${runtime.audit.actions.length}`,
    ].join(" "),
    traceId: `trace-recovery-${runtime.rollback.rollbackId}`,
  };
}
