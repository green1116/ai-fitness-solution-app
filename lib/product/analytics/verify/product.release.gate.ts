/**
 * Product Analytics — Analytics Foundation Release Gate
 * MODULE: Analytics
 * BASE: enterprise-product-customer-baseline-v1
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
import { PRODUCT_CRM_AUDIT_ID } from "../../crm-audit/traceability/traceability.constants";
import { PRODUCT_CUSTOMER_FOUNDATION_ID } from "../../customer/foundation/foundation.constants";
import {
  assertAnalyticsFoundationReadinessReady,
  clearAnalyticsFoundationLayer,
  createAnalyticsManager,
  getAnalyticsRegistryManifest,
} from "../analytics.manager";
import {
  ANALYTICS_MANAGER_STATUSES,
  ANALYTICS_READINESS_VERDICTS,
  DATASET_STATUSES,
  METRIC_KINDS,
  PIPELINE_STATUSES,
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
  PRODUCT_ANALYTICS_FREEZE_VERSION,
  REPORT_KINDS,
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

export const PRODUCT_ANALYTICS_SIGNOFF_VERSION =
  "product-analytics-signoff-1" as const;

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
  clearAnalyticsFoundationLayer();
}

export function checkProductAnalyticsReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "ANL-CONSTANTS",
      "foundation",
      "Product analytics foundation version constants",
      PRODUCT_ANALYTICS_FOUNDATION_ID ===
        "enterprise-product-analytics-foundation-v1" &&
        PRODUCT_ANALYTICS_FOUNDATION_VERSION === "product-analytics-1" &&
        PRODUCT_ANALYTICS_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID &&
        PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION ===
          "product-analytics-foundation-freeze-1" &&
        PRODUCT_ANALYTICS_FREEZE_VERSION ===
          "product-analytics-foundation-freeze-1" &&
        METRIC_KINDS.length === 3 &&
        DATASET_STATUSES.length === 3 &&
        PIPELINE_STATUSES.length === 4 &&
        REPORT_KINDS.length === 3 &&
        ANALYTICS_READINESS_VERDICTS.length === 3 &&
        ANALYTICS_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_ANALYTICS_FOUNDATION_ID} base=${PRODUCT_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ANL-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ANL-CUS-BASE",
      "product-customer-baseline",
      "Customer baseline BASE preserved",
      PRODUCT_ANALYTICS_FOUNDATION_BASE ===
        "enterprise-product-customer-baseline-v1" &&
        ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID ===
          "enterprise-product-customer-baseline-v1" &&
        PRODUCT_CRM_AUDIT_ID === "enterprise-product-crm-audit-v1" &&
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
      `base=${PRODUCT_ANALYTICS_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "ANL-UPSTREAM",
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
    const mgr = createAnalyticsManager({ managerId: "prod-anl-gate" });
    mgr.initialize();
    mgr.start();

    const metric = mgr.registerMetric({
      id: "anl.gate.met",
      code: "ACTIVE_CUSTOMERS",
      kind: "GAUGE",
      unit: "count",
    });
    const dataset = mgr.registerDataset({
      id: "anl.gate.ds",
      name: "CRM Activity Feed",
      source: "customer-activity",
    });
    mgr.updateDatasetStatus({
      datasetId: dataset.id,
      status: "ACTIVE",
    });
    const pipeline = mgr.createPipeline({
      id: "anl.gate.pipe",
      datasetId: dataset.id,
      metricId: metric.id,
    });
    mgr.runPipeline({ pipelineId: pipeline.id });
    mgr.generateReport({
      id: "anl.gate.rpt",
      pipelineId: pipeline.id,
      kind: "SUMMARY",
      title: "Active customers summary",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getAnalyticsRegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_ANALYTICS_FOUNDATION_ID &&
      registry.base === PRODUCT_ANALYTICS_FOUNDATION_BASE &&
      registry.metricCount >= 1 &&
      registry.datasetCount >= 1 &&
      registry.pipelineCount >= 1 &&
      registry.reportCount >= 1;

    try {
      assertAnalyticsFoundationReadinessReady(readiness);
      checks.push(
        check(
          "ANL-STACK",
          "foundation",
          "Metric / dataset / pipeline / report",
          ok,
          `readiness=${readiness.verdict}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ANL-STACK",
          "foundation",
          "Metric / dataset / pipeline / report",
          false,
          error instanceof Error
            ? error.message
            : "product analytics not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "ANL-STACK",
        "foundation",
        "Metric / dataset / pipeline / report",
        false,
        error instanceof Error
          ? error.message
          : "product analytics probe failed",
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
      `product-analytics-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAnalyticsReleaseGatePass(
  gate: ReleaseGateResult = checkProductAnalyticsReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product analytics release gate failed: ${gate.summary}`,
    );
  }
}
