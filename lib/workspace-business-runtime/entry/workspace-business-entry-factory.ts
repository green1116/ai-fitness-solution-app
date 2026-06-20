import type { WorkspaceBusinessOrchestration } from "../orchestration/workspace-business-orchestration-types";
import {
  resolveBusinessEntryState,
  resolveBusinessEntryStatus,
} from "./workspace-business-entry";
import type { WorkspaceBusinessEntry } from "./workspace-business-entry-types";

export function createWorkspaceBusinessEntry(
  orchestration: WorkspaceBusinessOrchestration,
): WorkspaceBusinessEntry {
  return {
    scope: { ...orchestration.scope },
    status: resolveBusinessEntryStatus(orchestration),
    domainState: orchestration.domainState,
    orchestrationState: orchestration.orchestrationState,
    entryState: resolveBusinessEntryState(orchestration),
  };
}
