/**
 * Product P2 — Organization workspace readiness
 */

import { PRODUCT_P1_CUSTOMER_ONBOARDING_ID } from "../../p1/onboarding/onboarding.constants";
import { listDepartments } from "../department/department.registry";
import { listDirectoryIndexes } from "../directory/directory.index";
import { listInvitations } from "../invitation/invitation.registry";
import { listMembers } from "../member/member.registry";
import { PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE } from "../organization/organization.constants";
import { listOrganizations } from "../organization/organization.registry";
import type {
  P2ReadinessCheck,
  P2ReadinessResult,
} from "../organization/organization.types";
import { listPermissionGrants, listPermissions } from "../permission/permission.registry";
import { listRoleAssignments, listRoles } from "../role/role.registry";
import { listWorkspaces } from "../workspace/workspace.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): P2ReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateP2OrganizationWorkspaceReadiness(): P2ReadinessResult {
  const checks: P2ReadinessCheck[] = [];

  checks.push(
    check(
      "P2-BASE",
      "foundation",
      "P1 customer onboarding baseline aligned",
      PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE ===
        PRODUCT_P1_CUSTOMER_ONBOARDING_ID,
      `base=${PRODUCT_P2_ORGANIZATION_WORKSPACE_BASE}`,
    ),
  );

  const orgs = listOrganizations();
  checks.push(
    check(
      "P2-ORG",
      "organization",
      "Organizations present",
      orgs.length >= 1,
      `organizations=${orgs.length}`,
    ),
  );

  const departments = listDepartments();
  checks.push(
    check(
      "P2-DEPT",
      "department",
      "Departments present",
      departments.length >= 1,
      `departments=${departments.length}`,
    ),
  );

  const members = listMembers();
  checks.push(
    check(
      "P2-MEM",
      "member",
      "Members present",
      members.length >= 1,
      `members=${members.length}`,
    ),
  );

  const roles = listRoles();
  const assignments = listRoleAssignments();
  checks.push(
    check(
      "P2-ROLE",
      "role",
      "Roles and assignments present",
      roles.length >= 1 && assignments.length >= 1,
      `roles=${roles.length} assignments=${assignments.length}`,
    ),
  );

  const permissions = listPermissions();
  const grants = listPermissionGrants();
  checks.push(
    check(
      "P2-PERM",
      "permission",
      "Permissions and grants present",
      permissions.length >= 1 && grants.length >= 1,
      `permissions=${permissions.length} grants=${grants.length}`,
    ),
  );

  const workspaces = listWorkspaces();
  checks.push(
    check(
      "P2-WS",
      "workspace",
      "Workspaces present",
      workspaces.length >= 1,
      `workspaces=${workspaces.length}`,
    ),
  );

  const invitations = listInvitations();
  checks.push(
    check(
      "P2-INV",
      "invitation",
      "Invitations present",
      invitations.length >= 1,
      `invitations=${invitations.length}`,
    ),
  );

  const directories = listDirectoryIndexes();
  checks.push(
    check(
      "P2-DIR",
      "directory",
      "Directory indexes present",
      directories.length >= 1,
      `directories=${directories.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `p2-organization-workspace readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertP2OrganizationWorkspaceReadinessReady(
  result: P2ReadinessResult,
): asserts result is P2ReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `p2 organization workspace not ready: ${result.summary}`,
    );
  }
}
