import type {
  GovernanceLifecycleReplay,
  GovernanceLifecycleRuntimeInput,
} from "./lifecycle.types";

export function buildLifecycleReplay(
  input: GovernanceLifecycleRuntimeInput,
): GovernanceLifecycleReplay {
  const events = input.orchestration.timeline.entries;
  return {
    replayId: `replay-${input.deploymentId.slice(0, 8)}`,
    supported: events.length > 0,
    events,
    reason:
      events.length > 0
        ? "Replay generated from orchestration timeline."
        : "No timeline events available for replay.",
  };
}
