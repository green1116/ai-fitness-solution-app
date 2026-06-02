/**
 * V3.7-H24 Production Lifecycle Finalization & Enterprise Continuity — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_LIFECYCLE_VERSION,
  LIFECYCLE_CONTINUITY_VERSION,
  LIFECYCLE_SUMMARY_VERSION,
  LIFECYCLE_MANIFEST_VERSION,
  LIFECYCLE_VERSION,
  buildLifecycleContinuityConfig,
  buildLifecycleCompletionSummary,
  buildLifecycleManifest,
  buildEnterpriseLifecycleFoundation,
  type EnterpriseLifecycleFoundation,
  type LifecycleContinuityConfig,
  type LifecycleCompletionSummary,
  type LifecycleManifest,
} from "../lib/commercialization/lifecycle/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseLifecycleFoundation)[] = [
  "version",
  "foundationId",
  "continuity",
  "completion",
  "manifest",
  "foundationSummary",
];

const CONTINUITY_KEYS: (keyof LifecycleContinuityConfig)[] = [
  "version",
  "configId",
  "lifecycleStages",
  "continuityStages",
  "governanceStages",
  "operationalStages",
  "archivalStages",
  "preservationStages",
  "summary",
];

const COMPLETION_KEYS: (keyof LifecycleCompletionSummary)[] = [
  "version",
  "summaryId",
  "lifecycleReady",
  "continuityReady",
  "governanceContinuityReady",
  "operationalContinuityReady",
  "archivalContinuityReady",
  "preservationContinuityReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof LifecycleManifest)[] = [
  "version",
  "manifestId",
  "LIFECYCLE_VERSION",
  "RETENTION_VERSION",
  "ARCHIVAL_VERSION",
  "LAUNCH_CLOSURE_VERSION",
  "GO_LIVE_VERSION",
  "readyForLifecycle",
  "readyForContinuity",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testLifecycleContinuity() {
  const config = buildLifecycleContinuityConfig({ deploymentId: "h24-continuity" });
  assert(config.version === LIFECYCLE_CONTINUITY_VERSION, "continuity version");
  assert(config.configId.includes("LCC-V37H24"), "config id");
  assert(config.lifecycleStages.length >= 6, "lifecycle stages");
  assert(config.continuityStages.length >= 3, "continuity stages");
  assert(config.governanceStages.length >= 3, "governance stages");
  assert(config.operationalStages.length >= 2, "operational stages");
  assert(config.archivalStages.length >= 10, "archival stages");
  assert(config.preservationStages.length >= 6, "preservation stages");
  assert(config.lifecycleStages.some((s) => s.id === "ls-retention"), "retention stage");

  for (const key of CONTINUITY_KEYS) {
    assert(key in config, `continuity shape missing ${String(key)}`);
  }

  console.log("✓ lifecycle continuity config");
  console.log(" ", config.summary);
}

function testLifecycleSummary() {
  const completion = buildLifecycleCompletionSummary({ deploymentId: "h24-summary" });
  assert(completion.version === LIFECYCLE_SUMMARY_VERSION, "summary version");
  assert(completion.summaryId.includes("LCS-V37H24"), "summary id");
  assert(typeof completion.lifecycleReady === "boolean", "lifecycleReady");
  assert(typeof completion.continuityReady === "boolean", "continuityReady");
  assert(typeof completion.governanceContinuityReady === "boolean", "governanceContinuityReady");
  assert(typeof completion.operationalContinuityReady === "boolean", "operationalContinuityReady");
  assert(typeof completion.archivalContinuityReady === "boolean", "archivalContinuityReady");
  assert(typeof completion.preservationContinuityReady === "boolean", "preservationContinuityReady");
  assert(completion.confidenceScore >= 0 && completion.confidenceScore <= 100, "confidence score");

  for (const key of COMPLETION_KEYS) {
    assert(key in completion, `completion summary missing ${String(key)}`);
  }

  console.log("✓ lifecycle completion summary");
  console.log(" ", completion.summary);
}

function testLifecycleManifest() {
  const manifest = buildLifecycleManifest({ deploymentId: "h24-manifest" });
  assert(manifest.version === LIFECYCLE_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("LCM-V37H24"), "manifest id");
  assert(manifest.LIFECYCLE_VERSION === LIFECYCLE_VERSION, "lifecycle version");
  assert(manifest.RETENTION_VERSION.length > 0, "retention version");
  assert(manifest.ARCHIVAL_VERSION.length > 0, "archival version");
  assert(manifest.LAUNCH_CLOSURE_VERSION.length > 0, "launch closure version");
  assert(manifest.GO_LIVE_VERSION.length > 0, "go-live version");
  assert(typeof manifest.readyForLifecycle === "boolean", "readyForLifecycle");
  assert(typeof manifest.readyForContinuity === "boolean", "readyForContinuity");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `lifecycle manifest missing ${String(key)}`);
  }

  console.log("✓ lifecycle manifest");
  console.log(" ", manifest.summary);
}

function testLifecycleApi() {
  const foundation = buildEnterpriseLifecycleFoundation({ deploymentId: "h24-api" });
  assert(foundation.version === PRODUCTION_LIFECYCLE_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `lifecycle API missing ${String(key)}`);
  }
  assert(foundation.continuity.lifecycleStages.length >= 6, "foundation lifecycle stages");
  assert(foundation.completion.confidenceScore >= 0, "foundation confidence");

  console.log("✓ enterprise lifecycle API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/lifecycle foundationId=${foundation.foundationId}`,
  );
}

function testLifecyclePage() {
  const pagePath = join(process.cwd(), "app/dashboard/lifecycle/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseLifecycleFoundation"), "page uses lifecycle foundation");
  assert(content.includes("lifecycleStages"), "page shows lifecycle stages");
  assert(content.includes("governanceStages"), "page shows governance stages");
  assert(content.includes("archivalStages"), "page shows archival stages");
  assert(content.includes("preservationStages"), "page shows preservation stages");
  assert(content.includes("lifecycleReady"), "page shows lifecycle ready");
  assert(content.includes("/api/commercialization/lifecycle"), "page links to API");

  const foundation = buildEnterpriseLifecycleFoundation({ deploymentId: "h24-page" });
  assert(foundation.manifest.readyForLifecycle, "lifecycle ready");
  assert(foundation.completion.lifecycleReady, "lifecycle completion ready");

  console.log("✓ lifecycle continuity page");
  console.log(" ", `route=/dashboard/lifecycle stages=${foundation.continuity.lifecycleStages.length}`);
}

function main() {
  testLifecycleContinuity();
  testLifecycleSummary();
  testLifecycleManifest();
  testLifecycleApi();
  testLifecyclePage();
  console.log("\nAll lifecycle checks passed.");
}

main();
