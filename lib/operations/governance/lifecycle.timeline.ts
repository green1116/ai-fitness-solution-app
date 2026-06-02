import type { GovernanceLifecycleRuntimeInput } from "./lifecycle.types";

export function buildLifecycleTimeline(input: GovernanceLifecycleRuntimeInput) {
  return input.orchestration.timeline.entries;
}
