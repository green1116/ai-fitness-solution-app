/**
 * V3.7-H19 Production Rollout Documentation & Launch Checklist — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_ROLLOUT_FOUNDATION_VERSION,
  ROLLOUT_CHECKLIST_VERSION,
  LAUNCH_SUMMARY_VERSION,
  HANDOFF_MANIFEST_VERSION,
  ROLLOUT_VERSION,
  buildRolloutChecklistConfig,
  buildLaunchSummary,
  buildHandoffManifest,
  buildProductionRolloutFoundation,
  type ProductionRolloutFoundation,
  type RolloutChecklistConfig,
  type LaunchSummary,
  type HandoffManifest,
} from "../lib/commercialization/rollout/index";

const FOUNDATION_API_KEYS: (keyof ProductionRolloutFoundation)[] = [
  "version",
  "foundationId",
  "checklist",
  "launch",
  "handoff",
  "foundationSummary",
];

const CHECKLIST_KEYS: (keyof RolloutChecklistConfig)[] = [
  "version",
  "checklistId",
  "checklistItems",
  "checklistGroups",
  "owners",
  "statuses",
  "requiredChecks",
  "optionalChecks",
  "summary",
];

const LAUNCH_KEYS: (keyof LaunchSummary)[] = [
  "version",
  "summaryId",
  "deploymentReady",
  "rolloutReady",
  "onboardingReady",
  "governanceReady",
  "opsReady",
  "releaseReady",
  "confidenceScore",
  "summary",
];

const HANDOFF_KEYS: (keyof HandoffManifest)[] = [
  "version",
  "manifestId",
  "ROLLOUT_VERSION",
  "LANDING_VERSION",
  "COMMAND_CENTER_VERSION",
  "OPS_PORTAL_VERSION",
  "GOVERNANCE_VERSION",
  "RELEASE_LEDGER_VERSION",
  "readyForLaunch",
  "readyForHandoff",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRolloutChecklist() {
  const checklist = buildRolloutChecklistConfig({ deploymentId: "h19-checklist" });
  assert(checklist.version === ROLLOUT_CHECKLIST_VERSION, "checklist version");
  assert(checklist.checklistId.includes("RCL-V37H19"), "checklist id");
  assert(checklist.checklistItems.length >= 10, "checklist items");
  assert(checklist.checklistGroups.length >= 5, "checklist groups");
  assert(checklist.owners.length >= 5, "owners");
  assert(checklist.statuses.length >= 3, "statuses");
  assert(checklist.requiredChecks.length >= 8, "required checks");
  assert(checklist.optionalChecks.length >= 2, "optional checks");
  assert(checklist.checklistItems.some((c) => c.id === "chk-command-center"), "command center item");
  assert(checklist.checklistItems.some((c) => c.id === "chk-governance"), "governance item");
  assert(checklist.checklistItems.some((c) => c.id === "chk-rollout-readiness"), "rollout readiness item");

  for (const key of CHECKLIST_KEYS) {
    assert(key in checklist, `checklist shape missing ${String(key)}`);
  }

  console.log("✓ rollout checklist config");
  console.log(" ", checklist.summary);
}

function testLaunchSummary() {
  const launch = buildLaunchSummary({ deploymentId: "h19-launch" });
  assert(launch.version === LAUNCH_SUMMARY_VERSION, "launch version");
  assert(launch.summaryId.includes("LNS-V37H19"), "launch id");
  assert(typeof launch.deploymentReady === "boolean", "deploymentReady");
  assert(typeof launch.rolloutReady === "boolean", "rolloutReady");
  assert(typeof launch.onboardingReady === "boolean", "onboardingReady");
  assert(typeof launch.governanceReady === "boolean", "governanceReady");
  assert(typeof launch.opsReady === "boolean", "opsReady");
  assert(typeof launch.releaseReady === "boolean", "releaseReady");
  assert(launch.confidenceScore >= 0 && launch.confidenceScore <= 100, "confidence score");

  for (const key of LAUNCH_KEYS) {
    assert(key in launch, `launch summary missing ${String(key)}`);
  }

  console.log("✓ launch summary");
  console.log(" ", launch.summary);
}

function testHandoffManifest() {
  const handoff = buildHandoffManifest({ deploymentId: "h19-handoff" });
  assert(handoff.version === HANDOFF_MANIFEST_VERSION, "handoff version");
  assert(handoff.manifestId.includes("HFM-V37H19"), "handoff id");
  assert(handoff.ROLLOUT_VERSION === ROLLOUT_VERSION, "rollout version");
  assert(handoff.LANDING_VERSION.length > 0, "landing version");
  assert(handoff.COMMAND_CENTER_VERSION.length > 0, "command center version");
  assert(handoff.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(handoff.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(handoff.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(typeof handoff.readyForLaunch === "boolean", "readyForLaunch");
  assert(typeof handoff.readyForHandoff === "boolean", "readyForHandoff");
  assert(typeof handoff.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of HANDOFF_KEYS) {
    assert(key in handoff, `handoff manifest missing ${String(key)}`);
  }

  console.log("✓ handoff manifest");
  console.log(" ", handoff.summary);
}

function testRolloutApi() {
  const foundation = buildProductionRolloutFoundation({ deploymentId: "h19-api" });
  assert(foundation.version === PRODUCTION_ROLLOUT_FOUNDATION_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `rollout API missing ${String(key)}`);
  }
  assert(foundation.checklist.checklistItems.length >= 10, "foundation checklist");
  assert(foundation.launch.confidenceScore >= 0, "foundation confidence");

  console.log("✓ production rollout API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/rollout foundationId=${foundation.foundationId}`,
  );
}

function testRolloutPage() {
  const pagePath = join(process.cwd(), "app/dashboard/rollout/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildProductionRolloutFoundation"), "page uses rollout foundation");
  assert(content.includes("checklistGroups"), "page shows checklist groups");
  assert(content.includes("requiredChecks"), "page shows required checks");
  assert(content.includes("confidenceScore"), "page shows confidence score");
  assert(content.includes("readyForLaunch"), "page shows launch readiness");
  assert(content.includes("/api/commercialization/rollout"), "page links to API");

  const foundation = buildProductionRolloutFoundation({ deploymentId: "h19-page" });
  assert(foundation.handoff.readyForLaunch, "launch ready");
  assert(foundation.checklist.requiredChecks.every((c) => c.status === "complete"), "required complete");

  console.log("✓ rollout launch page");
  console.log(" ", `route=/dashboard/rollout items=${foundation.checklist.checklistItems.length}`);
}

function main() {
  testRolloutChecklist();
  testLaunchSummary();
  testHandoffManifest();
  testRolloutApi();
  testRolloutPage();
  console.log("\nAll production rollout checks passed.");
}

main();
