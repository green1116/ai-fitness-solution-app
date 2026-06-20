import type { WorkspaceBusinessContext } from "../context/workspace-business-context-types";
import {
  resolveBusinessDomainState,
  resolveBusinessDomainStatus,
} from "./workspace-business-domain-rules";
import type { WorkspaceBusinessDomain } from "./workspace-business-domain-types";

export function createWorkspaceBusinessDomain(
  context: WorkspaceBusinessContext,
): WorkspaceBusinessDomain {
  return {
    scope: { ...context.scope },
    status: resolveBusinessDomainStatus(context),
    state: resolveBusinessDomainState(context),
  };
}
