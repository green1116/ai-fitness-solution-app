/**
 * Product Configuration — System Configuration Release Gate
 * MODULE: System Configuration
 * BASE: enterprise-product-user-administration-v1
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
import { PRODUCT_USER_ADMINISTRATION_ID } from "../../user/administration/administration.constants";
import {
  assertSystemConfigurationReadinessReady,
  clearSystemConfigurationLayer,
  createConfigurationManager,
  getConfigurationRegistryManifest,
} from "../configuration.manager";
import {
  CONFIG_NAMESPACE_SCOPES,
  CONFIG_NAMESPACE_STATUSES,
  CONFIG_OVERRIDE_TARGETS,
  CONFIG_PARAMETER_TYPES,
  CONFIG_RELEASE_STATUSES,
  CONFIGURATION_MANAGER_STATUSES,
  CONFIGURATION_READINESS_VERDICTS,
  PRODUCT_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_BASE,
  PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION,
  PRODUCT_SYSTEM_CONFIGURATION_ID,
  PRODUCT_SYSTEM_CONFIGURATION_VERSION,
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

export const PRODUCT_CONFIGURATION_SIGNOFF_VERSION =
  "product-configuration-signoff-1" as const;

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
  clearSystemConfigurationLayer();
}

export function checkProductConfigurationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CFG-CONSTANTS",
      "management",
      "Product system configuration version constants",
      PRODUCT_SYSTEM_CONFIGURATION_ID ===
        "enterprise-product-system-configuration-v1" &&
        PRODUCT_SYSTEM_CONFIGURATION_VERSION === "product-configuration-1" &&
        PRODUCT_SYSTEM_CONFIGURATION_BASE ===
          PRODUCT_USER_ADMINISTRATION_ID &&
        PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION ===
          "product-system-configuration-freeze-1" &&
        PRODUCT_CONFIGURATION_FREEZE_VERSION ===
          "product-system-configuration-freeze-1" &&
        CONFIG_NAMESPACE_SCOPES.length === 3 &&
        CONFIG_NAMESPACE_STATUSES.length === 3 &&
        CONFIG_PARAMETER_TYPES.length === 4 &&
        CONFIG_OVERRIDE_TARGETS.length === 3 &&
        CONFIG_RELEASE_STATUSES.length === 4 &&
        CONFIGURATION_READINESS_VERDICTS.length === 3 &&
        CONFIGURATION_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_SYSTEM_CONFIGURATION_ID} base=${PRODUCT_SYSTEM_CONFIGURATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CFG-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CFG-USR-BASE",
      "product-user-administration",
      "User administration BASE preserved",
      PRODUCT_SYSTEM_CONFIGURATION_BASE ===
        "enterprise-product-user-administration-v1" &&
        PRODUCT_USER_ADMINISTRATION_ID ===
          "enterprise-product-user-administration-v1" &&
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
      `base=${PRODUCT_SYSTEM_CONFIGURATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "CFG-UPSTREAM",
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
    const mgr = createConfigurationManager({ managerId: "prod-cfg-gate" });
    mgr.initialize();
    mgr.start();

    const namespace = mgr.registerNamespace({
      id: "cfg.gate.ns",
      code: "PLATFORM_CORE",
      name: "Platform Core",
      scope: "GLOBAL",
    });
    mgr.updateNamespaceStatus({
      namespaceId: namespace.id,
      status: "ACTIVE",
    });
    const parameter = mgr.setParameter({
      id: "cfg.gate.prm",
      namespaceId: namespace.id,
      key: "SESSION_TTL_MINUTES",
      type: "NUMBER",
      value: "60",
    });
    mgr.applyOverride({
      id: "cfg.gate.ovr",
      parameterId: parameter.id,
      target: "TENANT",
      targetRef: "tnt.gate.rcd",
      value: "120",
      userAccountId: "usr.gate.acc",
    });
    const release = mgr.createRelease({
      id: "cfg.gate.rls",
      namespaceId: namespace.id,
      versionTag: "v1.0.0",
      parameterIds: [parameter.id],
    });
    mgr.updateReleaseStatus({
      releaseId: release.id,
      status: "PUBLISHED",
    });
    mgr.updateReleaseStatus({
      releaseId: release.id,
      status: "ACTIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getConfigurationRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.configurationId === PRODUCT_SYSTEM_CONFIGURATION_ID &&
      registry.base === PRODUCT_SYSTEM_CONFIGURATION_BASE &&
      registry.namespaceCount >= 1 &&
      registry.parameterCount >= 1 &&
      registry.overrideCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertSystemConfigurationReadinessReady(readiness);
      checks.push(
        check(
          "CFG-STACK",
          "management",
          "Namespace / parameter / override / release",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CFG-STACK",
          "management",
          "Namespace / parameter / override / release",
          false,
          error instanceof Error
            ? error.message
            : "product configuration not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "CFG-STACK",
        "management",
        "Namespace / parameter / override / release",
        false,
        error instanceof Error
          ? error.message
          : "product configuration probe failed",
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
      `product-configuration-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductConfigurationReleaseGatePass(
  gate: ReleaseGateResult = checkProductConfigurationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product configuration release gate failed: ${gate.summary}`,
    );
  }
}
