/**
 * V3.7-H20 Production Go-Live Control & Launch Freeze — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_GO_LIVE_FOUNDATION_VERSION,
  GO_LIVE_CHECKLIST_VERSION,
  LAUNCH_FREEZE_SUMMARY_VERSION,
  GO_LIVE_MANIFEST_VERSION,
  GO_LIVE_VERSION,
  buildGoLiveChecklistConfig,
  buildLaunchFreezeSummary,
  buildGoLiveManifest,
  buildProductionGoLiveFoundation,
  type ProductionGoLiveFoundation,
  type GoLiveChecklistConfig,
  type LaunchFreezeSummary,
  type GoLiveManifest,
} from "../lib/commercialization/go-live/index";

const FOUNDATION_API_KEYS: (keyof ProductionGoLiveFoundation)[] = [
  "version",
  "foundationId",
  "checklist",
  "freeze",
  "manifest",
  "foundationSummary",
];

const CHECKLIST_KEYS: (keyof GoLiveChecklistConfig)[] = [
  "version",
  "checklistId",
  "checklistItems",
  "checklistGroups",
  "requiredChecks",
  "optionalChecks",
  "approvalChecks",
  "rollbackChecks",
  "summary",
];

const FREEZE_KEYS: (keyof LaunchFreezeSummary)[] = [
  "version",
  "summaryId",
  "readyForGoLive",
  "launchFrozen",
  "approvalsReady",
  "rollbackReady",
  "opsReady",
  "governanceReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof GoLiveManifest)[] = [
  "version",
  "manifestId",
  "GO_LIVE_VERSION",
  "ROLLOUT_VERSION",
  "LANDING_VERSION",
  "COMMAND_CENTER_VERSION",
  "OPS_PORTAL_VERSION",
  "readyForGoLive",
  "readyForFreeze",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testGoLiveChecklist() {
  const checklist = buildGoLiveChecklistConfig({ deploymentId: "h20-checklist" });
  assert(checklist.version === GO_LIVE_CHECKLIST_VERSION, "checklist version");
  assert(checklist.checklistId.includes("GCL-V37H20"), "checklist id");
  assert(checklist.checklistItems.length >= 10, "checklist items");
  assert(checklist.checklistGroups.length >= 5, "checklist groups");
  assert(checklist.requiredChecks.length >= 5, "required checks");
  assert(checklist.optionalChecks.length >= 2, "optional checks");
  assert(checklist.approvalChecks.length >= 3, "approval checks");
  assert(checklist.rollbackChecks.length >= 2, "rollback checks");
  assert(checklist.checklistItems.some((c) => c.id === "gl-governance-approval"), "governance approval");
  assert(checklist.checklistItems.some((c) => c.id === "gl-rollback-plan"), "rollback plan");

  for (const key of CHECKLIST_KEYS) {
    assert(key in checklist, `checklist shape missing ${String(key)}`);
  }

  console.log("✓ go-live checklist config");
  console.log(" ", checklist.summary);
}

function testLaunchFreezeSummary() {
  const freeze = buildLaunchFreezeSummary({ deploymentId: "h20-freeze" });
  assert(freeze.version === LAUNCH_FREEZE_SUMMARY_VERSION, "freeze version");
  assert(freeze.summaryId.includes("LFS-V37H20"), "freeze id");
  assert(typeof freeze.readyForGoLive === "boolean", "readyForGoLive");
  assert(typeof freeze.launchFrozen === "boolean", "launchFrozen");
  assert(typeof freeze.approvalsReady === "boolean", "approvalsReady");
  assert(typeof freeze.rollbackReady === "boolean", "rollbackReady");
  assert(typeof freeze.opsReady === "boolean", "opsReady");
  assert(typeof freeze.governanceReady === "boolean", "governanceReady");
  assert(freeze.confidenceScore >= 0 && freeze.confidenceScore <= 100, "confidence score");

  for (const key of FREEZE_KEYS) {
    assert(key in freeze, `freeze summary missing ${String(key)}`);
  }

  console.log("✓ launch freeze summary");
  console.log(" ", freeze.summary);
}

function testGoLiveManifest() {
  const manifest = buildGoLiveManifest({ deploymentId: "h20-manifest" });
  assert(manifest.version === GO_LIVE_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("GLM-V37H20"), "manifest id");
  assert(manifest.GO_LIVE_VERSION === GO_LIVE_VERSION, "go-live version");
  assert(manifest.ROLLOUT_VERSION.length > 0, "rollout version");
  assert(manifest.LANDING_VERSION.length > 0, "landing version");
  assert(manifest.COMMAND_CENTER_VERSION.length > 0, "command center version");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(typeof manifest.readyForGoLive === "boolean", "readyForGoLive");
  assert(typeof manifest.readyForFreeze === "boolean", "readyForFreeze");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `go-live manifest missing ${String(key)}`);
  }

  console.log("✓ go-live manifest");
  console.log(" ", manifest.summary);
}

function testGoLiveApi() {
  const foundation = buildProductionGoLiveFoundation({ deploymentId: "h20-api" });
  assert(foundation.version === PRODUCTION_GO_LIVE_FOUNDATION_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `go-live API missing ${String(key)}`);
  }
  assert(foundation.checklist.checklistItems.length >= 10, "foundation checklist");
  assert(foundation.freeze.confidenceScore >= 0, "foundation confidence");

  console.log("✓ production go-live API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/go-live foundationId=${foundation.foundationId}`,
  );
}

function testGoLivePage() {
  const pagePath = join(process.cwd(), "app/dashboard/go-live/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildProductionGoLiveFoundation"), "page uses go-live foundation");
  assert(content.includes("checklistGroups"), "page shows checklist groups");
  assert(content.includes("approvalChecks"), "page shows approval checks");
  assert(content.includes("rollbackChecks"), "page shows rollback checks");
  assert(content.includes("launchFrozen"), "page shows launch frozen");
  assert(content.includes("readyForGoLive"), "page shows go-live readiness");
  assert(content.includes("/api/commercialization/go-live"), "page links to API");

  const foundation = buildProductionGoLiveFoundation({ deploymentId: "h20-page" });
  assert(foundation.manifest.readyForGoLive, "go-live ready");
  assert(foundation.checklist.requiredChecks.every((c) => c.status === "complete"), "required complete");

  console.log("✓ go-live page");
  console.log(" ", `route=/dashboard/go-live items=${foundation.checklist.checklistItems.length}`);
}

function main() {
  testGoLiveChecklist();
  testLaunchFreezeSummary();
  testGoLiveManifest();
  testGoLiveApi();
  testGoLivePage();
  console.log("\nAll production go-live checks passed.");
}

main();
