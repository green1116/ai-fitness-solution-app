/**
 * Product Operations — Operational Console Release Gate
 * MODULE: Operations
 * BASE: enterprise-product-system-configuration-v1
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
import { PRODUCT_SYSTEM_CONFIGURATION_ID } from "../../configuration/management/management.constants";
import { PRODUCT_TENANT_ADMINISTRATION_ID } from "../../tenant/administration/administration.constants";
import { PRODUCT_USER_ADMINISTRATION_ID } from "../../user/administration/administration.constants";
import {
  assertOperationsConsoleReadinessReady,
  clearOperationsConsoleLayer,
  createOperationsManager,
  getOperationsRegistryManifest,
} from "../operations.manager";
import {
  OPERATIONS_MANAGER_STATUSES,
  OPERATIONS_READINESS_VERDICTS,
  OPS_CONSOLE_KINDS,
  OPS_CONSOLE_STATUSES,
  OPS_DISPATCH_STATUSES,
  OPS_INCIDENT_SEVERITIES,
  OPS_INCIDENT_STATUSES,
  OPS_PLAYBOOK_KINDS,
  PRODUCT_OPERATIONS_CONSOLE_BASE,
  PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION,
  PRODUCT_OPERATIONS_CONSOLE_ID,
  PRODUCT_OPERATIONS_CONSOLE_VERSION,
  PRODUCT_OPERATIONS_FREEZE_VERSION,
} from "../console/console.constants";

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

export const PRODUCT_OPERATIONS_SIGNOFF_VERSION =
  "product-operations-signoff-1" as const;

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
  clearOperationsConsoleLayer();
}

export function checkProductOperationsReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "OPS-CONSTANTS",
      "console",
      "Product operations console version constants",
      PRODUCT_OPERATIONS_CONSOLE_ID ===
        "enterprise-product-operations-console-v1" &&
        PRODUCT_OPERATIONS_CONSOLE_VERSION === "product-operations-1" &&
        PRODUCT_OPERATIONS_CONSOLE_BASE ===
          PRODUCT_SYSTEM_CONFIGURATION_ID &&
        PRODUCT_OPERATIONS_CONSOLE_FREEZE_VERSION ===
          "product-operations-console-freeze-1" &&
        PRODUCT_OPERATIONS_FREEZE_VERSION ===
          "product-operations-console-freeze-1" &&
        OPS_CONSOLE_KINDS.length === 3 &&
        OPS_CONSOLE_STATUSES.length === 3 &&
        OPS_INCIDENT_SEVERITIES.length === 4 &&
        OPS_INCIDENT_STATUSES.length === 3 &&
        OPS_PLAYBOOK_KINDS.length === 3 &&
        OPS_DISPATCH_STATUSES.length === 4 &&
        OPERATIONS_READINESS_VERDICTS.length === 3 &&
        OPERATIONS_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_OPERATIONS_CONSOLE_ID} base=${PRODUCT_OPERATIONS_CONSOLE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OPS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OPS-CFG-BASE",
      "product-system-configuration",
      "System configuration BASE preserved",
      PRODUCT_OPERATIONS_CONSOLE_BASE ===
        "enterprise-product-system-configuration-v1" &&
        PRODUCT_SYSTEM_CONFIGURATION_ID ===
          "enterprise-product-system-configuration-v1" &&
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
      `base=${PRODUCT_OPERATIONS_CONSOLE_BASE}`,
    ),
  );

  checks.push(
    check(
      "OPS-UPSTREAM",
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
    const mgr = createOperationsManager({ managerId: "prod-ops-gate" });
    mgr.initialize();
    mgr.start();

    const surface = mgr.registerSurface({
      id: "ops.gate.sfc",
      code: "PLATFORM_OPS",
      name: "Platform Ops Console",
      kind: "PLATFORM",
      configReleaseId: "cfg.gate.rls",
    });
    mgr.updateSurfaceStatus({ surfaceId: surface.id, status: "ACTIVE" });
    const incident = mgr.openIncident({
      id: "ops.gate.inc",
      surfaceId: surface.id,
      title: "Elevated error rate",
      severity: "HIGH",
    });
    const playbook = mgr.registerPlaybook({
      id: "ops.gate.pb",
      surfaceId: surface.id,
      code: "RECOVER_API",
      kind: "RECOVERY",
      steps: 3,
    });
    const dispatch = mgr.queueDispatch({
      id: "ops.gate.dsp",
      incidentId: incident.id,
      playbookId: playbook.id,
    });
    mgr.runDispatch({ dispatchId: dispatch.id });
    mgr.updateIncidentStatus({
      incidentId: incident.id,
      status: "ACKNOWLEDGED",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getOperationsRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.consoleId === PRODUCT_OPERATIONS_CONSOLE_ID &&
      registry.base === PRODUCT_OPERATIONS_CONSOLE_BASE &&
      registry.surfaceCount >= 1 &&
      registry.incidentCount >= 1 &&
      registry.playbookCount >= 1 &&
      registry.dispatchCount >= 1;

    try {
      assertOperationsConsoleReadinessReady(readiness);
      checks.push(
        check(
          "OPS-STACK",
          "console",
          "Surface / incident / playbook / dispatch",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OPS-STACK",
          "console",
          "Surface / incident / playbook / dispatch",
          false,
          error instanceof Error
            ? error.message
            : "product operations not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "OPS-STACK",
        "console",
        "Surface / incident / playbook / dispatch",
        false,
        error instanceof Error
          ? error.message
          : "product operations probe failed",
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
      `product-operations-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOperationsReleaseGatePass(
  gate: ReleaseGateResult = checkProductOperationsReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product operations release gate failed: ${gate.summary}`,
    );
  }
}
