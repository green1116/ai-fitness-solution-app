/**
 * Product Report — Report Engine Release Gate
 * MODULE: Report
 * BASE: enterprise-product-dashboard-framework-v1
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
import { PRODUCT_DASHBOARD_FRAMEWORK_ID } from "../../dashboard/framework/framework.constants";
import { PRODUCT_KPI_MANAGEMENT_ID } from "../../kpi/management/management.constants";
import {
  DELIVERY_CHANNELS,
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
  PRODUCT_REPORT_FREEZE_VERSION,
  REPORT_FORMATS,
  REPORT_JOB_STATUSES,
  REPORT_MANAGER_STATUSES,
  REPORT_READINESS_VERDICTS,
  REPORT_TEMPLATE_KINDS,
} from "../engine/engine.constants";
import {
  assertReportEngineReadinessReady,
  clearReportEngineLayer,
  createReportManager,
  getReportRegistryManifest,
} from "../report.manager";

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

export const PRODUCT_REPORT_SIGNOFF_VERSION =
  "product-report-signoff-1" as const;

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
  clearReportEngineLayer();
}

export function checkProductReportReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "RPT-CONSTANTS",
      "engine",
      "Product report engine version constants",
      PRODUCT_REPORT_ENGINE_ID === "enterprise-product-report-engine-v1" &&
        PRODUCT_REPORT_ENGINE_VERSION === "product-report-1" &&
        PRODUCT_REPORT_ENGINE_BASE === PRODUCT_DASHBOARD_FRAMEWORK_ID &&
        PRODUCT_REPORT_ENGINE_FREEZE_VERSION ===
          "product-report-engine-freeze-1" &&
        PRODUCT_REPORT_FREEZE_VERSION === "product-report-engine-freeze-1" &&
        REPORT_TEMPLATE_KINDS.length === 3 &&
        REPORT_JOB_STATUSES.length === 4 &&
        REPORT_FORMATS.length === 3 &&
        DELIVERY_CHANNELS.length === 3 &&
        REPORT_READINESS_VERDICTS.length === 3 &&
        REPORT_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_REPORT_ENGINE_ID} base=${PRODUCT_REPORT_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "RPT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "RPT-DSH-BASE",
      "product-dashboard-framework",
      "Dashboard framework BASE preserved",
      PRODUCT_REPORT_ENGINE_BASE ===
        "enterprise-product-dashboard-framework-v1" &&
        PRODUCT_DASHBOARD_FRAMEWORK_ID ===
          "enterprise-product-dashboard-framework-v1" &&
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
      `base=${PRODUCT_REPORT_ENGINE_BASE}`,
    ),
  );

  checks.push(
    check(
      "RPT-UPSTREAM",
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
    const mgr = createReportManager({ managerId: "prod-rpt-gate" });
    mgr.initialize();
    mgr.start();

    const template = mgr.registerTemplate({
      id: "rpt.gate.tpl",
      code: "EXEC_KPI",
      name: "Executive KPI Report",
      kind: "SUMMARY",
      boardId: "dsh.gate.bd",
    });
    const job = mgr.queueReportJob({
      id: "rpt.gate.job",
      templateId: template.id,
      format: "PDF",
    });
    mgr.completeReportJob({ jobId: job.id, status: "SUCCEEDED" });
    const render = mgr.renderReport({
      id: "rpt.gate.rnd",
      jobId: job.id,
      artifactUri: "s3://reports/exec-kpi.pdf",
      byteSize: 2048,
    });
    mgr.deliverReport({
      id: "rpt.gate.dlv",
      renderId: render.id,
      channel: "PORTAL",
      recipient: "ops.gate.owner",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getReportRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.engineId === PRODUCT_REPORT_ENGINE_ID &&
      registry.base === PRODUCT_REPORT_ENGINE_BASE &&
      registry.templateCount >= 1 &&
      registry.jobCount >= 1 &&
      registry.renderCount >= 1 &&
      registry.deliveryCount >= 1;

    try {
      assertReportEngineReadinessReady(readiness);
      checks.push(
        check(
          "RPT-STACK",
          "engine",
          "Template / job / render / delivery",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "RPT-STACK",
          "engine",
          "Template / job / render / delivery",
          false,
          error instanceof Error
            ? error.message
            : "product report not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "RPT-STACK",
        "engine",
        "Template / job / render / delivery",
        false,
        error instanceof Error
          ? error.message
          : "product report probe failed",
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
      `product-report-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductReportReleaseGatePass(
  gate: ReleaseGateResult = checkProductReportReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product report release gate failed: ${gate.summary}`,
    );
  }
}
