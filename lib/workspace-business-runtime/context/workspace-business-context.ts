import { BUSINESS_SURFACE_KEYS } from "../shared/business-constants";
import type { BusinessStatus, BusinessScope, WorkspaceBusinessContext } from "./workspace-business-context-types";

export function resolveBusinessStatus(context: WorkspaceBusinessContext): BusinessStatus {
  return context.readiness.readiness;
}

export function describeWorkspaceBusinessContext(context: WorkspaceBusinessContext): string {
  return [
    `workspaceId=${context.scope.workspaceId}`,
    `version=${context.scope.version}`,
    `status=${resolveBusinessStatus(context)}`,
    `surfaces=${context.surfaces.length}`,
    `entries=${context.entries.length}`,
  ].join(" ");
}

export function assertBusinessScope(scope: BusinessScope): boolean {
  return scope.workspaceId.trim().length > 0 && scope.version.trim().length > 0;
}

export function assertWorkspaceBusinessContextShape(context: WorkspaceBusinessContext): boolean {
  if (!assertBusinessScope(context.scope)) {
    return false;
  }
  if (context.scope.workspaceId !== context.readiness.workspaceId) {
    return false;
  }
  if (context.surfaces.length !== BUSINESS_SURFACE_KEYS.length) {
    return false;
  }
  if (context.entries.length !== BUSINESS_SURFACE_KEYS.length) {
    return false;
  }
  return true;
}
