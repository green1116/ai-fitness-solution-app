/**
 * Product Analytics — Governance Freeze lock (read-only)
 * Freezes Analytics → KPI → Dashboard → Report → Forecast → BI → Analytics Audit
 * BASE: enterprise-product-analytics-audit-v1
 * Isolated namespace: lib/product/analytics-baseline
 * Does not modify upstream analytics module sources
 */

import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_PRODUCT_COMPLETE_ID } from "../../complete/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_BILLING_BASELINE_ID } from "../../billing-baseline/freeze/freeze.lock";
import { ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID } from "../../customer-baseline/freeze/freeze.lock";
import {
  PRODUCT_ANALYTICS_AUDIT_BASE,
  PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
  PRODUCT_ANALYTICS_AUDIT_ID,
  PRODUCT_ANALYTICS_AUDIT_VERSION,
} from "../../analytics-audit/traceability/traceability.constants";
import {
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
} from "../../analytics/foundation/foundation.constants";
import {
  PRODUCT_BI_INTEGRATION_BASE,
  PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_ID,
  PRODUCT_BI_INTEGRATION_VERSION,
} from "../../bi/integration/integration.constants";
import {
  PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
  PRODUCT_DASHBOARD_FRAMEWORK_ID,
  PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
} from "../../dashboard/framework/framework.constants";
import {
  PRODUCT_FORECAST_TREND_BASE,
  PRODUCT_FORECAST_TREND_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_ID,
  PRODUCT_FORECAST_TREND_VERSION,
} from "../../forecast/trend/trend.constants";
import {
  PRODUCT_KPI_MANAGEMENT_BASE,
  PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_KPI_MANAGEMENT_ID,
  PRODUCT_KPI_MANAGEMENT_VERSION,
} from "../../kpi/management/management.constants";
import {
  PRODUCT_REPORT_ENGINE_BASE,
  PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
  PRODUCT_REPORT_ENGINE_ID,
  PRODUCT_REPORT_ENGINE_VERSION,
} from "../../report/engine/engine.constants";

export const PRODUCT_ANALYTICS_SIGNOFF_VERSION =
  "product-analytics-baseline-signoff-1" as const;

export const PRODUCT_ANALYTICS_BASELINE_FREEZE_VERSION =
  "product-analytics-baseline-freeze-1" as const;

export const PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE =
  "enterprise-product-analytics-audit-v1" as const;

export const PRODUCT_ANALYTICS_BASELINE_ID =
  "enterprise-product-analytics-baseline-v1" as const;

/** Stable alias for downstream consumers. */
export const ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID =
  "enterprise-product-analytics-baseline-v1" as const;

export type ProductAnalyticsComponentId =
  | "analytics"
  | "kpi"
  | "dashboard"
  | "report"
  | "forecast"
  | "bi"
  | "analytics-audit"
  | "analytics-freeze";

export type ProductAnalyticsComponentLock = {
  id: ProductAnalyticsComponentId;
  path: string;
  label: string;
  required: true;
};

export type ProductAnalyticsPhaseVersions = {
  analytics: {
    id: typeof PRODUCT_ANALYTICS_FOUNDATION_ID;
    version: typeof PRODUCT_ANALYTICS_FOUNDATION_VERSION;
    freeze: typeof PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION;
    base: typeof PRODUCT_ANALYTICS_FOUNDATION_BASE;
  };
  kpi: {
    id: typeof PRODUCT_KPI_MANAGEMENT_ID;
    version: typeof PRODUCT_KPI_MANAGEMENT_VERSION;
    freeze: typeof PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION;
    base: typeof PRODUCT_KPI_MANAGEMENT_BASE;
  };
  dashboard: {
    id: typeof PRODUCT_DASHBOARD_FRAMEWORK_ID;
    version: typeof PRODUCT_DASHBOARD_FRAMEWORK_VERSION;
    freeze: typeof PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION;
    base: typeof PRODUCT_DASHBOARD_FRAMEWORK_BASE;
  };
  report: {
    id: typeof PRODUCT_REPORT_ENGINE_ID;
    version: typeof PRODUCT_REPORT_ENGINE_VERSION;
    freeze: typeof PRODUCT_REPORT_ENGINE_FREEZE_VERSION;
    base: typeof PRODUCT_REPORT_ENGINE_BASE;
  };
  forecast: {
    id: typeof PRODUCT_FORECAST_TREND_ID;
    version: typeof PRODUCT_FORECAST_TREND_VERSION;
    freeze: typeof PRODUCT_FORECAST_TREND_FREEZE_VERSION;
    base: typeof PRODUCT_FORECAST_TREND_BASE;
  };
  bi: {
    id: typeof PRODUCT_BI_INTEGRATION_ID;
    version: typeof PRODUCT_BI_INTEGRATION_VERSION;
    freeze: typeof PRODUCT_BI_INTEGRATION_FREEZE_VERSION;
    base: typeof PRODUCT_BI_INTEGRATION_BASE;
  };
  analyticsAudit: {
    id: typeof PRODUCT_ANALYTICS_AUDIT_ID;
    version: typeof PRODUCT_ANALYTICS_AUDIT_VERSION;
    freeze: typeof PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION;
    base: typeof PRODUCT_ANALYTICS_AUDIT_BASE;
  };
};

