/**
 * Product Organization — Organization Management Release Gate
 * MODULE: Organization
 * BASE: enterprise-product-customer-foundation-v1
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
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import {
  assertOrganizationManagementReadinessReady,
  clearOrganizationManagementLayer,
  createOrganizationManager,
  getOrganizationRegistryManifest,
} from "../organization.manager";
import {
  HIERARCHY_KINDS,
  MEMBERSHIP_STATUSES,
  ORG_KINDS,
  ORG_ROLES,
  ORG_STATUSES,
  ORGANIZATION_MANAGER_STATUSES,
  ORGANIZATION_READINESS_VERDICTS,
  PRODUCT_ORGANIZATION_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_BASE,
  PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_ORGANIZATION_MANAGEMENT_ID,
  PRODUCT_ORGANIZATION_MANAGEMENT_VERSION,
} from "../management/management.constants";

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

export const PRODUCT_ORGANIZATION_SIGNOFF_VERSION =
  "product-organization-signoff-1" as const;

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
  clearOrganizationManagementLayer();
}

export function checkProductOrganizationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ORG-CONSTANTS",
      "management",
      "Product organization management version constants",
      PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
        "enterprise-product-organization-management-v1" &&
        PRODUCT_ORGANIZATION_MANAGEMENT_VERSION === "product-organization-1" &&
        PRODUCT_ORGANIZATION_MANAGEMENT_BASE ===
          PRODUCT_CUSTOMER_FOUNDATION_ID &&
        PRODUCT_ORGANIZATION_MANAGEMENT_FREEZE_VERSION ===
          "product-organization-management-freeze-1" &&
        PRODUCT_ORGANIZATION_FREEZE_VERSION ===
          "product-organization-management-freeze-1" &&
        ORG_KINDS.length === 3 &&
        ORG_STATUSES.length === 3 &&
        MEMBERSHIP_STATUSES.length === 3 &&
        ORG_ROLES.length === 3 &&
        HIERARCHY_KINDS.length === 2 &&
        ORGANIZATION_READINESS_VERDICTS.length === 3 &&
        ORGANIZATION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ORGANIZATION_MANAGEMENT_ID} base=${PRODUCT_ORGANIZATION_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ORG-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ORG-CUS-BASE",
      "product-customer-foundation",
      "Customer foundation BASE preserved",
      PRODUCT_ORGANIZATION_MANAGEMENT_BASE ===
        "enterprise-product-customer-foundation-v1" &&
        PRODUCT_CUSTOMER_FOUNDATION_ID ===
          "enterprise-product-customer-foundation-v1" &&
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
      `base=${PRODUCT_ORGANIZATION_MANAGEMENT_BASE}`,
    ),
  );

  checks.push(
    check(
      "ORG-UPSTREAM",
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
    const mgr = createOrganizationManager({ managerId: "prod-org-gate" });
    mgr.initialize();
    mgr.start();

    const root = mgr.createOrganization({
      id: "org.gate.root",
      customerId: "cus.gate.prf",
      kind: "ROOT",
      name: "Acme Root",
      slug: "acme-root",
    });
    const division = mgr.createOrganization({
      id: "org.gate.div",
      customerId: "cus.gate.prf",
      kind: "DIVISION",
      name: "Acme West",
      slug: "acme-west",
    });
    const membership = mgr.addMembership({
      id: "org.gate.mem",
      organizationId: root.id,
      subjectId: "sub.gate.owner",
      status: "ACTIVE",
    });
    mgr.linkHierarchy({
      id: "org.gate.hier",
      parentId: root.id,
      childId: division.id,
      kind: "PARENT_CHILD",
    });
    const role = mgr.assignOrgRole({
      id: "org.gate.role",
      organizationId: root.id,
      membershipId: membership.id,
      role: "OWNER",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getOrganizationRegistryManifest();

    const ok =
      role.role === "OWNER" &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_ORGANIZATION_MANAGEMENT_ID &&
      registry.base === PRODUCT_ORGANIZATION_MANAGEMENT_BASE &&
      registry.unitCount >= 2 &&
      registry.membershipCount >= 1 &&
      registry.hierarchyCount >= 1 &&
      registry.roleCount >= 1;

    try {
      assertOrganizationManagementReadinessReady(readiness);
      checks.push(
        check(
          "ORG-STACK",
          "management",
          "Unit / membership / hierarchy / role",
          ok,
          `readiness=${readiness.verdict} role=${role.role}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ORG-STACK",
          "management",
          "Unit / membership / hierarchy / role",
          false,
          error instanceof Error
            ? error.message
            : "product organization not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ORG-STACK",
        "management",
        "Unit / membership / hierarchy / role",
        false,
        error instanceof Error
          ? error.message
          : "product organization probe failed",
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
      `product-organization-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOrganizationReleaseGatePass(
  gate: ReleaseGateResult = checkProductOrganizationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product organization release gate failed: ${gate.summary}`,
    );
  }
}
