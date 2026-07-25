/**
 * Product Dashboard — Dashboard Framework Release Gate
 * MODULE: Dashboard
 * BASE: enterprise-product-kpi-management-v1
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
import { PRODUCT_ANALYTICS_FOUNDATION_ID } from "../../analytics/foundation/foundation.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import {
  assertDashboardFrameworkReadinessReady,
  clearDashboardFrameworkLayer,
  createDashboardManager,
  getDashboardRegistryManifest,
} from "../dashboard.manager";
import {
  DASHBOARD_KINDS,
  DASHBOARD_MANAGER_STATUSES,
  DASHBOARD_READINESS_VERDICTS,
  DASHBOARD_STATUSES,
  LAYOUT_REGIONS,
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
  PRODUCT_DASHBOARD_FREEZE_VERSION,
  WIDGET_KINDS,
} from "../framework/framework.constants";

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

export const PRODUCT_DASHBOARD_SIGNOFF_VERSION =
  "product-dashboard-signoff-1" as const;

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
  clearDashboardFrameworkLayer();
}

export function checkProductDashboardReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "DSH-CONSTANTS",
      "framework",
      "Product dashboard framework version constants",
      PRODUCT_DASHBOARD_FRAMEWORK_ID ===
        "enterprise-product-dashboard-framework-v1" &&
        PRODUCT_DASHBOARD_FRAMEWORK_VERSION === "product-dashboard-1" &&
        PRODUCT_DASHBOARD_FRAMEWORK_BASE === PRODUCT_KPI_MANAGEMENT_ID &&
        PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION ===
          "product-dashboard-framework-freeze-1" &&
        PRODUCT_DASHBOARD_FREEZE_VERSION ===
          "product-dashboard-framework-freeze-1" &&
        DASHBOARD_KINDS.length === 3 &&
        DASHBOARD_STATUSES.length === 3 &&
        WIDGET_KINDS.length === 4 &&
        LAYOUT_REGIONS.length === 4 &&
        DASHBOARD_READINESS_VERDICTS.length === 3 &&
        DASHBOARD_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_DASHBOARD_FRAMEWORK_ID} base=${PRODUCT_DASHBOARD_FRAMEWORK_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "DSH-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "DSH-KPI-BASE",
      "product-kpi-management",
      "KPI management BASE preserved",
      PRODUCT_DASHBOARD_FRAMEWORK_BASE ===
        "enterprise-product-kpi-management-v1" &&
        PRODUCT_KPI_MANAGEMENT_ID ===
          "enterprise-product-kpi-management-v1" &&
        PRODUCT_ANALYTICS_FOUNDATION_ID ===
          "enterprise-product-analytics-foundation-v1" &&
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
      `base=${PRODUCT_DASHBOARD_FRAMEWORK_BASE}`,
    ),
  );

  checks.push(
    check(
      "DSH-UPSTREAM",
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
    const mgr = createDashboardManager({ managerId: "prod-dsh-gate" });
    mgr.initialize();
    mgr.start();

    const board = mgr.createBoard({
      id: "dsh.gate.bd",
      name: "Executive KPI Board",
      kind: "EXECUTIVE",
      ownerId: "ops.gate.owner",
    });
    const widget = mgr.addWidget({
      id: "dsh.gate.wg",
      boardId: board.id,
      kind: "KPI",
      title: "NRR",
      refId: "kpi.gate.def",
    });
    mgr.placeWidget({
      id: "dsh.gate.ly",
      boardId: board.id,
      widgetId: widget.id,
      region: "MAIN",
      order: 0,
    });
    mgr.updateBoardStatus({ boardId: board.id, status: "PUBLISHED" });
    const snap = mgr.captureSnapshot({
      id: "dsh.gate.sn",
      boardId: board.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getDashboardRegistryManifest();

    const ok =
      snap.widgetCount >= 1 &&
      snap.layoutCount >= 1 &&
      readiness.verdict === "READY" &&
      registry.frameworkId === PRODUCT_DASHBOARD_FRAMEWORK_ID &&
      registry.base === PRODUCT_DASHBOARD_FRAMEWORK_BASE &&
      registry.boardCount >= 1 &&
      registry.widgetCount >= 1 &&
      registry.layoutCount >= 1 &&
      registry.snapshotCount >= 1;

    try {
      assertDashboardFrameworkReadinessReady(readiness);
      checks.push(
        check(
          "DSH-STACK",
          "framework",
          "Board / widget / layout / snapshot",
          ok,
          `readiness=${readiness.verdict} widgets=${snap.widgetCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "DSH-STACK",
          "framework",
          "Board / widget / layout / snapshot",
          false,
          error instanceof Error
            ? error.message
            : "product dashboard not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "DSH-STACK",
        "framework",
        "Board / widget / layout / snapshot",
        false,
        error instanceof Error
          ? error.message
          : "product dashboard probe failed",
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
      `product-dashboard-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductDashboardReleaseGatePass(
  gate: ReleaseGateResult = checkProductDashboardReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product dashboard release gate failed: ${gate.summary}`,
    );
  }
}
