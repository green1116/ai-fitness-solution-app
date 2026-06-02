/**
 * V3.7-H13 Enterprise Ops Portal & Unified Navigation — smoke verification
 */
import {
  PRODUCTION_ENTERPRISE_OPS_VERSION,
  UNIFIED_NAVIGATION_VERSION,
  ENTERPRISE_OPS_MANIFEST_VERSION,
  PORTAL_LANDING_VERSION,
  buildEnterpriseOpsOverview,
  buildUnifiedNavigation,
  buildEnterpriseOpsManifest,
  buildPortalLanding,
  type EnterpriseOpsOverview,
  type UnifiedNavigation,
  type PortalLanding,
} from "../lib/commercialization/portal/index";

const OVERVIEW_API_KEYS: (keyof EnterpriseOpsOverview)[] = [
  "version",
  "overviewId",
  "navigation",
  "manifest",
  "landing",
  "summary",
];

const NAVIGATION_KEYS: (keyof UnifiedNavigation)[] = [
  "version",
  "navigationId",
  "defaultLanding",
  "sections",
  "entries",
  "groups",
  "governanceEntries",
  "auditEntries",
  "releaseEntries",
  "summary",
];

const LANDING_KEYS: (keyof PortalLanding)[] = [
  "version",
  "landingId",
  "landingSections",
  "quickLinks",
  "governanceLinks",
  "releaseLinks",
  "auditLinks",
  "evidenceLinks",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testUnifiedNavigation() {
  const navigation = buildUnifiedNavigation({ deploymentId: "h13-nav" });
  assert(navigation.version === UNIFIED_NAVIGATION_VERSION, "navigation version");
  assert(navigation.navigationId.includes("UNV-V37H13"), "navigation id");
  assert(navigation.defaultLanding === "/dashboard/ops", "default landing");
  assert(navigation.entries.length >= 10, "entries");
  assert(navigation.governanceEntries.length >= 4, "governance entries");
  assert(navigation.auditEntries.length >= 1, "audit entries");
  assert(navigation.releaseEntries.length >= 2, "release entries");
  assert(navigation.groups.length >= 7, "groups");

  for (const key of NAVIGATION_KEYS) {
    assert(key in navigation, `navigation shape missing ${String(key)}`);
  }

  console.log("✓ unified navigation");
  console.log(" ", navigation.summary);
}

function testEnterpriseOpsManifest() {
  const manifest = buildEnterpriseOpsManifest({ deploymentId: "h13-manifest" });
  assert(manifest.version === ENTERPRISE_OPS_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("EOM-V37H13"), "manifest id");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.DASHBOARD_VERSION.length > 0, "dashboard version");
  assert(manifest.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(manifest.AUDIT_VERSION.length > 0, "audit version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(manifest.readyForOps === true, "ready for ops");
  assert(manifest.readyForGovernance === true, "ready for governance");
  assert(manifest.readyForRelease === true, "ready for release");

  console.log("✓ enterprise ops manifest");
  console.log(" ", manifest.summary);
}

function testPortalLanding() {
  const landing = buildPortalLanding({ deploymentId: "h13-landing" });
  assert(landing.version === PORTAL_LANDING_VERSION, "landing version");
  assert(landing.landingId.includes("PLD-V37H13"), "landing id");
  assert(landing.landingSections.length >= 4, "landing sections");
  assert(landing.quickLinks.length > 0, "quick links");
  assert(landing.governanceLinks.length >= 4, "governance links");
  assert(landing.releaseLinks.length >= 2, "release links");
  assert(landing.auditLinks.length >= 1, "audit links");
  assert(landing.evidenceLinks.length >= 1, "evidence links");

  for (const key of LANDING_KEYS) {
    assert(key in landing, `landing shape missing ${String(key)}`);
  }

  console.log("✓ portal landing");
  console.log(" ", landing.summary);
}

function testOpsOverviewApi() {
  const overview = buildEnterpriseOpsOverview({ deploymentId: "h13-overview-api" });
  assert(overview.version === PRODUCTION_ENTERPRISE_OPS_VERSION, "overview version");
  for (const key of OVERVIEW_API_KEYS) {
    assert(key in overview, `ops overview API missing ${String(key)}`);
  }
  assert(overview.manifest.readyForOps, "manifest ready");
  assert(overview.navigation.entries.length >= 10, "navigation linked");

  console.log("✓ ops overview API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/ops-overview overviewId=${overview.overviewId}`,
  );
}

function testOpsPageSurface() {
  const overview = buildEnterpriseOpsOverview({ deploymentId: "h13-ops-page" });
  assert(overview.landing.landingSections.length >= 4, "page sections");
  assert(overview.manifest.readyForGovernance, "governance status");
  assert(overview.manifest.readyForRelease, "release status");
  assert(overview.navigation.governanceEntries.some((e) => e.id === "governance-review"), "governance nav");
  assert(overview.navigation.auditEntries.some((e) => e.id === "audit-review"), "audit nav");

  console.log("✓ ops page surface");
  console.log(" ", `route=/dashboard/ops entries=${overview.navigation.entries.length}`);
}

function main() {
  testUnifiedNavigation();
  testEnterpriseOpsManifest();
  testPortalLanding();
  testOpsOverviewApi();
  testOpsPageSurface();
  console.log("\nAll enterprise ops portal checks passed.");
}

main();
