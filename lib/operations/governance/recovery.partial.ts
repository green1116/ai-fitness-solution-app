import type { GovernanceRecoveryPartial, GovernanceRecoveryRuntimeInput } from "./recovery.types";

export function buildGovernanceRecoveryPartial(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryPartial {
  const scope: GovernanceRecoveryPartial["scope"] = [];
  if (input.lifecycle.timeline.length > 0) scope.push("lifecycle");
  if (input.store.operations.length > 0) scope.push("store");
  if (input.persistence.restore.restored) scope.push("audit");
  scope.push("orchestration");

  return {
    partialId: `partial-${input.deploymentId.slice(0, 10)}-${Date.now()}`,
    executed: scope.length > 0,
    scope: [...new Set(scope)],
    reason: "Partial recovery rebuilds minimal runtime context by available scope.",
  };
}
