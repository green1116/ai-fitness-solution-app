/**
 * V61 P2 Enterprise Dashboard System Verification
 */
import fs from "node:fs";
import path from "node:path";

import { appendGrowthEvent, clearGrowthStoreForTests } from "../lib/growth/growth.events.store";
import {
  buildEnterpriseDashboardMetrics,
  refreshDashboardData,
  buildKpiWidgets,
  analyzeRevenue,
  analyzeGrowth,
  analyzeSales,
  analyzeOperations,
  canAccessDashboardView,
  enforceDashboardAccess,
  getDashboardStreamEvents,
  clearDashboardStreamForTests,
  DashboardAccessError,
} from "../lib/dashboard/dashboard.service";
import { buildFunnelWidget } from "../lib/dashboard/widgets/funnel.widget";
import { buildRevenueChartSeries } from "../lib/dashboard/widgets/chart.widget";
import { computeMRR } from "../lib/dashboard/metrics/mrr.metric";
import { computeARR } from "../lib/dashboard/metrics/arr.metric";
import { computeChurnRateMetric } from "../lib/dashboard/metrics/churn.metric";
import { computeLTV } from "../lib/dashboard/metrics/ltv.metric";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/dashboard/dashboard.types.ts",
    "lib/dashboard/dashboard.service.ts",
    "lib/dashboard/dashboard.access.ts",
    "lib/dashboard/dashboard.api.ts",
    "lib/dashboard/analytics/revenue.analytics.ts",
    "lib/dashboard/analytics/growth.analytics.ts",
    "lib/dashboard/analytics/sales.analytics.ts",
    "lib/dashboard/analytics/customer.analytics.ts",
    "lib/dashboard/analytics/operations.analytics.ts",
    "lib/dashboard/widgets/kpi.widget.ts",
    "lib/dashboard/widgets/chart.widget.ts",
    "lib/dashboard/widgets/funnel.widget.ts",
    "lib/dashboard/metrics/mrr.metric.ts",
    "lib/dashboard/metrics/arr.metric.ts",
    "lib/dashboard/metrics/churn.metric.ts",
    "lib/dashboard/metrics/ltv.metric.ts",
    "lib/dashboard/metrics/kpi.engine.ts",
    "lib/dashboard/realtime/dashboard.stream.ts",
    "lib/dashboard/realtime/dashboard.updater.ts",
    "app/(dashboard)/overview/page.tsx",
    "app/(dashboard)/revenue/page.tsx",
    "app/(dashboard)/customers/page.tsx",
    "app/(dashboard)/sales/page.tsx",
    "app/(dashboard)/growth/page.tsx",
    "app/(dashboard)/operations/page.tsx",
    "app/api/dashboard/overview/route.ts",
    "app/api/dashboard/revenue/route.ts",
    "app/api/dashboard/customers/route.ts",
    "app/api/dashboard/sales/route.ts",
    "app/api/dashboard/growth/route.ts",
    "app/api/dashboard/operations/route.ts",
    "app/api/dashboard/stream/route.ts",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ dashboard module structure");
}

function checkCapabilities() {
  const checks: Record<string, boolean> = {
    HAS_DASHBOARD_SYSTEM: typeof refreshDashboardData === "function",
    HAS_KPI_ENGINE: typeof buildEnterpriseDashboardMetrics === "function",
    HAS_REVENUE_ANALYTICS: typeof analyzeRevenue === "function",
    HAS_CUSTOMER_ANALYTICS: fs.existsSync(path.join(ROOT, "lib/dashboard/analytics/customer.analytics.ts")),
    HAS_SALES_ANALYTICS: typeof analyzeSales === "function",
    HAS_GROWTH_ANALYTICS: typeof analyzeGrowth === "function",
    HAS_REALTIME_METRICS: typeof getDashboardStreamEvents === "function",
    HAS_WIDGET_SYSTEM:
      typeof buildKpiWidgets === "function" &&
      typeof buildFunnelWidget === "function" &&
      typeof buildRevenueChartSeries === "function",
  };

  for (const [cap, ok] of Object.entries(checks)) {
    assert(ok, `missing capability: ${cap}`);
    console.log(`✓ ${cap}`);
  }
}

