/**
 * V3.7-H14 Unified Enterprise Dashboard Integration — smoke verification
 */
import {
  PRODUCTION_DASHBOARD_INTEGRATION_VERSION,
  DASHBOARD_INTEGRATION_VERSION,
  DASHBOARD_MANIFEST_VERSION,
  DASHBOARD_SUMMARY_VERSION,
  buildUnifiedDashboardOverview,
  buildDashboardIntegration,
  buildDashboardIntegrationManifest,
  buildDashboardSummaryBundle,
  type UnifiedDashboardOverview,
  type DashboardIntegration,
  type DashboardSummaryBundle,
} from "../lib/commercialization/dashboard-integration/index";

const OVERVIEW_API_KEYS: (keyof UnifiedDashboardOverview)[] = [
  "version",
  "overviewId",
  "integration",
  "manifest",
  "summaries",
  "summary",
];

const INTEGRATION_KEYS: (keyof DashboardIntegration)[] = [
  "version",
  "integrationId",
  "sections",
  "widgets",
  "governanceWidgets",
  "auditWidgets",
  "releaseWidgets",
  "opsWidgets",
  "defaultWidget",
  "summary",
];

const SUMMARY_KEYS: (keyof DashboardSummaryBundle)[] = [
  "version",
  "summaryId",
  "governanceSummary",
  "auditSummary",
  "releaseSummary",
  "opsSummary",
  "observabilitySummary",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testDashboardIntegration() {
  const integration = buildDashboardIntegration({ deploymentId: "h14-integration" });
  assert(integration.version === DASHBOARD_INTEGRATION_VERSION, "integration version");
  assert(integration.integrationId.includes("DIN-V37H14"), "integration id");
  assert(integration.widgets.length >= 10, "widgets");
  assert(integration.governanceWidgets.length >= 4, "governance widgets");
  assert(integration.auditWidgets.length >= 1, "audit widgets");
  assert(integration.releaseWidgets.length >= 2, "release widgets");
  assert(integration.opsWidgets.length >= 2, "ops widgets");
  assert(integration.defaultWidget === "enterprise-ops", "default widget");
  assert(integration.sections.length >= 5, "sections");

  for (const key of INTEGRATION_KEYS) {
    assert(key in integration, `integration shape missing ${String(key)}`);
  }

  console.log("✓ dashboard integration config");
  console.log(" ", integration.summary);
}

function testDashboardManifest() {
  const manifest = buildDashboardIntegrationManifest({ deploymentId: "h14-manifest" });
  assert(manifest.version === DASHBOARD_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("DMF-V37H14"), "manifest id");
  assert(manifest.DASHBOARD_INTEGRATION_VERSION.length > 0, "integration version ref");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(manifest.AUDIT_VERSION.length > 0, "audit version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(manifest.readyForDashboard === true, "ready for dashboard");
  assert(manifest.readyForGovernance === true, "ready for governance");
  assert(manifest.readyForAudit === true, "ready for audit");
  assert(manifest.readyForRelease === true, "ready for release");

  console.log("✓ dashboard manifest");
  console.log(" ", manifest.summary);
}

function testDashboardSummary() {
  const summaries = buildDashboardSummaryBundle({ deploymentId: "h14-summary" });
  assert(summaries.version === DASHBOARD_SUMMARY_VERSION, "summary version");
  assert(summaries.summaryId.includes("DSM-V37H14"), "summary id");
  assert(summaries.governanceSummary.includes("production-governance"), "governance summary");
  assert(summaries.auditSummary.includes("audit-snapshot"), "audit summary");
  assert(summaries.releaseSummary.includes("release-ledger"), "release summary");
  assert(summaries.opsSummary.includes("enterprise-ops-overview"), "ops summary");
  assert(summaries.observabilitySummary.includes("production-observability"), "observability summary");

  for (const key of SUMMARY_KEYS) {
    assert(key in summaries, `summary shape missing ${String(key)}`);
  }

  console.log("✓ dashboard summary");
  console.log(" ", summaries.summary);
}

function testDashboardOverviewApi() {
  const overview = buildUnifiedDashboardOverview({ deploymentId: "h14-overview-api" });
  assert(overview.version === PRODUCTION_DASHBOARD_INTEGRATION_VERSION, "overview version");
  for (const key of OVERVIEW_API_KEYS) {
    assert(key in overview, `dashboard overview API missing ${String(key)}`);
  }
  assert(overview.manifest.readyForDashboard, "manifest ready");
  assert(overview.integration.widgets.length >= 10, "widgets linked");

  console.log("✓ dashboard overview API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/dashboard-overview overviewId=${overview.overviewId}`,
  );
}

function testEnterpriseDashboardPage() {
  const overview = buildUnifiedDashboardOverview({ deploymentId: "h14-enterprise-page" });
  assert(overview.integration.sections.length >= 5, "page sections");
  assert(overview.manifest.readyForGovernance, "governance status");
  assert(overview.manifest.readyForAudit, "audit status");
  assert(overview.summaries.governanceSummary.length > 0, "governance summary on page");
  assert(overview.integration.governanceWidgets.some((w) => w.id === "governance-review"), "governance widget");

  console.log("✓ enterprise dashboard page");
  console.log(" ", `route=/dashboard/enterprise widgets=${overview.integration.widgets.length}`);
}

function main() {
  testDashboardIntegration();
  testDashboardManifest();
  testDashboardSummary();
  testDashboardOverviewApi();
  testEnterpriseDashboardPage();
  console.log("\nAll dashboard integration checks passed.");
}

main();
