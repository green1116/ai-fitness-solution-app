/**
 * Product Organization — readiness
 */

import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import { listHierarchies } from "../hierarchy/hierarchy.registry";
import { listMemberships } from "../membership/membership.registry";
import { listOrgRoles } from "../role/role.registry";
import { listOrganizations } from "../unit/unit.registry";
import { PRODUCT_ORGANIZATION_MANAGEMENT_BASE } from "./management.constants";
import type {
  OrganizationReadinessCheck,
  OrganizationReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OrganizationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateOrganizationManagementReadiness(): OrganizationReadinessResult {
  const checks: OrganizationReadinessCheck[] = [];

  checks.push(
    check(
      "ORG-BASE",
      "management",
      "Customer foundation aligned",
      PRODUCT_ORGANIZATION_MANAGEMENT_BASE === PRODUCT_CUSTOMER_FOUNDATION_ID,
      `base=${PRODUCT_ORGANIZATION_MANAGEMENT_BASE}`,
    ),
  );

  const orgs = listOrganizations();
  checks.push(
    check(
      "ORG-UNIT",
      "unit",
      "Active organizations present",
      orgs.some((o) => o.status === "ACTIVE"),
      `organizations=${orgs.length}`,
    ),
  );

  const memberships = listMemberships();
  checks.push(
    check(
      "ORG-MEM",
      "membership",
      "Active memberships present",
      memberships.some((m) => m.status === "ACTIVE"),
      `memberships=${memberships.length}`,
    ),
  );

  const hierarchies = listHierarchies();
  checks.push(
    check(
      "ORG-HIER",
      "hierarchy",
      "Hierarchy links present",
      hierarchies.length >= 1,
      `hierarchies=${hierarchies.length}`,
    ),
  );

  const roles = listOrgRoles();
  checks.push(
    check(
      "ORG-ROLE",
      "role",
      "Owner role assignments present",
      roles.some((r) => r.role === "OWNER"),
      `roles=${roles.length}`,
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
    summary: `product-organization readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOrganizationManagementReadinessReady(
  result: OrganizationReadinessResult,
): asserts result is OrganizationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product organization management not ready: ${result.summary}`,
    );
  }
}
