import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle-types";
import type { QuoteLifecycleView } from "../lifecycle/quote-lifecycle-types";
import type { WorkspaceQuoteRuntimeAssembly, WorkspaceQuoteRuntimeState } from "./quote-runtime-assembly-types";

export function resolveWorkspaceQuoteRuntimeState(
  lifecycleStatus: QuoteLifecycleStatus,
): WorkspaceQuoteRuntimeState {
  switch (lifecycleStatus) {
    case "READY":
      return "ACTIVE";
    case "OPEN":
      return "READY";
    case "PENDING":
    default:
      return "SHELL";
  }
}

export function createWorkspaceQuoteRuntimeAssembly(
  lifecycleView: QuoteLifecycleView,
): WorkspaceQuoteRuntimeAssembly {
  return {
    workspaceId: lifecycleView.workspaceId,
    version: lifecycleView.version,
    quoteReadiness: lifecycleView.quoteReadiness,
    lifecyclePhase: lifecycleView.lifecyclePhase,
    lifecycleStatus: lifecycleView.lifecycleStatus,
    domainState: lifecycleView.domainState,
    runtimeState: resolveWorkspaceQuoteRuntimeState(lifecycleView.lifecycleStatus),
  };
}

export function describeWorkspaceQuoteRuntimeAssembly(
  assembly: WorkspaceQuoteRuntimeAssembly,
): string {
  return [
    `workspaceId=${assembly.workspaceId}`,
    `quoteReadiness=${assembly.quoteReadiness}`,
    `lifecyclePhase=${assembly.lifecyclePhase}`,
    `lifecycleStatus=${assembly.lifecycleStatus}`,
    `runtimeState=${assembly.runtimeState}`,
  ].join(" ");
}

export function assertWorkspaceQuoteRuntimeAssemblyShape(
  assembly: WorkspaceQuoteRuntimeAssembly,
): boolean {
  return (
    assembly.workspaceId.trim().length > 0 &&
    assembly.version.trim().length > 0 &&
    assembly.lifecyclePhase.trim().length > 0 &&
    assembly.lifecycleStatus.trim().length > 0 &&
    assembly.runtimeState.trim().length > 0
  );
}
