import type { WorkspaceBusinessDomain } from "../domain/workspace-business-domain-types";
import {
  resolveBusinessOrchestrationState,
  resolveBusinessOrchestrationStatus,
} from "./workspace-business-orchestration-rules";
import type { WorkspaceBusinessOrchestration } from "./workspace-business-orchestration-types";

export function createWorkspaceBusinessOrchestration(
  domain: WorkspaceBusinessDomain,
): WorkspaceBusinessOrchestration {
  return {
    scope: { ...domain.scope },
    status: resolveBusinessOrchestrationStatus(domain),
    domainState: domain.state,
    orchestrationState: resolveBusinessOrchestrationState(domain),
  };
}
