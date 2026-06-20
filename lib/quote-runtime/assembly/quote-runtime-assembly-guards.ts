import type { QuoteLifecycleStatus } from "../lifecycle/quote-lifecycle-types";
import {
  WORKSPACE_QUOTE_RUNTIME_STATE_VALUES,
  type WorkspaceQuoteRuntimeAssembly,
} from "./quote-runtime-assembly-types";
import { resolveWorkspaceQuoteRuntimeState } from "./quote-runtime-assembly-view";

export function validateWorkspaceQuoteRuntimeAssembly(
  assembly: WorkspaceQuoteRuntimeAssembly,
): { valid: boolean; summary: string } {
  const valid =
    assembly.workspaceId.trim().length > 0 &&
    assembly.version.trim().length > 0 &&
    WORKSPACE_QUOTE_RUNTIME_STATE_VALUES.includes(assembly.runtimeState) &&
    assembly.runtimeState === resolveWorkspaceQuoteRuntimeState(assembly.lifecycleStatus);

  return {
    valid,
    summary: [
      `workspaceId=${assembly.workspaceId}`,
      `lifecycleStatus=${assembly.lifecycleStatus}`,
      `runtimeState=${assembly.runtimeState}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertWorkspaceQuoteRuntimeAssemblyGuard(
  assembly: WorkspaceQuoteRuntimeAssembly,
): boolean {
  return validateWorkspaceQuoteRuntimeAssembly(assembly).valid;
}
