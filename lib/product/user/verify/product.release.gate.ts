/**
 * Product User — User Administration Release Gate
 * MODULE: User Administration
 * BASE: enterprise-product-tenant-administration-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID } from "../../analytics-baseline/freeze/freeze.lock";
import { PRODUCT_ADMIN_FOUNDATION_ID } from "../../admin/foundation/foundation.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../../tenant/administration/administration.constants";
import {
  assertUserAdministrationReadinessReady,
  clearUserAdministrationLayer,
  createUserManager,
  getUserRegistryManifest,
} from "../user.manager";
import {
  PRODUCT_USER_ADMINISTRATION_BASE,
  PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION,
  PRODUCT_USER_ADMINISTRATION_ID,
  PRODUCT_USER_ADMINISTRATION_VERSION,
  PRODUCT_USER_FREEZE_VERSION,
  USER_ACCOUNT_KINDS,
  USER_ACCOUNT_STATUSES,
  USER_LIFECYCLE_STATES,
  USER_MANAGER_STATUSES,
  USER_MEMBERSHIP_ROLES,
  USER_MEMBERSHIP_STATUSES,
  USER_PRIVILEGE_SCOPES,
  USER_READINESS_VERDICTS,
} from "../administration/administration.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_USER_SIGNOFF_VERSION =
  "product-user-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearUserAdministrationLayer();
}

export function checkProductUserReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "USR-CONSTANTS",
      "administration",
      "Product user administration version constants",
      PRODUCT_USER_ADMINISTRATION_ID ===
        "enterprise-product-user-administration-v1" &&
        PRODUCT_USER_ADMINISTRATION_VERSION === "product-user-1" &&
        PRODUCT_USER_ADMINISTRATION_BASE ===
          PRODUCT_TENANT_ADMINISTRATION_ID &&
        PRODUCT_USER_ADMINISTRATION_FREEZE_VERSION ===
          "product-user-administration-freeze-1" &&
        PRODUCT_USER_FREEZE_VERSION ===
          "product-user-administration-freeze-1" &&
        USER_ACCOUNT_KINDS.length === 3 &&
        USER_ACCOUNT_STATUSES.length === 3 &&
        USER_MEMBERSHIP_ROLES.length === 3 &&
        USER_MEMBERSHIP_STATUSES.length === 3 &&
        USER_PRIVILEGE_SCOPES.length === 3 &&
        USER_LIFECYCLE_STATES.length === 4 &&
        USER_READINESS_VERDICTS.length === 3 &&
        USER_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_USER_ADMINISTRATION_ID} base=${PRODUCT_USER_ADMINISTRATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "USR-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "USR-TNT-BASE",
      "product-tenant-administration",
      "Tenant administration BASE preserved",
      PRODUCT_USER_ADMINISTRATION_BASE ===
        "enterprise-product-tenant-administration-v1" &&
        PRODUCT_TENANT_ADMINISTRATION_ID ===
          "enterprise-product-tenant-administration-v1" &&
        PRODUCT_ADMIN_FOUNDATION_ID ===
          "enterprise-product-admin-foundation-v1" &&
        ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID ===
          "enterprise-product-analytics-baseline-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_USER_ADMINISTRATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "USR-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createUserManager({ managerId: "prod-usr-gate" });
    mgr.initialize();
    mgr.start();

    const account = mgr.registerAccount({
      id: "usr.gate.acc",
      email: "owner@acme.example",
      displayName: "Acme Owner",
      kind: "HUMAN",
      tenantRecordId: "tnt.gate.rcd",
    });
    mgr.updateAccountStatus({ accountId: account.id, status: "ACTIVE" });
    const membership = mgr.bindMembership({
      id: "usr.gate.mem",
      accountId: account.id,
      tenantRecordId: account.tenantRecordId,
      role: "OWNER",
    });
    mgr.updateMembershipStatus({
      membershipId: membership.id,
      status: "ACTIVE",
    });
    mgr.grantPrivilege({
      id: "usr.gate.prv",
      accountId: account.id,
      code: "TENANT_ADMIN",
      scope: "TENANT",
    });
    const lifecycle = mgr.createLifecycle({
      id: "usr.gate.lc",
      accountId: account.id,
    });
    mgr.transitionLifecycle({
      lifecycleId: lifecycle.id,
      state: "ACTIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getUserRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.administrationId === PRODUCT_USER_ADMINISTRATION_ID &&
      registry.base === PRODUCT_USER_ADMINISTRATION_BASE &&
      registry.accountCount >= 1 &&
      registry.membershipCount >= 1 &&
      registry.privilegeCount >= 1 &&
      registry.lifecycleCount >= 1;

    try {
      assertUserAdministrationReadinessReady(readiness);
      checks.push(
        check(
          "USR-STACK",
          "administration",
          "Account / membership / privilege / lifecycle",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "USR-STACK",
          "administration",
          "Account / membership / privilege / lifecycle",
          false,
          error instanceof Error
            ? error.message
            : "product user not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "USR-STACK",
        "administration",
        "Account / membership / privilege / lifecycle",
        false,
        error instanceof Error
          ? error.message
          : "product user probe failed",
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-user-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductUserReleaseGatePass(
  gate: ReleaseGateResult = checkProductUserReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product user release gate failed: ${gate.summary}`);
  }
}
