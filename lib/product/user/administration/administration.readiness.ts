/**
 * Product User — readiness
 */

import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../../tenant/administration/administration.constants";
import { listUserAccounts } from "../account/account.registry";
import { listUserLifecycles } from "../lifecycle/lifecycle.registry";
import { listUserMemberships } from "../membership/membership.registry";
import { listUserPrivileges } from "../privilege/privilege.registry";
import { PRODUCT_USER_ADMINISTRATION_BASE } from "./administration.constants";
import type {
  UserReadinessCheck,
  UserReadinessResult,
} from "./administration.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): UserReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateUserAdministrationReadiness(): UserReadinessResult {
  const checks: UserReadinessCheck[] = [];

  checks.push(
    check(
      "USR-BASE",
      "administration",
      "Tenant administration aligned",
      PRODUCT_USER_ADMINISTRATION_BASE === PRODUCT_TENANT_ADMINISTRATION_ID,
      `base=${PRODUCT_USER_ADMINISTRATION_BASE}`,
    ),
  );

  const accounts = listUserAccounts();
  checks.push(
    check(
      "USR-ACC",
      "account",
      "Active user accounts present",
      accounts.some((a) => a.status === "ACTIVE"),
      `accounts=${accounts.length}`,
    ),
  );

  const memberships = listUserMemberships();
  checks.push(
    check(
      "USR-MEM",
      "membership",
      "Active memberships present",
      memberships.some((m) => m.status === "ACTIVE"),
      `memberships=${memberships.length}`,
    ),
  );

  const privileges = listUserPrivileges();
  checks.push(
    check(
      "USR-PRV",
      "privilege",
      "User privileges present",
      privileges.length >= 1,
      `privileges=${privileges.length}`,
    ),
  );

  const lifecycles = listUserLifecycles();
  checks.push(
    check(
      "USR-LC",
      "lifecycle",
      "Active lifecycles present",
      lifecycles.some((l) => l.state === "ACTIVE"),
      `lifecycles=${lifecycles.length}`,
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
    summary: `product-user readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertUserAdministrationReadinessReady(
  result: UserReadinessResult,
): asserts result is UserReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product user administration not ready: ${result.summary}`,
    );
  }
}
