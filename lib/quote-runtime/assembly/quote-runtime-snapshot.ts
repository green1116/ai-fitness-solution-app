import type { WorkspaceQuoteRuntimeAssembly, WorkspaceQuoteRuntimeSnapshot } from "./quote-runtime-assembly-types";

export function createWorkspaceQuoteRuntimeSnapshot(
  assembly: WorkspaceQuoteRuntimeAssembly,
): WorkspaceQuoteRuntimeSnapshot {
  return Object.freeze({
    workspaceId: assembly.workspaceId,
    version: assembly.version,
    quoteReadiness: assembly.quoteReadiness,
    lifecyclePhase: assembly.lifecyclePhase,
    lifecycleStatus: assembly.lifecycleStatus,
    domainState: assembly.domainState,
    runtimeState: assembly.runtimeState,
  });
}

export function describeWorkspaceQuoteRuntimeSnapshot(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): string {
  return [
    `workspaceId=${snapshot.workspaceId}`,
    `lifecycleStatus=${snapshot.lifecycleStatus}`,
    `runtimeState=${snapshot.runtimeState}`,
  ].join(" ");
}
