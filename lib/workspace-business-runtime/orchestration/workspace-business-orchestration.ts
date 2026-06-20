import type { BusinessScope } from "../context/workspace-business-context-types";
import type { WorkspaceBusinessOrchestration } from "./workspace-business-orchestration-types";

export function describeWorkspaceBusinessOrchestration(
  orchestration: WorkspaceBusinessOrchestration,
): string {
  return [
    `workspaceId=${orchestration.scope.workspaceId}`,
    `version=${orchestration.scope.version}`,
    `status=${orchestration.status}`,
    `domainState=${orchestration.domainState}`,
    `orchestrationState=${orchestration.orchestrationState}`,
  ].join(" ");
}

export function assertBusinessOrchestrationScope(scope: BusinessScope): boolean {
  return scope.workspaceId.trim().length > 0 && scope.version.trim().length > 0;
}

export function assertWorkspaceBusinessOrchestrationShape(
  orchestration: WorkspaceBusinessOrchestration,
): boolean {
  if (!assertBusinessOrchestrationScope(orchestration.scope)) {
    return false;
  }
  if (!["READY", "PARTIAL", "BLOCKED"].includes(orchestration.status)) {
    return false;
  }
  if (!["INITIALIZING", "ACTIVE", "LIMITED"].includes(orchestration.domainState)) {
    return false;
  }
  if (!["IDLE", "READY", "LIMITED"].includes(orchestration.orchestrationState)) {
    return false;
  }
  return true;
}
