import {
  GOVERNANCE_RECOVERY_VERSION,
  type GovernanceRecoveryRuntimeInput,
  type GovernanceRecoveryRuntimeResult,
} from "./recovery.types";
import { selectGovernanceRecoveryStrategy } from "./recovery.strategy";
import { buildGovernanceRecoveryRollback } from "./recovery.rollback";
import { buildGovernanceRecoveryReplay } from "./recovery.replay";
import { buildGovernanceRecoveryPartial } from "./recovery.partial";
import { buildGovernanceRecoveryDegraded } from "./recovery.degraded";
import { buildGovernanceRecoveryAudit } from "./recovery.audit";
import { summarizeGovernanceRecovery } from "./recovery.summary";

export function buildGovernanceRecovery(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryRuntimeResult {
  const strategy = selectGovernanceRecoveryStrategy(input);
  const rollback = buildGovernanceRecoveryRollback(input);
  const replay = buildGovernanceRecoveryReplay(input);
  const partial = buildGovernanceRecoveryPartial(input);
  const degraded = buildGovernanceRecoveryDegraded(input);
  const audit = buildGovernanceRecoveryAudit({
    runtime: input,
    strategy,
    rollbackExecuted: rollback.executed,
    replayExecuted: replay.executed,
    partialExecuted: partial.executed,
    degradedActive: degraded.active,
  });

  const status: GovernanceRecoveryRuntimeResult["status"] = degraded.active
    ? "degraded"
    : rollback.executed || replay.executed || partial.executed
      ? "recovered"
      : strategy === "manualIntervention"
        ? "manualInterventionRequired"
        : "notNeeded";

  const trace = [
    `strategy=${strategy}`,
    `rollback=${rollback.executed}`,
    `replay=${replay.executed}`,
    `partial=${partial.executed}`,
    `degraded=${degraded.active}`,
    `audit=${audit.auditId}`,
  ];

  const core: Omit<GovernanceRecoveryRuntimeResult, "summary"> = {
    version: GOVERNANCE_RECOVERY_VERSION,
    status,
    strategy,
    rollback,
    replay,
    partial,
    degraded,
    audit,
    trace,
  };

  return {
    ...core,
    summary: summarizeGovernanceRecovery(core),
  };
}

export { GOVERNANCE_RECOVERY_VERSION };
