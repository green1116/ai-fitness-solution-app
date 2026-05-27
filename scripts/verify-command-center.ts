/**
 * V3.7-H15 Unified Enterprise Command Center — smoke verification
 */
import {
  PRODUCTION_COMMAND_CENTER_VERSION,
  COMMAND_CENTER_CONFIG_VERSION,
  COMMAND_CENTER_SUMMARY_VERSION,
  COMMAND_CENTER_MANIFEST_VERSION,
  COMMAND_CENTER_VERSION,
  getCommandCenterConfig,
  buildCommandCenterSummary,
  buildCommandCenterManifest,
  buildProductionCommandCenterFoundation,
  type ProductionCommandCenterFoundation,
  type CommandCenterSummary,
} from "../lib/commercialization/command-center/index";

const FOUNDATION_API_KEYS: (keyof ProductionCommandCenterFoundation)[] = [
  "version",
  "foundationId",
  "config",
  "summary",
  "manifest",
  "foundationSummary",
];

const SUMMARY_KEYS: (keyof CommandCenterSummary)[] = [
  "version",
  "summaryId",
  "opsSummary",
  "dashboardSummary",
  "releaseSummary",
  "auditSummary",
  "governanceSummary",
  "accessSummary",
  "observabilitySummary",
  "readinessSummary",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testCommandCenterConfig() {
  const config = getCommandCenterConfig();
  assert(config.version === COMMAND_CENTER_CONFIG_VERSION, "config version");
  assert(config.defaultLanding === "/dashboard/command-center", "default landing");
  assert(config.defaultView === "overview", "default view");
  assert(config.modules.length >= 10, "modules");
  assert(config.shortcuts.length >= 8, "shortcuts");
  assert(config.sections.length >= 6, "sections");
  assert(config.visibilityRules.length === config.modules.length, "visibility rules");

  console.log("✓ command center config");
  console.log(" ", `modules=${config.modules.length} shortcuts=${config.shortcuts.length}`);
}

function testCommandCenterSummary() {
  const summary = buildCommandCenterSummary({ deploymentId: "h15-summary" });
  assert(summary.version === COMMAND_CENTER_SUMMARY_VERSION, "summary version");
  assert(summary.summaryId.includes("CCS-V37H15"), "summary id");
  assert(summary.opsSummary.includes("enterprise-ops-overview"), "ops summary");
  assert(summary.dashboardSummary.includes("unified-dashboard-overview"), "dashboard summary");
  assert(summary.releaseSummary.includes("release-ledger"), "release summary");
  assert(summary.auditSummary.includes("audit-snapshot"), "audit summary");
  assert(summary.governanceSummary.includes("production-governance"), "governance summary");
  assert(summary.accessSummary.includes("production-access-control"), "access summary");
  assert(summary.observabilitySummary.includes("production-observability"), "observability summary");
  assert(summary.readinessSummary.readyForOps, "ready for ops");

  for (const key of SUMMARY_KEYS) {
    assert(key in summary, `summary shape missing ${String(key)}`);
  }

  console.log("✓ command center summary");
  console.log(" ", summary.summary);
}

function testCommandCenterManifest() {
  const manifest = buildCommandCenterManifest({ deploymentId: "h15-manifest" });
  assert(manifest.version === COMMAND_CENTER_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("CCM-V37H15"), "manifest id");
  assert(manifest.COMMAND_CENTER_VERSION === COMMAND_CENTER_VERSION, "command center version");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.DASHBOARD_VERSION.length > 0, "dashboard version");
  assert(manifest.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(manifest.AUDIT_VERSION.length > 0, "audit version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(manifest.ACCESS_MATRIX_VERSION.length > 0, "access matrix version");
  assert(manifest.readyForCommandCenter === true, "ready for command center");
  assert(manifest.readyForOps === true, "ready for ops");
  assert(manifest.readyForGovernance === true, "ready for governance");
  assert(manifest.readyForRelease === true, "ready for release");

  console.log("✓ command center manifest");
  console.log(" ", manifest.summary);
}

function testCommandCenterApi() {
  const foundation = buildProductionCommandCenterFoundation({ deploymentId: "h15-api" });
  assert(foundation.version === PRODUCTION_COMMAND_CENTER_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `command center API missing ${String(key)}`);
  }
  assert(foundation.manifest.readyForCommandCenter, "ready for command center");
  assert(foundation.config.shortcuts.length >= 8, "shortcuts linked");

  console.log("✓ command center API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/command-center foundationId=${foundation.foundationId}`,
  );
}

function testCommandCenterPage() {
  const foundation = buildProductionCommandCenterFoundation({ deploymentId: "h15-page" });
  assert(foundation.config.sections.length >= 6, "page sections");
  assert(foundation.summary.readinessSummary.readyForGovernance, "governance status");
  assert(foundation.summary.readinessSummary.readyForRelease, "release status");
  assert(foundation.config.shortcuts.some((s) => s.id === "sc-governance"), "governance shortcut");

  console.log("✓ command center page");
  console.log(" ", `route=/dashboard/command-center modules=${foundation.config.modules.length}`);
}

function main() {
  testCommandCenterConfig();
  testCommandCenterSummary();
  testCommandCenterManifest();
  testCommandCenterApi();
  testCommandCenterPage();
  console.log("\nAll command center checks passed.");
}

main();