export type ProductAnalyticsFreezeLock = {
  version: typeof PRODUCT_ANALYTICS_BASELINE_FREEZE_VERSION;
  base: typeof PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE;
  baselineId: typeof PRODUCT_ANALYTICS_BASELINE_ID;
  baselineAlias: typeof ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID;
  signoff: typeof PRODUCT_ANALYTICS_SIGNOFF_VERSION;
  customerBaseline: typeof ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID;
  billingBaseline: typeof ENTERPRISE_PRODUCT_BILLING_BASELINE_ID;
  authBaseline: typeof ENTERPRISE_PRODUCT_AUTH_BASELINE_ID;
  productCompleteBaseline: typeof ENTERPRISE_PRODUCT_COMPLETE_ID;
  operationsBaseline: typeof ENTERPRISE_OPERATIONS_COMPLETE_ID;
  launchReadinessBaseline: typeof ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID;
  commercializationBaseline: typeof ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID;
  evolutionBaseline: typeof ENTERPRISE_EVOLUTION_COMPLETE_ID;
  launchBaseline: typeof ENTERPRISE_LAUNCH_COMPLETE_ID;
  e12Baseline: typeof E12_PRODUCTIZATION_COMPLETE_ID;
  platformBaseline: "enterprise-platform-v1-complete";
  phases: ProductAnalyticsPhaseVersions;
  components: ProductAnalyticsComponentLock[];
  readOnly: true;
};

export const PRODUCT_ANALYTICS_COMPONENT_LOCK: ProductAnalyticsComponentLock[] =
  [
    {
      id: "analytics",
      path: "lib/product/analytics/",
      label: "Product Analytics Foundation",
      required: true,
    },
    {
      id: "kpi",
      path: "lib/product/kpi/",
      label: "Product KPI Management",
      required: true,
    },
    {
      id: "dashboard",
      path: "lib/product/dashboard/",
      label: "Product Dashboard Framework",
      required: true,
    },
    {
      id: "report",
      path: "lib/product/report/",
      label: "Product Report Engine",
      required: true,
    },
    {
      id: "forecast",
      path: "lib/product/forecast/",
      label: "Product Forecast Trend",
      required: true,
    },
    {
      id: "bi",
      path: "lib/product/bi/",
      label: "Product BI Integration",
      required: true,
    },
    {
      id: "analytics-audit",
      path: "lib/product/analytics-audit/",
      label: "Product Analytics Audit",
      required: true,
    },
    {
      id: "analytics-freeze",
      path: "lib/product/analytics-baseline/",
      label: "Product Analytics Governance Freeze",
      required: true,
    },
  ];

