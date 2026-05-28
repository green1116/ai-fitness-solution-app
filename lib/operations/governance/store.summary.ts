import type { GovernanceStoreRuntimeResult } from "./store.types";

export function summarizeGovernanceStore(
  runtime: Omit<GovernanceStoreRuntimeResult, "summary">,
): GovernanceStoreRuntimeResult["summary"] {
  return {
    summaryId: `store-sum-${Date.now()}`,
    text: [
      `backend=${runtime.backend}`,
      `status=${runtime.status}`,
      `operations=${runtime.operations.length}`,
      `snapshotLoaded=${Boolean(runtime.loaded.snapshot)}`,
      `checkpointLoaded=${Boolean(runtime.loaded.checkpoint)}`,
      `archiveLoaded=${Boolean(runtime.loaded.archive)}`,
      `backends=${runtime.registry.availableBackends.join(",")}`,
    ].join(" "),
    traceId: runtime.trace.traceId,
  };
}
