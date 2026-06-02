import type { GovernanceRecoveryReplay, GovernanceRecoveryRuntimeInput } from "./recovery.types";

export function buildGovernanceRecoveryReplay(
  input: GovernanceRecoveryRuntimeInput,
): GovernanceRecoveryReplay {
  const eventCount = input.lifecycle.timeline.length;
  return {
    replayId: `recovery-replay-${input.deploymentId.slice(0, 10)}-${Date.now()}`,
    executed: eventCount > 0,
    basedOn: "timeline",
    replayEventCount: eventCount,
    reason: eventCount > 0 ? "Replay recovery based on lifecycle timeline." : "No events for replay.",
  };
}
