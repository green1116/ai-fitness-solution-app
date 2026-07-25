/**
 * Product Relationship — Relationship Management Release Gate
 * MODULE: Relationship
 * BASE: enterprise-product-customer-profile-v1
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
import { PRODUCT_CUSTOMER_PROFILE_ID } from "../../customer-profile/profile/profile.constants";
import { PRODUCT_ORGANIZATION_MANAGEMENT_ID } from "../../organization/management/management.constants";
import {
  assertRelationshipManagementReadinessReady,
  clearRelationshipManagementLayer,
  createRelationshipManager,
  getRelationshipRegistryManifest,
} from "../relationship.manager";
import {
  CLASSIFICATION_TIERS,
  PARTY_ROLES,
  PRODUCT_RELATIONSHIP_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
  RELATIONSHIP_KINDS,
  RELATIONSHIP_MANAGER_STATUSES,
  RELATIONSHIP_READINESS_VERDICTS,
  RELATIONSHIP_STATUSES,
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

export const PRODUCT_RELATIONSHIP_SIGNOFF_VERSION =
  "product-relationship-signoff-1" as const;

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
  clearRelationshipManagementLayer();
}

export function checkProductRelationshipReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "REL-CONSTANTS",
      "management",
      "Product relationship management version constants",
      PRODUCT_RELATIONSHIP_MANAGEMENT_ID ===
        "enterprise-product-relationship-management-v1" &&
        PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION ===
          "product-relationship-1" &&
        PRODUCT_RELATIONSHIP_MANAGEMENT_BASE ===
          PRODUCT_CUSTOMER_PROFILE_ID &&
        PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION ===
          "product-relationship-management-freeze-1" &&
        PRODUCT_RELATIONSHIP_FREEZE_VERSION ===
          "product-relationship-management-freeze-1" &&
        RELATIONSHIP_KINDS.length === 3 &&
        RELATIONSHIP_STATUSES.length === 4 &&
        PARTY_ROLES.length === 3 &&
        CLASSIFICATION_TIERS.length === 3 &&
        RELATIONSHIP_READINESS_VERDICTS.length === 3 &&
        RELATIONSHIP_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_RELATIONSHIP_MANAGEMENT_ID} base=${PRODUCT_RELATIONSHIP_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "REL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "REL-CPRF-BASE",
      "product-customer-profile",
      "Customer profile BASE preserved",
      PRODUCT_RELATIONSHIP_MANAGEMENT_BASE ===
        "enterprise-product-customer-profile-v1" &&
        PRODUCT_CUSTOMER_PROFILE_ID ===
          "enterprise-product-customer-profile-v1" &&
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
      `base=${PRODUCT_RELATIONSHIP_MANAGEMENT_BASE}`,
    ),
  );

  checks.push(
    check(
      "REL-UPSTREAM",
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
    const mgr = createRelationshipManager({ managerId: "prod-rel-gate" });
    mgr.initialize();
    mgr.start();

    const bond = mgr.createBond({
      id: "rel.gate.bond",
      customerId: "cus.gate.a",
      relatedCustomerId: "cus.gate.b",
      kind: "PARTNER",
    });
    mgr.attachParty({
      id: "rel.gate.pty",
      bondId: bond.id,
      subjectId: "sub.gate.primary",
      role: "PRIMARY",
    });
    mgr.classifyBond({
      id: "rel.gate.cls",
      bondId: bond.id,
      tier: "STRATEGIC",
    });
    const lifecycle = mgr.transitionBondLifecycle({
      id: "rel.gate.lfc",
      bondId: bond.id,
      toStatus: "ACTIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getRelationshipRegistryManifest();

    const ok =
      lifecycle.toStatus === "ACTIVE" &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_RELATIONSHIP_MANAGEMENT_ID &&
      registry.base === PRODUCT_RELATIONSHIP_MANAGEMENT_BASE &&
      registry.bondCount >= 1 &&
      registry.partyCount >= 1 &&
      registry.classificationCount >= 1 &&
      registry.lifecycleCount >= 1;

    try {
      assertRelationshipManagementReadinessReady(readiness);
      checks.push(
        check(
          "REL-STACK",
          "management",
          "Bond / party / classification / lifecycle",
          ok,
          `readiness=${readiness.verdict} status=${lifecycle.toStatus}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "REL-STACK",
          "management",
          "Bond / party / classification / lifecycle",
          false,
          error instanceof Error
            ? error.message
            : "product relationship not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "REL-STACK",
        "management",
        "Bond / party / classification / lifecycle",
        false,
        error instanceof Error
          ? error.message
          : "product relationship probe failed",
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
      `product-relationship-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductRelationshipReleaseGatePass(
  gate: ReleaseGateResult = checkProductRelationshipReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product relationship release gate failed: ${gate.summary}`,
    );
  }
}
