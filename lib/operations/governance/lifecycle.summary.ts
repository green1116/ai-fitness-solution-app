import type { GovernanceLifecycleRuntimeResult } from "./lifecycle.types";

export function summarizeGovernanceLifecycle(
  runtime: Omit<GovernanceLifecycleRuntimeResult, "summary">,
): GovernanceLifecycleRuntimeResult["summary"] {
  const hasRetry = runtime.retries.length > 0;
  const archived = runtime.archive.archived;
  return {
    summaryId: `lifecycle-sum-${runtime.state.lifecycleId.slice(0, 8)}`,
    text: [
      `status=${runtime.state.status}`,
      `complete=${runtime.state.isComplete}`,
      `failed=${runtime.state.isFailed}`,
      `retries=${runtime.retries.length}`,
      `hasRetry=${hasRetry}`,
      `archived=${archived}`,
      `replay=${runtime.replay.supported}`,
      `transitions=${runtime.transitions.length}`,
      `timeline=${runtime.timeline.length}`,
    ].join(" "),
    traceId: `trace-lifecycle-${runtime.state.lifecycleId}`,
  };
}

export const DEFAULT_LIFECYCLE_VERSION = "v4-a3-r5-lifecycle-1" as const;
