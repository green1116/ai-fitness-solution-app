/**
 * V3.7-H25 Enterprise Preservation Closure — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_PRESERVATION_CLOSURE_VERSION,
  PRESERVATION_CLOSURE_CONFIG_VERSION,
  PRESERVATION_CLOSURE_SUMMARY_VERSION,
  PRESERVATION_CLOSURE_MANIFEST_VERSION,
  PRESERVATION_CLOSURE_VERSION,
  buildPreservationClosureConfig,
  buildPreservationClosureSummary,
  buildPreservationClosureManifest,
  buildEnterprisePreservationClosureFoundation,
  type EnterprisePreservationClosureFoundation,
  type PreservationClosureConfig,
  type PreservationClosureSummary,
  type PreservationClosureManifest,
} from "../lib/commercialization/preservation-closure/index";

const FOUNDATION_API_KEYS: (keyof EnterprisePreservationClosureFoundation)[] = [
  "version",
  "foundationId",
  "closure",
  "summary",
  "manifest",
  "foundationSummary",
];

const CONFIG_KEYS: (keyof PreservationClosureConfig)[] = [
  "version",
  "configId",
  "preservationStages",
  "closureStages",
  "governanceClosureStages",
  "operationalClosureStages",
  "archivalClosureStages",
  "lifecycleClosureStages",
  "summary",
];

const SUMMARY_KEYS: (keyof PreservationClosureSummary)[] = [
  "version",
  "summaryId",
  "preservationReady",
  "closureReady",
  "governanceClosureReady",
  "operationalClosureReady",
  "archivalClosureReady",
  "lifecycleClosureReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof PreservationClosureManifest)[] = [
  "version",
  "manifestId",
  "PRESERVATION_CLOSURE_VERSION",
  "LIFECYCLE_VERSION",
  "RETENTION_VERSION",
  "ARCHIVAL_VERSION",
  "LAUNCH_CLOSURE_VERSION",
  "readyForPreservationClosure",
  "readyForLifecycleClosure",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testPreservationClosureConfig() {
  const config = buildPreservationClosureConfig({ deploymentId: "h25-closure" });
  assert(config.version === PRESERVATION_CLOSURE_CONFIG_VERSION, "config version");
  assert(config.configId.includes("PCC-V37H25"), "config id");
  assert(config.preservationStages.length >= 3, "preservation stages");
  assert(config.closureStages.length >= 2, "closure stages");
  assert(config.governanceClosureStages.length >= 3, "governance closure stages");
  assert(config.operationalClosureStages.length >= 2, "operational closure stages");
  assert(config.archivalClosureStages.length >= 10, "archival closure stages");
  assert(config.lifecycleClosureStages.length >= 6, "lifecycle closure stages");
  assert(config.preservationStages.some((s) => s.id === "ps-lifecycle"), "lifecycle preservation");

  for (const key of CONFIG_KEYS) {
    assert(key in config, `closure config missing ${String(key)}`);
  }

  console.log("✓ preservation closure config");
  console.log(" ", config.summary);
}

function testPreservationClosureSummary() {
  const summary = buildPreservationClosureSummary({ deploymentId: "h25-summary" });
  assert(summary.version === PRESERVATION_CLOSURE_SUMMARY_VERSION, "summary version");
  assert(summary.summaryId.includes("PCS-V37H25"), "summary id");
  assert(typeof summary.preservationReady === "boolean", "preservationReady");
  assert(typeof summary.closureReady === "boolean", "closureReady");
  assert(typeof summary.governanceClosureReady === "boolean", "governanceClosureReady");
  assert(typeof summary.operationalClosureReady === "boolean", "operationalClosureReady");
  assert(typeof summary.archivalClosureReady === "boolean", "archivalClosureReady");
  assert(typeof summary.lifecycleClosureReady === "boolean", "lifecycleClosureReady");
  assert(summary.confidenceScore >= 0 && summary.confidenceScore <= 100, "confidence score");

  for (const key of SUMMARY_KEYS) {
    assert(key in summary, `closure summary missing ${String(key)}`);
  }

  console.log("✓ preservation closure summary");
  console.log(" ", summary.summary);
}

function testPreservationClosureManifest() {
  const manifest = buildPreservationClosureManifest({ deploymentId: "h25-manifest" });
  assert(manifest.version === PRESERVATION_CLOSURE_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("PCM-V37H25"), "manifest id");
  assert(manifest.PRESERVATION_CLOSURE_VERSION === PRESERVATION_CLOSURE_VERSION, "preservation closure version");
  assert(manifest.LIFECYCLE_VERSION.length > 0, "lifecycle version");
  assert(manifest.RETENTION_VERSION.length > 0, "retention version");
  assert(manifest.ARCHIVAL_VERSION.length > 0, "archival version");
  assert(manifest.LAUNCH_CLOSURE_VERSION.length > 0, "launch closure version");
  assert(typeof manifest.readyForPreservationClosure === "boolean", "readyForPreservationClosure");
  assert(typeof manifest.readyForLifecycleClosure === "boolean", "readyForLifecycleClosure");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `preservation manifest missing ${String(key)}`);
  }

  console.log("✓ preservation closure manifest");
  console.log(" ", manifest.summary);
}

function testPreservationClosureApi() {
  const foundation = buildEnterprisePreservationClosureFoundation({ deploymentId: "h25-api" });
  assert(foundation.version === PRODUCTION_PRESERVATION_CLOSURE_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `preservation closure API missing ${String(key)}`);
  }
  assert(foundation.closure.preservationStages.length >= 3, "foundation preservation stages");
  assert(foundation.summary.confidenceScore >= 0, "foundation confidence");

  console.log("✓ preservation closure API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/preservation-closure foundationId=${foundation.foundationId}`,
  );
}

function testPreservationClosurePage() {
  const pagePath = join(process.cwd(), "app/dashboard/preservation-closure/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterprisePreservationClosureFoundation"), "page uses closure foundation");
  assert(content.includes("preservationStages"), "page shows preservation stages");
  assert(content.includes("governanceClosureStages"), "page shows governance closure");
  assert(content.includes("archivalClosureStages"), "page shows archival closure");
  assert(content.includes("lifecycleClosureStages"), "page shows lifecycle closure");
  assert(content.includes("preservationReady"), "page shows preservation ready");
  assert(content.includes("/api/commercialization/preservation-closure"), "page links to API");

  const foundation = buildEnterprisePreservationClosureFoundation({ deploymentId: "h25-page" });
  assert(foundation.manifest.readyForPreservationClosure, "preservation closure ready");
  assert(foundation.summary.lifecycleClosureReady, "lifecycle closure ready");

  console.log("✓ preservation closure page");
  console.log(
    " ",
    `route=/dashboard/preservation-closure stages=${foundation.closure.preservationStages.length}`,
  );
}

function main() {
  testPreservationClosureConfig();
  testPreservationClosureSummary();
  testPreservationClosureManifest();
  testPreservationClosureApi();
  testPreservationClosurePage();
  console.log("\nAll preservation closure checks passed.");
}

main();
