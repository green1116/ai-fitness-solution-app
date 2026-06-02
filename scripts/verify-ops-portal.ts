/**
 * V3.7-H8 Ops Portal Navigation & Access Control — smoke verification
 */
import {
  PRODUCTION_OPS_PORTAL_VERSION,
  OPS_PORTAL_CONFIG_VERSION,
  OPS_PORTAL_CONFIG,
  OPS_PORTAL_ACCESS_GROUPS,
  OPS_PORTAL_MANIFEST_VERSION,
  OPS_NAVIGATION_VERSION,
  LEDGER_ACCESS_POLICY_VERSION,
  buildProductionOpsPortalFoundation,
  buildOpsPortalManifest,
  buildLedgerAccessPolicy,
  buildOpsNavigation,
  buildOpsNavigationSummary,
  type OpsNavigation,
  type LedgerAccessPolicy,
} from "../lib/commercialization/ops";

const NAVIGATION_KEYS: (keyof OpsNavigation)[] = [
  "version",
  "navigationId",
  "defaultLanding",
  "readyForOps",
  "sections",
  "entries",
  "summary",
];

const POLICY_KEYS: (keyof LedgerAccessPolicy)[] = [
  "version",
  "policyId",
  "canViewReleaseLedger",
  "canViewEvidenceExport",
  "canViewAuditReview",
  "canViewDashboard",
  "canViewObservability",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOpsPortalConfig() {
  const config = OPS_PORTAL_CONFIG;
  assert(config.portalVersion === OPS_PORTAL_CONFIG_VERSION, "config version");
  assert(config.defaultLanding === "/dashboard/release-ledger", "default landing");
  assert(config.sections.length >= 4, "sections");
  assert(config.badges.length >= 3, "badges");
  assert(config.accessGroups.length === OPS_PORTAL_ACCESS_GROUPS.length, "access groups");
  assert(config.sections.some((s) => s.id === "release"), "release section");
  assert(config.sections.some((s) => s.id === "audit"), "audit section");
  assert(config.sections.some((s) => s.id === "evidence"), "evidence section");

  const entryIds = config.sections.flatMap((s) => s.entries.map((e) => e.id));
  assert(entryIds.includes("release-ledger"), "release ledger entry");
  assert(entryIds.includes("audit-review"), "audit review entry");
  assert(entryIds.includes("evidence-export"), "evidence export entry");

  console.log("✓ ops portal config");
  console.log(" ", `sections=${config.sections.length} landing=${config.defaultLanding}`);
}

function testOpsPortalManifest() {
  const manifest = buildOpsPortalManifest({ deploymentId: "h8-manifest" });
  assert(manifest.version === OPS_PORTAL_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("OPS-V37H8"), "manifest id");
  assert(manifest.buildStatus === "pass", "build pass");
  assert(manifest.tscStatus === "pass", "tsc pass");
  assert(manifest.verificationStatus === "pass", "verification pass");
  assert(manifest.hardeningStatus === "pass", "hardening pass");
  assert(manifest.observabilityStatus === "pass", "observability pass");
  assert(manifest.dashboardStatus === "pass", "dashboard pass");
  assert(manifest.auditStatus === "pass", "audit pass");
  assert(manifest.releaseLedgerStatus === "pass", "release ledger pass");
  assert(manifest.evidenceExportStatus === "pass", "evidence export pass");
  assert(manifest.readyForOps === true, "ready for ops");

  console.log("✓ ops portal manifest");
  console.log(" ", manifest.summary);
}

function testNavigationSummary() {
  const navigation = buildOpsNavigation({ deploymentId: "h8-nav" });
  assert(navigation.version === OPS_NAVIGATION_VERSION, "navigation version");
  assert(navigation.navigationId.includes("NAV-V37H8"), "navigation id");
  assert(navigation.defaultLanding.length > 0, "default landing");
  assert(navigation.sections.length >= 4, "navigation sections");
  assert(navigation.entries.length >= 5, "navigation entries");
  assert(navigation.readyForOps, "ready for ops");

  for (const key of NAVIGATION_KEYS) {
    assert(key in navigation, `navigation shape missing ${key}`);
  }

  const summary = buildOpsNavigationSummary({ deploymentId: "h8-nav" });
  assert(summary.includes("ops-navigation"), "navigation summary");

  console.log("✓ navigation summary");
  console.log(" ", summary);
}

function testAccessPolicy() {
  const policy = buildLedgerAccessPolicy({ deploymentId: "h8-policy" });
  assert(policy.version === LEDGER_ACCESS_POLICY_VERSION, "policy version");
  assert(policy.policyId.includes("POL-V37H8"), "policy id");
  assert(policy.canViewReleaseLedger === true, "can view release ledger");
  assert(policy.canViewEvidenceExport === true, "can view evidence export");
  assert(policy.canViewAuditReview === true, "can view audit review");
  assert(policy.canViewDashboard === true, "can view dashboard");
  assert(policy.canViewObservability === true, "can view observability");

  for (const key of POLICY_KEYS) {
    assert(key in policy, `policy shape missing ${key}`);
  }

  console.log("✓ access policy");
  console.log(" ", policy.summary);
}

function testReadonlySurfaceShape() {
  const foundation = buildProductionOpsPortalFoundation({ deploymentId: "h8-foundation" });
  assert(foundation.version === PRODUCTION_OPS_PORTAL_VERSION, "foundation version");
  assert(foundation.foundationId.includes("POP-V37H8"), "foundation id");
  assert(foundation.manifest.readyForOps, "manifest ready");
  assert(foundation.accessPolicy.canViewReleaseLedger, "ledger access");
  assert(foundation.navigation.entries.some((e) => e.id === "release-ledger" && e.accessible), "ledger nav accessible");
  assert(foundation.navigation.entries.some((e) => e.id === "evidence-export" && e.accessible), "evidence nav accessible");
  assert(foundation.navigation.entries.some((e) => e.id === "audit-review" && e.accessible), "audit nav accessible");

  console.log("✓ readonly surface shape");
  console.log(" ", foundation.summary);
}

function main() {
  testOpsPortalConfig();
  testOpsPortalManifest();
  testNavigationSummary();
  testAccessPolicy();
  testReadonlySurfaceShape();
  console.log("\nAll ops portal checks passed.");
}

main();
