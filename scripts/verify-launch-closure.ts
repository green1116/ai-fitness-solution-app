/**
 * V3.7-H21 Production Launch Finalization & Enterprise Readiness Closure — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_LAUNCH_CLOSURE_VERSION,
  LAUNCH_CLOSURE_CHECKLIST_VERSION,
  READINESS_CLOSURE_SUMMARY_VERSION,
  LAUNCH_CLOSURE_MANIFEST_VERSION,
  LAUNCH_CLOSURE_VERSION,
  buildLaunchClosureChecklist,
  buildReadinessClosureSummary,
  buildLaunchClosureManifest,
  buildEnterpriseLaunchClosureFoundation,
  type EnterpriseLaunchClosureFoundation,
  type LaunchClosureChecklist,
  type ReadinessClosureSummary,
  type LaunchClosureManifest,
} from "../lib/commercialization/launch-closure/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseLaunchClosureFoundation)[] = [
  "version",
  "foundationId",
  "checklist",
  "closure",
  "manifest",
  "foundationSummary",
];

const CHECKLIST_KEYS: (keyof LaunchClosureChecklist)[] = [
  "version",
  "checklistId",
  "closureItems",
  "completionGroups",
  "requiredCompletions",
  "governanceCompletions",
  "opsCompletions",
  "rolloutCompletions",
  "summary",
];

const CLOSURE_KEYS: (keyof ReadinessClosureSummary)[] = [
  "version",
  "summaryId",
  "readyForClosure",
  "rolloutCompleted",
  "governanceCompleted",
  "opsCompleted",
  "auditCompleted",
  "releaseCompleted",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof LaunchClosureManifest)[] = [
  "version",
  "manifestId",
  "LAUNCH_CLOSURE_VERSION",
  "GO_LIVE_VERSION",
  "ROLLOUT_VERSION",
  "LANDING_VERSION",
  "COMMAND_CENTER_VERSION",
  "readyForClosure",
  "readyForArchive",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testLaunchClosureChecklist() {
  const checklist = buildLaunchClosureChecklist({ deploymentId: "h21-checklist" });
  assert(checklist.version === LAUNCH_CLOSURE_CHECKLIST_VERSION, "checklist version");
  assert(checklist.checklistId.includes("LCC-V37H21"), "checklist id");
  assert(checklist.closureItems.length >= 10, "closure items");
  assert(checklist.completionGroups.length >= 5, "completion groups");
  assert(checklist.requiredCompletions.length >= 8, "required completions");
  assert(checklist.governanceCompletions.length >= 3, "governance completions");
  assert(checklist.opsCompletions.length >= 2, "ops completions");
  assert(checklist.rolloutCompletions.length >= 3, "rollout completions");
  assert(checklist.closureItems.some((c) => c.id === "lc-go-live"), "go-live item");
  assert(checklist.closureItems.some((c) => c.id === "lc-governance"), "governance item");

  for (const key of CHECKLIST_KEYS) {
    assert(key in checklist, `checklist shape missing ${String(key)}`);
  }

  console.log("✓ launch closure checklist");
  console.log(" ", checklist.summary);
}

function testReadinessClosureSummary() {
  const closure = buildReadinessClosureSummary({ deploymentId: "h21-closure" });
  assert(closure.version === READINESS_CLOSURE_SUMMARY_VERSION, "closure version");
  assert(closure.summaryId.includes("RCS-V37H21"), "closure id");
  assert(typeof closure.readyForClosure === "boolean", "readyForClosure");
  assert(typeof closure.rolloutCompleted === "boolean", "rolloutCompleted");
  assert(typeof closure.governanceCompleted === "boolean", "governanceCompleted");
  assert(typeof closure.opsCompleted === "boolean", "opsCompleted");
  assert(typeof closure.auditCompleted === "boolean", "auditCompleted");
  assert(typeof closure.releaseCompleted === "boolean", "releaseCompleted");
  assert(closure.confidenceScore >= 0 && closure.confidenceScore <= 100, "confidence score");

  for (const key of CLOSURE_KEYS) {
    assert(key in closure, `closure summary missing ${String(key)}`);
  }

  console.log("✓ readiness closure summary");
  console.log(" ", closure.summary);
}

function testLaunchClosureManifest() {
  const manifest = buildLaunchClosureManifest({ deploymentId: "h21-manifest" });
  assert(manifest.version === LAUNCH_CLOSURE_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("LCM-V37H21"), "manifest id");
  assert(manifest.LAUNCH_CLOSURE_VERSION === LAUNCH_CLOSURE_VERSION, "launch closure version");
  assert(manifest.GO_LIVE_VERSION.length > 0, "go-live version");
  assert(manifest.ROLLOUT_VERSION.length > 0, "rollout version");
  assert(manifest.LANDING_VERSION.length > 0, "landing version");
  assert(manifest.COMMAND_CENTER_VERSION.length > 0, "command center version");
  assert(typeof manifest.readyForClosure === "boolean", "readyForClosure");
  assert(typeof manifest.readyForArchive === "boolean", "readyForArchive");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `launch closure manifest missing ${String(key)}`);
  }

  console.log("✓ launch closure manifest");
  console.log(" ", manifest.summary);
}

function testLaunchClosureApi() {
  const foundation = buildEnterpriseLaunchClosureFoundation({ deploymentId: "h21-api" });
  assert(foundation.version === PRODUCTION_LAUNCH_CLOSURE_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `launch closure API missing ${String(key)}`);
  }
  assert(foundation.checklist.closureItems.length >= 10, "foundation checklist");
  assert(foundation.closure.confidenceScore >= 0, "foundation confidence");

  console.log("✓ launch closure API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/launch-closure foundationId=${foundation.foundationId}`,
  );
}

function testLaunchClosurePage() {
  const pagePath = join(process.cwd(), "app/dashboard/launch-closure/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseLaunchClosureFoundation"), "page uses closure foundation");
  assert(content.includes("completionGroups"), "page shows completion groups");
  assert(content.includes("governanceCompletions"), "page shows governance completions");
  assert(content.includes("rolloutCompletions"), "page shows rollout completions");
  assert(content.includes("readyForClosure"), "page shows closure readiness");
  assert(content.includes("/api/commercialization/launch-closure"), "page links to API");

  const foundation = buildEnterpriseLaunchClosureFoundation({ deploymentId: "h21-page" });
  assert(foundation.manifest.readyForClosure, "closure ready");
  assert(foundation.checklist.requiredCompletions.every((c) => c.status === "complete"), "required complete");

  console.log("✓ launch closure page");
  console.log(" ", `route=/dashboard/launch-closure items=${foundation.checklist.closureItems.length}`);
}

function main() {
  testLaunchClosureChecklist();
  testReadinessClosureSummary();
  testLaunchClosureManifest();
  testLaunchClosureApi();
  testLaunchClosurePage();
  console.log("\nAll launch closure checks passed.");
}

main();