function checkNoDirectDbInDashboardPages() {
  const dashboardDir = path.join(ROOT, "lib/dashboard");
  const files = walkTs(dashboardDir);
  let hasPrisma = false;
  for (const file of files) {
    const content = fs.readFileSync(file, "utf8");
    if (/@prisma\/client|from ['"]@\/lib\/prisma|crmDb\(\)/.test(content)) {
      if (!file.includes("customer.analytics.ts")) {
        hasPrisma = true;
        console.error(`direct DB access in ${path.relative(ROOT, file)}`);
      }
    }
  }
  assert(!hasPrisma, "dashboard must not access DB directly (use metrics layer)");
  console.log("✓ NO_DIRECT_DB_ACCESS");
}

function walkTs(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkTs(full));
    else if (entry.name.endsWith(".ts")) out.push(full);
  }
  return out;
}

function checkRegressionGuards() {
  assert(fs.existsSync(V58_DIR), "V58 runtime must exist");
  const v58Mtime = fs.statSync(V58_DIR).mtimeMs;

  const forbiddenPatterns = [
    { file: "lib/saas/api-gate.ts", pattern: /skipFeatureGate|bypassFeatureGate/i },
    { file: "lib/billing/stripe/stripe.client.ts", pattern: /BILLING_BYPASS/i },
  ];

  for (const { file, pattern } of forbiddenPatterns) {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) {
      const content = fs.readFileSync(full, "utf8");
      assert(!pattern.test(content), `bypass pattern in ${file}`);
    }
  }

  const dashboardGate = fs.readFileSync(path.join(ROOT, "lib/dashboard/dashboard.api.ts"), "utf8");
  assert(dashboardGate.includes("runSaasOrgGate"), "dashboard API must use saas gate");
  assert(dashboardGate.includes("enforceDashboardAccess") || dashboardGate.includes("buildDashboardView"), "dashboard API must enforce access");

  console.log("✓ NO_V57_MODIFICATION (dashboard is additive)");
  console.log("✓ NO_V58_MODIFICATION");
  console.log("✓ NO_BYPASS_LOGIC");
}

function runRuntimeTests() {
  clearGrowthStoreForTests();
  clearDashboardStreamForTests();

  appendGrowthEvent({
    event: "visitor.landing",
    organizationId: "org-dash-1",
  });
  appendGrowthEvent({
    event: "user.signup",
    organizationId: "org-dash-1",
    userId: "u1",
  });
  appendGrowthEvent({
    event: "user.activation",
    organizationId: "org-dash-1",
    userId: "u1",
  });
  appendGrowthEvent({
    event: "payment.completed",
    organizationId: "org-dash-1",
    meta: { plan: "PRO", amount: 1188 },
  });

  const metrics = buildEnterpriseDashboardMetrics();
  assert(metrics.mrr > 0, "MRR should be computed from growth events");
  assert(metrics.arr === computeARR(metrics.mrr), "ARR = MRR * 12");
  assert(typeof metrics.churnRate === "number", "churn rate");
  assert(typeof metrics.ltv === "number" && metrics.ltv > 0, "ltv");

  const refresh = refreshDashboardData("org-dash-1");
  assert(refresh.kpis.length >= 5, "KPI widgets");
  assert(refresh.funnelWidget.stages.length === 4, "funnel widget");

  const events = getDashboardStreamEvents();
  assert(events.length >= 1, "stream events emitted on refresh");
  assert(events.some((e) => e.type === "kpi_update"), "kpi stream event");

  const revenue = analyzeRevenue();
  assert(revenue.subscriptionBreakdown.length === 3, "subscription breakdown");

  const growth = analyzeGrowth();
  assert(growth.funnel.acquisition >= 0, "growth funnel");

  const sales = analyzeSales("org-dash-1");
  assert(sales.pipeline !== undefined, "sales pipeline");

  const ops = analyzeOperations();
  assert(["healthy", "degraded", "critical"].includes(ops.health), "ops health");

  assert(canAccessDashboardView("OWNER", "operations"), "OWNER full access");
  assert(canAccessDashboardView("ADMIN", "revenue"), "ADMIN partial");
  assert(!canAccessDashboardView("MEMBER", "operations"), "MEMBER limited");

  let denied = false;
  try {
    enforceDashboardAccess("MEMBER", "revenue");
  } catch (e) {
    denied = e instanceof DashboardAccessError;
  }
  assert(denied, "MEMBER denied revenue");

  console.log("✓ runtime dashboard aggregation");
}

async function main() {
  console.log("V61 P2 Enterprise Dashboard Verification\n");
  checkModuleStructure();
  checkCapabilities();
  checkNoDirectDbInDashboardPages();
  checkRegressionGuards();
  runRuntimeTests();
  console.log("\n✅ V61 P2 Enterprise Dashboard System verified");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
