/**
 * Product Customer Profile — Customer Profile Release Gate
 * MODULE: Customer Profile
 * BASE: enterprise-product-organization-management-v1
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
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import {
  assertCustomerProfileReadinessReady,
  clearCustomerProfileLayer,
  createCustomerProfileManager,
  getCustomerProfileRegistryManifest,
} from "../customer-profile.manager";
import {
  ATTRIBUTE_KINDS,
  CONTACT_KINDS,
  CUSTOMER_PROFILE_MANAGER_STATUSES,
  CUSTOMER_PROFILE_READINESS_VERDICTS,
  PREFERENCE_KINDS,
  PRODUCT_CUSTOMER_PROFILE_BASE,
  PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_ID,
  PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION,
  PRODUCT_CUSTOMER_PROFILE_VERSION,
  PROFILE_STATUSES,
} from "../profile/profile.constants";

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

export const PRODUCT_CUSTOMER_PROFILE_SIGNOFF_VERSION =
  "product-customer-profile-signoff-1" as const;

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
  clearCustomerProfileLayer();
}

export function checkProductCustomerProfileReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CPRF-CONSTANTS",
      "profile",
      "Product customer profile version constants",
      PRODUCT_CUSTOMER_PROFILE_ID ===
        "enterprise-product-customer-profile-v1" &&
        PRODUCT_CUSTOMER_PROFILE_VERSION === "product-customer-profile-1" &&
        PRODUCT_CUSTOMER_PROFILE_BASE ===
          PRODUCT_ORGANIZATION_MANAGEMENT_ID &&
        PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION ===
          "product-customer-profile-freeze-1" &&
        PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION ===
          "product-customer-profile-freeze-1" &&
        PROFILE_STATUSES.length === 3 &&
        CONTACT_KINDS.length === 3 &&
        PREFERENCE_KINDS.length === 3 &&
        ATTRIBUTE_KINDS.length === 3 &&
        CUSTOMER_PROFILE_READINESS_VERDICTS.length === 3 &&
        CUSTOMER_PROFILE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CUSTOMER_PROFILE_ID} base=${PRODUCT_CUSTOMER_PROFILE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CPRF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CPRF-ORG-BASE",
      "product-organization-management",
      "Organization management BASE preserved",
      PRODUCT_CUSTOMER_PROFILE_BASE ===
        "enterprise-product-organization-management-v1" &&
        PRODUCT_ORGANIZATION_MANAGEMENT_ID ===
          "enterprise-product-organization-management-v1" &&
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
      `base=${PRODUCT_CUSTOMER_PROFILE_BASE}`,
    ),
  );

  checks.push(
    check(
      "CPRF-UPSTREAM",
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
    const mgr = createCustomerProfileManager({
      managerId: "prod-cprf-gate",
    });
    mgr.initialize();
    mgr.start();

    const identity = mgr.upsertIdentity({
      id: "cprf.gate.id",
      customerId: "cus.gate.prf",
      displayName: "Acme",
      legalName: "Acme Corporation",
    });
    mgr.updateIdentityStatus({
      identityId: identity.id,
      status: "ACTIVE",
    });
    mgr.addContact({
      id: "cprf.gate.ct",
      identityId: identity.id,
      kind: "EMAIL",
      value: "billing@acme.example",
      primary: true,
    });
    mgr.setPreference({
      id: "cprf.gate.pf",
      identityId: identity.id,
      kind: "BILLING",
      value: "NET30",
    });
    mgr.assignAttribute({
      id: "cprf.gate.at",
      identityId: identity.id,
      kind: "TAG",
      key: "tier",
      value: "enterprise",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getCustomerProfileRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.profileId === PRODUCT_CUSTOMER_PROFILE_ID &&
      registry.base === PRODUCT_CUSTOMER_PROFILE_BASE &&
      registry.identityCount >= 1 &&
      registry.contactCount >= 1 &&
      registry.preferenceCount >= 1 &&
      registry.attributeCount >= 1;

    try {
      assertCustomerProfileReadinessReady(readiness);
      checks.push(
        check(
          "CPRF-STACK",
          "profile",
          "Identity / contact / preference / attribute",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CPRF-STACK",
          "profile",
          "Identity / contact / preference / attribute",
          false,
          error instanceof Error
            ? error.message
            : "product customer profile not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CPRF-STACK",
        "profile",
        "Identity / contact / preference / attribute",
        false,
        error instanceof Error
          ? error.message
          : "product customer profile probe failed",
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
      `product-customer-profile-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCustomerProfileReleaseGatePass(
  gate: ReleaseGateResult = checkProductCustomerProfileReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product customer profile release gate failed: ${gate.summary}`,
    );
  }
}
