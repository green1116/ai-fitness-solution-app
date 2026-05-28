import type { GovernanceRecoveryDegraded, GovernanceRecoveryRuntimeInput } from "./recovery.types";

export function buildGovernanceRecoveryDegraded(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryDegraded {
  const needsManual = input.lifecycle.state.status === "waitingApproval";
  const missingStore = input.store.loaded.snapshot === null || input.store.loaded.checkpoint === null;
  const active = needsManual || missingStore;
  const mode: GovernanceRecoveryDegraded["mode"] = needsManual
    ? "manual-review-only"
    : missingStore
      ? "audit-only"
      : "none";

  return {
    degradedId: `degraded-${input.deploymentId.slice(0, 10)}-${Date.now()}`,
    active,
    mode,
    reason: active
      ? "Recovery entered degraded mode due to manual/store constraints."
      : "Full recovery mode available.",
  };
}
