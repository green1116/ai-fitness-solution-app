/**
 * Post-Launch P5 — Growth Analytics Readiness
 * Integrates customer success, billing, API usage, commercial control
 */

import { getApiUsageCount } from "../../product/e12/api/api.usage";
import { listBillingSubscriptions } from "../../product/e12/billing/billing.subscription";
import { listUsageRecords } from "../../product/e12/billing/billing.usage";
import { listActiveCustomers } from "../../product/e12/commercial/commercial.customer";
import { computeRevenueAnalytics } from "../../product/e12/commercial/commercial.revenue";
import { listCustomerHealthProfiles } from "../customer-success/success.health";
import { OPERATIONS_RELEASE_MANAGEMENT_ID } from "../release/release.constants";
import { OPERATIONS_GROWTH_ANALYTICS_BASE } from "./growth.constants";
import { getGrowthDashboard } from "./growth.dashboard";
import type {
  GrowthReadinessCheck,
  GrowthReadinessResult,
} from "./growth.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GrowthReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateGrowthReadiness(
  dashboardId: string,
): GrowthReadinessResult {
  const dashboard = getGrowthDashboard(dashboardId.trim());
  if (!dashboard) {
    return {
      dashboardId,
      verdict: "NOT_READY",
      passCount: 0,
      failCount: 1,
      checks: [
        check(
          "GA-DASHBOARD",
          "dashboard",
          "Growth dashboard exists",
          false,
          `dashboard not found: ${dashboardId}`,
        ),
      ],
      summary: "growth readiness not ready: dashboard missing",
      evaluatedAt: nowIso(),
    };
  }

  const checks: GrowthReadinessCheck[] = [];

  checks.push(
    check(
      "GA-BASE",
      "operations",
      "P4 release management baseline aligned",
      OPERATIONS_GROWTH_ANALYTICS_BASE === OPERATIONS_RELEASE_MANAGEMENT_ID,
      `base=${OPERATIONS_GROWTH_ANALYTICS_BASE}`,
    ),
  );

  checks.push(
    check(
      "GA-USAGE",
      "usage",
      "Usage analytics computed",
      dashboard.usage.apiCallCount + dashboard.usage.billingUsageQuantity > 0,
      `api=${dashboard.usage.apiCallCount} billing=${dashboard.usage.billingUsageQuantity}`,
    ),
  );

  checks.push(
    check(
      "GA-ADOPTION",
      "adoption",
      "Adoption metrics available",
      !!dashboard.adoption.customerHealthProfileId &&
        dashboard.adoption.engagementScore >= 0,
      `engagement=${dashboard.adoption.engagementScore} stage=${dashboard.adoption.adoptionStage ?? "none"}`,
    ),
  );

  checks.push(
    check(
      "GA-EXPANSION",
      "expansion",
      "Expansion signals detected",
      dashboard.expansionSignals.length >= 1,
      `signals=${dashboard.expansionSignals.length}`,
    ),
  );

  checks.push(
    check(
      "GA-REVENUE",
      "revenue",
      "Revenue insights available",
      dashboard.revenue.activeSubscriptions >= 1 || dashboard.revenue.mrr >= 0,
      `mrr=${dashboard.revenue.mrr} subs=${dashboard.revenue.activeSubscriptions}`,
    ),
  );

  const healthProfiles = listCustomerHealthProfiles({
    productId: dashboard.productId,
  });
  checks.push(
    check(
      "GA-CUSTOMER-SUCCESS",
      "customer-success",
      "Customer success profiles present",
      healthProfiles.length >= 1,
      `profiles=${healthProfiles.length}`,
    ),
  );

  const billingSubs = listBillingSubscriptions(
    dashboard.productTenantId
      ? { productTenantId: dashboard.productTenantId }
      : undefined,
  );
  const billingUsage = listUsageRecords(
    dashboard.productTenantId
      ? { productTenantId: dashboard.productTenantId }
      : undefined,
  );
  checks.push(
    check(
      "GA-BILLING",
      "billing",
      "Billing usage / subscriptions integrated",
      billingSubs.length >= 1 || billingUsage.length >= 1,
      `subs=${billingSubs.length} usage=${billingUsage.length}`,
    ),
  );

  const apiCount = getApiUsageCount(
    dashboard.productTenantId
      ? { productTenantId: dashboard.productTenantId }
      : undefined,
  );
  checks.push(
    check(
      "GA-API",
      "api",
      "API usage integrated",
      apiCount >= 1,
      `apiCalls=${apiCount}`,
    ),
  );

  const commercial = computeRevenueAnalytics({
    productId: dashboard.productId,
    productTenantId: dashboard.productTenantId,
  });
  const activeCustomers = listActiveCustomers(dashboard.productId);
  checks.push(
    check(
      "GA-COMMERCIAL",
      "commercial",
      "Commercial control revenue / customers available",
      commercial.activeSubscriptions >= 0 && activeCustomers.length >= 0,
      `mrr=${commercial.mrr} customers=${activeCustomers.length}`,
    ),
  );

  checks.push(
    check(
      "GA-SCORE",
      "dashboard",
      "Growth score acceptable",
      dashboard.growthScore >= 40,
      `score=${dashboard.growthScore} trend=${dashboard.trend}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    dashboardId: dashboard.id,
    verdict,
    passCount,
    failCount,
    checks,
    summary: `growth readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertGrowthReadinessReady(
  result: GrowthReadinessResult,
): asserts result is GrowthReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`growth analytics not ready: ${result.summary}`);
  }
}
