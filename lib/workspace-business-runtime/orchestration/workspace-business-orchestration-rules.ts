import type { BusinessStatus } from "../context/workspace-business-context-types";
import type { WorkspaceBusinessDomain } from "../domain/workspace-business-domain-types";
import type { BusinessOrchestrationState } from "./workspace-business-orchestration-types";

export function resolveBusinessOrchestrationStatus(domain: WorkspaceBusinessDomain): BusinessStatus {
  return domain.status;
}

export function resolveBusinessOrchestrationState(
  domain: WorkspaceBusinessDomain,
): BusinessOrchestrationState {
  switch (domain.state) {
    case "ACTIVE":
      return "READY";
    case "LIMITED":
      return "LIMITED";
    case "INITIALIZING":
    default:
      return "IDLE";
  }
}
