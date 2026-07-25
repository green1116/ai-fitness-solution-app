/**
 * Product Authorization — Decision registry (RBAC evaluate)
 */

import { listAssignments } from "../assignment/assignment.registry";
import { listGrants } from "../grant/grant.registry";
import { getPermission } from "../permission/permission.registry";
import type {
  AuthorizationDecision,
  AuthorizeInput,
  DecisionResult,
} from "./decision.types";

const decisions = new Map<string, AuthorizationDecision>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDecision(
  decision: AuthorizationDecision,
): AuthorizationDecision {
  return { ...decision, metadata: { ...decision.metadata } };
}

export function authorize(input: AuthorizeInput): AuthorizationDecision {
  const principalId = input.principalId.trim();
  const resource = input.resource.trim();
  const action = input.action.trim();
  if (!principalId) throw new Error("decision.principalId is required");
  if (!resource) throw new Error("decision.resource is required");
  if (!action) throw new Error("decision.action is required");

  const id = input.id?.trim() || createId("azdec");
  if (decisions.has(id)) {
    throw new Error(`decision already exists: ${id}`);
  }

  const activeRoles = listAssignments({
    principalId,
    status: "ACTIVE",
  }).map((a) => a.roleId);

  let result: DecisionResult = "DENY";
  let matchedPermissionId: string | undefined;
  let matchedRoleId: string | undefined;
  let deniedByPermission = false;

  for (const roleId of activeRoles) {
    const grants = listGrants({ roleId });
    for (const grant of grants) {
      const permission = getPermission(grant.permissionId);
      if (!permission) continue;
      if (permission.resource !== resource || permission.action !== action) {
        continue;
      }
      if (permission.effect === "DENY") {
        deniedByPermission = true;
        matchedPermissionId = permission.id;
        matchedRoleId = roleId;
        break;
      }
      if (permission.effect === "ALLOW") {
        result = "ALLOW";
        matchedPermissionId = permission.id;
        matchedRoleId = roleId;
      }
    }
    if (deniedByPermission) break;
  }

  if (deniedByPermission) result = "DENY";

  const decision: AuthorizationDecision = {
    id,
    principalId,
    resource,
    action,
    result,
    matchedPermissionId,
    matchedRoleId,
    detail: `result=${result} resource=${resource} action=${action}`,
    metadata: { ...(input.metadata ?? {}) },
    decidedAt: nowIso(),
  };
  decisions.set(id, decision);
  return cloneDecision(decision);
}

export function getDecision(id: string): AuthorizationDecision | undefined {
  const decision = decisions.get(id.trim());
  return decision ? cloneDecision(decision) : undefined;
}

export function listDecisions(filter?: {
  principalId?: string;
  result?: DecisionResult;
}): AuthorizationDecision[] {
  let result = [...decisions.values()];
  if (filter?.principalId) {
    const principalId = filter.principalId.trim();
    result = result.filter((d) => d.principalId === principalId);
  }
  if (filter?.result) {
    result = result.filter((d) => d.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDecision);
}

export function clearDecisions(): void {
  decisions.clear();
}