export const PRODUCT_ANALYTICS_PHASE_VERSIONS: ProductAnalyticsPhaseVersions = {
  analytics: {
    id: PRODUCT_ANALYTICS_FOUNDATION_ID,
    version: PRODUCT_ANALYTICS_FOUNDATION_VERSION,
    freeze: PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_ANALYTICS_FOUNDATION_BASE,
  },
  kpi: {
    id: PRODUCT_KPI_MANAGEMENT_ID,
    version: PRODUCT_KPI_MANAGEMENT_VERSION,
    freeze: PRODUCT_KPI_MANAGEMENT_FREEZE_VERSION,
    base: PRODUCT_KPI_MANAGEMENT_BASE,
  },
  dashboard: {
    id: PRODUCT_DASHBOARD_FRAMEWORK_ID,
    version: PRODUCT_DASHBOARD_FRAMEWORK_VERSION,
    freeze: PRODUCT_DASHBOARD_FRAMEWORK_FREEZE_VERSION,
    base: PRODUCT_DASHBOARD_FRAMEWORK_BASE,
  },
  report: {
    id: PRODUCT_REPORT_ENGINE_ID,
    version: PRODUCT_REPORT_ENGINE_VERSION,
    freeze: PRODUCT_REPORT_ENGINE_FREEZE_VERSION,
    base: PRODUCT_REPORT_ENGINE_BASE,
  },
  forecast: {
    id: PRODUCT_FORECAST_TREND_ID,
    version: PRODUCT_FORECAST_TREND_VERSION,
    freeze: PRODUCT_FORECAST_TREND_FREEZE_VERSION,
    base: PRODUCT_FORECAST_TREND_BASE,
  },
  bi: {
    id: PRODUCT_BI_INTEGRATION_ID,
    version: PRODUCT_BI_INTEGRATION_VERSION,
    freeze: PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
    base: PRODUCT_BI_INTEGRATION_BASE,
  },
  analyticsAudit: {
    id: PRODUCT_ANALYTICS_AUDIT_ID,
    version: PRODUCT_ANALYTICS_AUDIT_VERSION,
    freeze: PRODUCT_ANALYTICS_AUDIT_FREEZE_VERSION,
    base: PRODUCT_ANALYTICS_AUDIT_BASE,
  },
};

export const PRODUCT_ANALYTICS_FREEZE_LOCK: ProductAnalyticsFreezeLock = {
  version: PRODUCT_ANALYTICS_BASELINE_FREEZE_VERSION,
  base: PRODUCT_ANALYTICS_BASELINE_FREEZE_BASE,
  baselineId: PRODUCT_ANALYTICS_BASELINE_ID,
  baselineAlias: ENTERPRISE_PRODUCT_ANALYTICS_BASELINE_ID,
  signoff: PRODUCT_ANALYTICS_SIGNOFF_VERSION,
  customerBaseline: ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID,
  billingBaseline: ENTERPRISE_PRODUCT_BILLING_BASELINE_ID,
  authBaseline: ENTERPRISE_PRODUCT_AUTH_BASELINE_ID,
  productCompleteBaseline: ENTERPRISE_PRODUCT_COMPLETE_ID,
  operationsBaseline: ENTERPRISE_OPERATIONS_COMPLETE_ID,
  launchReadinessBaseline: ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID,
  commercializationBaseline: ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID,
  evolutionBaseline: ENTERPRISE_EVOLUTION_COMPLETE_ID,
  launchBaseline: ENTERPRISE_LAUNCH_COMPLETE_ID,
  e12Baseline: E12_PRODUCTIZATION_COMPLETE_ID,
  platformBaseline: "enterprise-platform-v1-complete",
  phases: PRODUCT_ANALYTICS_PHASE_VERSIONS,
  components: PRODUCT_ANALYTICS_COMPONENT_LOCK,
  readOnly: true,
};

export function isProductAnalyticsFreezeLockIntact(
  lock: ProductAnalyticsFreezeLock = PRODUCT_ANALYTICS_FREEZE_LOCK,
): boolean {
  return (
    lock.readOnly === true &&
    lock.baselineId === "enterprise-product-analytics-baseline-v1" &&
    lock.baselineAlias === "enterprise-product-analytics-baseline-v1" &&
    lock.base === PRODUCT_ANALYTICS_AUDIT_ID &&
    lock.phases.analytics.id === PRODUCT_ANALYTICS_FOUNDATION_ID &&
    lock.phases.analytics.base === ENTERPRISE_PRODUCT_CUSTOMER_BASELINE_ID &&
    lock.phases.kpi.base === PRODUCT_ANALYTICS_FOUNDATION_ID &&
    lock.phases.dashboard.base === PRODUCT_KPI_MANAGEMENT_ID &&
    lock.phases.report.base === PRODUCT_DASHBOARD_FRAMEWORK_ID &&
    lock.phases.forecast.base === PRODUCT_REPORT_ENGINE_ID &&
    lock.phases.bi.base === PRODUCT_FORECAST_TREND_ID &&
    lock.phases.analyticsAudit.base === PRODUCT_BI_INTEGRATION_ID &&
    lock.phases.analyticsAudit.id === PRODUCT_ANALYTICS_AUDIT_ID &&
    lock.components.length === 8
  );
}
