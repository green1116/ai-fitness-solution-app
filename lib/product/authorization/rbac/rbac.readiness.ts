/**
 * Product Authorization — RBAC readiness
 */

import { PRODUCT_IDENTITY_FOUNDATION_ID } from "../../identity/authentication/authentication.constants";
import { listAssignments } from "../assignment/assignment.registry";
import { listDecisions } from "../decision/decision.registry";
import { listGrants } from "../grant/grant.registry";
import { listPermissions } from "../permission/permission.registry";
import { listRoles } from "../role/role.registry";
import { PRODUCT_AUTHORIZATION_RBAC_BASE } from "./rbac.constants";
import type {
  AuthorizationReadinessCheck,
  AuthorizationReadinessResult,
} from "./rbac.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AuthorizationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateAuthorizationRbacReadiness(): AuthorizationReadinessResult {
  const checks: AuthorizationReadinessCheck[] = [];

  checks.push(
    check(
      "AZ-BASE",
      "foundation",
      "Identity foundation baseline aligned",
      PRODUCT_AUTHORIZATION_RBAC_BASE === PRODUCT_IDENTITY_FOUNDATION_ID,
      `base=${PRODUCT_AUTHORIZATION_RBAC_BASE}`,
    ),
  );

  const roles = listRoles();
  checks.push(
    check(
      "AZ-ROLE",
      "role",
      "Roles present",
      roles.length >= 1,
      `roles=${roles.length}`,
    ),
  );

  const permissions = listPermissions();
  checks.push(
    check(
      "AZ-PERM",
      "permission",
      "Permissions present",
      permissions.some((p) => p.effect === "ALLOW"),
      `permissions=${permissions.length}`,
    ),
  );

  const grants = listGrants();
  checks.push(
    check(
      "AZ-GRANT",
      "grant",
      "Role permission grants present",
      grants.length >= 1,
      `grants=${grants.length}`,
    ),
  );

  const assignments = listAssignments();
  checks.push(
    check(
      "AZ-ASN",
      "assignment",
      "Active role assignments present",
      assignments.some((a) => a.status === "ACTIVE"),
      `assignments=${assignments.length}`,
    ),
  );

  const decisions = listDecisions();
  checks.push(
    check(
      "AZ-DEC",
      "decision",
      "Allow decisions present",
      decisions.some((d) => d.result === "ALLOW"),
      `decisions=${decisions.length}`,
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
    summary: `product-authorization readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAuthorizationRbacReadinessReady(
  result: AuthorizationReadinessResult,
): asserts result is AuthorizationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product authorization rbac not ready: ${result.summary}`,
    );
  }
}
