/**
 * Product Template — Template Management Release Gate
 * MODULE: Template
 * BASE: enterprise-product-notification-foundation-v1
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
import { ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID } from "../../admin-baseline/freeze/freeze.lock";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import {
  assertTemplateManagementReadinessReady,
  clearTemplateManagementLayer,
  createTemplateManager,
  getTemplateRegistryManifest,
} from "../template.manager";
import {
  PRODUCT_TEMPLATE_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_BASE,
  PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_TEMPLATE_MANAGEMENT_ID,
  PRODUCT_TEMPLATE_MANAGEMENT_VERSION,
  TEMPLATE_DEFINITION_KINDS,
  TEMPLATE_DEFINITION_STATUSES,
  TEMPLATE_MANAGER_STATUSES,
  TEMPLATE_PUBLISH_STATUSES,
  TEMPLATE_READINESS_VERDICTS,
  TEMPLATE_VARIABLE_TYPES,
  TEMPLATE_VARIANT_LOCALES,
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

export const PRODUCT_TEMPLATE_SIGNOFF_VERSION =
  "product-template-signoff-1" as const;

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
  clearTemplateManagementLayer();
}

export function checkProductTemplateReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "TPL-CONSTANTS",
      "management",
      "Product template management version constants",
      PRODUCT_TEMPLATE_MANAGEMENT_ID ===
        "enterprise-product-template-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_VERSION === "product-template-1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_BASE ===
          PRODUCT_NOTIFICATION_FOUNDATION_ID &&
        PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION ===
          "product-template-management-freeze-1" &&
        PRODUCT_TEMPLATE_FREEZE_VERSION ===
          "product-template-management-freeze-1" &&
        TEMPLATE_DEFINITION_KINDS.length === 4 &&
        TEMPLATE_DEFINITION_STATUSES.length === 3 &&
        TEMPLATE_VARIANT_LOCALES.length === 3 &&
        TEMPLATE_VARIABLE_TYPES.length === 4 &&
        TEMPLATE_PUBLISH_STATUSES.length === 4 &&
        TEMPLATE_READINESS_VERDICTS.length === 3 &&
        TEMPLATE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_TEMPLATE_MANAGEMENT_ID} base=${PRODUCT_TEMPLATE_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "TPL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "TPL-NTF-BASE",
      "product-notification-foundation",
      "Notification foundation BASE preserved",
      PRODUCT_TEMPLATE_MANAGEMENT_BASE ===
        "enterprise-product-notification-foundation-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1" &&
        ENTERPRISE_PRODUCT_ADMIN_BASELINE_ID ===
          "enterprise-product-admin-baseline-v1" &&
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
      `base=${PRODUCT_TEMPLATE_MANAGEMENT_BASE}`,
    ),
  );

  checks.push(
    check(
      "TPL-UPSTREAM",
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
    const mgr = createTemplateManager({ managerId: "prod-tpl-gate" });
    mgr.initialize();
    mgr.start();

    const definition = mgr.defineTemplate({
      id: "tpl.gate.def",
      code: "WELCOME_V2",
      name: "Welcome Message",
      kind: "TRANSACTIONAL",
      foundationTemplateId: "ntf.gate.tpl",
    });
    mgr.updateDefinitionStatus({
      definitionId: definition.id,
      status: "ACTIVE",
    });
    const variant = mgr.registerVariant({
      id: "tpl.gate.var",
      definitionId: definition.id,
      locale: "EN",
      subject: "Welcome aboard",
      body: "Hello {{NAME}}",
    });
    mgr.declareVariable({
      id: "tpl.gate.key",
      definitionId: definition.id,
      key: "NAME",
      type: "STRING",
      required: true,
    });
    const publish = mgr.createPublish({
      id: "tpl.gate.pub",
      definitionId: definition.id,
      versionTag: "v1.0.0",
      variantIds: [variant.id],
    });
    mgr.updatePublishStatus({
      publishId: publish.id,
      status: "PUBLISHED",
    });
    mgr.updatePublishStatus({
      publishId: publish.id,
      status: "ACTIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getTemplateRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_TEMPLATE_MANAGEMENT_ID &&
      registry.base === PRODUCT_TEMPLATE_MANAGEMENT_BASE &&
      registry.definitionCount >= 1 &&
      registry.variantCount >= 1 &&
      registry.variableCount >= 1 &&
      registry.publishCount >= 1;

    try {
      assertTemplateManagementReadinessReady(readiness);
      checks.push(
        check(
          "TPL-STACK",
          "management",
          "Definition / variant / variable / publish",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "TPL-STACK",
          "management",
          "Definition / variant / variable / publish",
          false,
          error instanceof Error
            ? error.message
            : "product template not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "TPL-STACK",
        "management",
        "Definition / variant / variable / publish",
        false,
        error instanceof Error
          ? error.message
          : "product template probe failed",
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
      `product-template-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductTemplateReleaseGatePass(
  gate: ReleaseGateResult = checkProductTemplateReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product template release gate failed: ${gate.summary}`);
  }
}
