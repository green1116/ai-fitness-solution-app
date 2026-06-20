import type { BusinessStatus, WorkspaceBusinessContext } from "../context/workspace-business-context-types";
import type { BusinessDomainState } from "./workspace-business-domain-types";

export function resolveBusinessDomainStatus(context: WorkspaceBusinessContext): BusinessStatus {
  return context.readiness.readiness;
}

export function resolveBusinessDomainState(context: WorkspaceBusinessContext): BusinessDomainState {
  switch (resolveBusinessDomainStatus(context)) {
    case "READY":
      return "ACTIVE";
    case "PARTIAL":
      return "LIMITED";
    case "BLOCKED":
    default:
      return "INITIALIZING";
  }
}
