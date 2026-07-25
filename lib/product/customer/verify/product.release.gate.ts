/**
 * Product Customer — Customer Foundation Release Gate
 * MODULE: Customer
 * BASE: enterprise-product-billing-baseline-v1
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
import { PRODUCT_BILLING_AUDIT_ID } from "../../billing-audit/traceability/traceability.constants";
import { PRODUCT_BILLING_FOUNDATION_ID } from "../../billing/foundation/foundation.constants";
import {
  assertCustomerFoundationReadinessReady,
  clearCustomerFoundationLayer,
  createCustomerManager,
  getCustomerRegistryManifest,
} from "../customer.manager";
import {
  CUSTOMER_KINDS,
  CUSTOMER_MANAGER_STATUSES,
  CUSTOMER_READINESS_VERDICTS,
  CUSTOMER_SEGMENTS,
  CUSTOMER_STATUSES,
  PRODUCT_CUSTOMER_FOUNDATION_BASE,
  PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION,
  PRODUCT_CUSTOMER_FOUNDATION_ID,
  PRODUCT_CUSTOMER_FOUNDATION_VERSION,
  PRODUCT_CUSTOMER_FREEZE_VERSION,
  RELATIONSHIP_KINDS,
} from "../foundation/foundation.constants";

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

export const PRODUCT_CUSTOMER_SIGNOFF_VERSION =
  "product-customer-signoff-1" as const;

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
  clearCustomerFoundationLayer();
}

export function checkProductCustomerReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CUS-CONSTANTS",
      "foundation",
      "Product customer foundation version constants",
      PRODUCT_CUSTOMER_FOUNDATION_ID ===
        "enterprise-product-customer-foundation-v1" &&
        PRODUCT_CUSTOMER_FOUNDATION_VERSION === "product-customer-1" &&
        PRODUCT_CUSTOMER_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_BILLING_BASELINE_ID &&
        PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION ===
          "product-customer-foundation-freeze-1" &&
        PRODUCT_CUSTOMER_FREEZE_VERSION ===
          "product-customer-foundation-freeze-1" &&
        CUSTOMER_KINDS.length === 3 &&
        CUSTOMER_STATUSES.length === 4 &&
        CUSTOMER_SEGMENTS.length === 3 &&
        RELATIONSHIP_KINDS.length === 3 &&
        CUSTOMER_READINESS_VERDICTS.length === 3 &&
        CUSTOMER_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CUSTOMER_FOUNDATION_ID} base=${PRODUCT_CUSTOMER_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CUS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CUS-BIL-BASE",
      "product-billing-baseline",
      "Billing baseline BASE preserved",
      PRODUCT_CUSTOMER_FOUNDATION_BASE ===
        "enterprise-product-billing-baseline-v1" &&
        ENTERPRISE_PRODUCT_BILLING_BASELINE_ID ===
          "enterprise-product-billing-baseline-v1" &&
        PRODUCT_BILLING_AUDIT_ID === "enterprise-product-billing-audit-v1" &&
        PRODUCT_BILLING_FOUNDATION_ID ===
          "enterprise-product-billing-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1" &&
        ENTERPRISE_PRODUCT_COMPLETE_ID === "enterprise-product-complete-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_CUSTOMER_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "CUS-UPSTREAM",
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
    const mgr = createCustomerManager({ managerId: "prod-cus-gate" });
    mgr.initialize();
    mgr.start();

    const customer = mgr.registerCustomer({
      id: "cus.gate.prf",
      kind: "ORGANIZATION",
      name: "Acme Corp",
      email: "billing@acme.example",
    });
    mgr.linkRelationship({
      id: "cus.gate.rel",
      customerId: customer.id,
      accountId: "bil.gate.acc",
      kind: "BILLING",
    });
    mgr.assignSegment({
      id: "cus.gate.seg",
      customerId: customer.id,
      segment: "ENTERPRISE",
    });
    const lifecycle = mgr.transitionLifecycle({
      id: "cus.gate.lfc",
      customerId: customer.id,
      toStatus: "ACTIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getCustomerRegistryManifest();

    const ok =
      lifecycle.toStatus === "ACTIVE" &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_CUSTOMER_FOUNDATION_ID &&
      registry.base === PRODUCT_CUSTOMER_FOUNDATION_BASE &&
      registry.profileCount >= 1 &&
      registry.relationshipCount >= 1 &&
      registry.segmentCount >= 1 &&
      registry.lifecycleCount >= 1;

    try {
      assertCustomerFoundationReadinessReady(readiness);
      checks.push(
        check(
          "CUS-STACK",
          "foundation",
          "Profile / relationship / segment / lifecycle",
          ok,
          `readiness=${readiness.verdict} status=${lifecycle.toStatus}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CUS-STACK",
          "foundation",
          "Profile / relationship / segment / lifecycle",
          false,
          error instanceof Error
            ? error.message
            : "product customer not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CUS-STACK",
        "foundation",
        "Profile / relationship / segment / lifecycle",
        false,
        error instanceof Error
          ? error.message
          : "product customer probe failed",
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
      `product-customer-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductCustomerReleaseGatePass(
  gate: ReleaseGateResult = checkProductCustomerReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product customer release gate failed: ${gate.summary}`,
    );
  }
}
