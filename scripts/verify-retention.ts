/**
 * V3.7-H23 Production Archive Access & Retention Review — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_RETENTION_VERSION,
  RETENTION_POLICY_VERSION,
  ARCHIVE_ACCESS_SUMMARY_VERSION,
  RETENTION_MANIFEST_VERSION,
  RETENTION_VERSION,
  buildRetentionPolicyConfig,
  buildArchiveAccessSummary,
  buildRetentionManifest,
  buildEnterpriseRetentionFoundation,
  type EnterpriseRetentionFoundation,
  type RetentionPolicyConfig,
  type ArchiveAccessSummary,
  type RetentionManifest,
} from "../lib/commercialization/retention/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseRetentionFoundation)[] = [
  "version",
  "foundationId",
  "policies",
  "access",
  "manifest",
  "foundationSummary",
];

const POLICY_KEYS: (keyof RetentionPolicyConfig)[] = [
  "version",
  "policyId",
  "retentionPolicies",
  "lifecyclePolicies",
  "governancePolicies",
  "archivalPolicies",
  "readonlyPolicies",
  "reviewPolicies",
  "summary",
];

const ACCESS_KEYS: (keyof ArchiveAccessSummary)[] = [
  "version",
  "summaryId",
  "archiveAccessible",
  "retentionReady",
  "governanceRetentionReady",
  "auditRetentionReady",
  "preservationReady",
  "lifecycleReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof RetentionManifest)[] = [
  "version",
  "manifestId",
  "RETENTION_VERSION",
  "ARCHIVAL_VERSION",
  "LAUNCH_CLOSURE_VERSION",
  "GO_LIVE_VERSION",
  "ROLLOUT_VERSION",
  "readyForRetention",
  "readyForLifecycle",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRetentionPolicy() {
  const policies = buildRetentionPolicyConfig({ deploymentId: "h23-policy" });
  assert(policies.version === RETENTION_POLICY_VERSION, "policy version");
  assert(policies.policyId.includes("RTP-V37H23"), "policy id");
  assert(policies.retentionPolicies.length >= 3, "retention policies");
  assert(policies.lifecyclePolicies.length >= 3, "lifecycle policies");
  assert(policies.governancePolicies.length >= 3, "governance policies");
  assert(policies.archivalPolicies.length >= 10, "archival policies");
  assert(policies.readonlyPolicies.length >= 3, "readonly policies");
  assert(policies.reviewPolicies.length >= 3, "review policies");
  assert(policies.readonlyPolicies.every((p) => p.readonly), "all readonly policies");

  for (const key of POLICY_KEYS) {
    assert(key in policies, `policy shape missing ${String(key)}`);
  }

  console.log("✓ retention policy config");
  console.log(" ", policies.summary);
}

function testArchiveAccessSummary() {
  const access = buildArchiveAccessSummary({ deploymentId: "h23-access" });
  assert(access.version === ARCHIVE_ACCESS_SUMMARY_VERSION, "access version");
  assert(access.summaryId.includes("AAS-V37H23"), "access id");
  assert(typeof access.archiveAccessible === "boolean", "archiveAccessible");
  assert(typeof access.retentionReady === "boolean", "retentionReady");
  assert(typeof access.governanceRetentionReady === "boolean", "governanceRetentionReady");
  assert(typeof access.auditRetentionReady === "boolean", "auditRetentionReady");
  assert(typeof access.preservationReady === "boolean", "preservationReady");
  assert(typeof access.lifecycleReady === "boolean", "lifecycleReady");
  assert(access.confidenceScore >= 0 && access.confidenceScore <= 100, "confidence score");

  for (const key of ACCESS_KEYS) {
    assert(key in access, `access summary missing ${String(key)}`);
  }

  console.log("✓ archive access summary");
  console.log(" ", access.summary);
}

function testRetentionManifest() {
  const manifest = buildRetentionManifest({ deploymentId: "h23-manifest" });
  assert(manifest.version === RETENTION_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("RTM-V37H23"), "manifest id");
  assert(manifest.RETENTION_VERSION === RETENTION_VERSION, "retention version");
  assert(manifest.ARCHIVAL_VERSION.length > 0, "archival version");
  assert(manifest.LAUNCH_CLOSURE_VERSION.length > 0, "launch closure version");
  assert(manifest.GO_LIVE_VERSION.length > 0, "go-live version");
  assert(manifest.ROLLOUT_VERSION.length > 0, "rollout version");
  assert(typeof manifest.readyForRetention === "boolean", "readyForRetention");
  assert(typeof manifest.readyForLifecycle === "boolean", "readyForLifecycle");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `retention manifest missing ${String(key)}`);
  }

  console.log("✓ retention manifest");
  console.log(" ", manifest.summary);
}

function testArchiveAccessApi() {
  const foundation = buildEnterpriseRetentionFoundation({ deploymentId: "h23-api" });
  assert(foundation.version === PRODUCTION_RETENTION_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `retention API missing ${String(key)}`);
  }
  assert(foundation.policies.retentionPolicies.length >= 3, "foundation policies");
  assert(foundation.access.confidenceScore >= 0, "foundation confidence");

  console.log("✓ archive access API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/archive-access foundationId=${foundation.foundationId}`,
  );
}

function testArchiveAccessPage() {
  const pagePath = join(process.cwd(), "app/dashboard/archive-access/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseRetentionFoundation"), "page uses retention foundation");
  assert(content.includes("retentionPolicies"), "page shows retention policies");
  assert(content.includes("lifecyclePolicies"), "page shows lifecycle policies");
  assert(content.includes("governancePolicies"), "page shows governance policies");
  assert(content.includes("reviewPolicies"), "page shows review policies");
  assert(content.includes("archiveAccessible"), "page shows archive accessible");
  assert(content.includes("/api/commercialization/archive-access"), "page links to API");

  const foundation = buildEnterpriseRetentionFoundation({ deploymentId: "h23-page" });
  assert(foundation.manifest.readyForRetention, "retention ready");
  assert(foundation.access.archiveAccessible, "archive accessible");

  console.log("✓ archive access page");
  console.log(" ", `route=/dashboard/archive-access policies=${foundation.policies.retentionPolicies.length}`);
}

function main() {
  testRetentionPolicy();
  testArchiveAccessSummary();
  testRetentionManifest();
  testArchiveAccessApi();
  testArchiveAccessPage();
  console.log("\nAll retention checks passed.");
}

main();
