import type { BusinessScope } from "../context/workspace-business-context-types";
import type { WorkspaceBusinessDomain } from "./workspace-business-domain-types";

export function describeWorkspaceBusinessDomain(domain: WorkspaceBusinessDomain): string {
  return [
    `workspaceId=${domain.scope.workspaceId}`,
    `version=${domain.scope.version}`,
    `status=${domain.status}`,
    `state=${domain.state}`,
  ].join(" ");
}

export function assertBusinessDomainScope(scope: BusinessScope): boolean {
  return scope.workspaceId.trim().length > 0 && scope.version.trim().length > 0;
}

export function assertWorkspaceBusinessDomainShape(domain: WorkspaceBusinessDomain): boolean {
  if (!assertBusinessDomainScope(domain.scope)) {
    return false;
  }
  if (!["READY", "PARTIAL", "BLOCKED"].includes(domain.status)) {
    return false;
  }
  if (!["INITIALIZING", "ACTIVE", "LIMITED"].includes(domain.state)) {
    return false;
  }
  return true;
}
