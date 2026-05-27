/**
 * V3.7-H18 Enterprise Deployment Readiness & Rollout — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_ENTERPRISE_ROLLOUT_VERSION,
  DEPLOYMENT_READINESS_VERSION,
  ROLLOUT_SUMMARY_VERSION,
  ROLLOUT_MANIFEST_VERSION,
  ROLLOUT_VERSION,
  buildDeploymentReadinessConfig,
  buildRolloutReadinessSummary,
  buildRolloutManifest,
  buildEnterpriseRolloutFoundation,
  type EnterpriseRolloutFoundation,
  type DeploymentReadinessConfig,
  type RolloutReadinessSummary,
  type RolloutManifest,
} from "../lib/commercialization/deployment-readiness/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseRolloutFoundation)[] = [
  "version",
  "foundationId",
  "readiness",
  "summary",
  "manifest",
  "foundationSummary",
];

const CONFIG_KEYS: (keyof DeploymentReadinessConfig)[] = [
  "version",
  "configId",
  "deploymentChecks",
  "rolloutChecks",
  "onboardingChecks",
  "governanceChecks",
  "operationalChecks",
  "releaseChecks",
  "summary",
];

const SUMMARY_KEYS: (keyof RolloutReadinessSummary)[] = [
  "version",
  "summaryId",
  "deploymentReady",
  "rolloutReady",
  "onboardingReady",
  "governanceReady",
  "operationalReady",
  "releaseReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof RolloutManifest)[] = [
  "version",
  "manifestId",
  "ROLLOUT_VERSION",
  "COMMAND_CENTER_VERSION",
  "LANDING_VERSION",
  "OPS_PORTAL_VERSION",
  "GOVERNANCE_VERSION",
  "RELEASE_LEDGER_VERSION",
  "readyForDeployment",
  "readyForRollout",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testDeploymentReadiness() {
  const config = buildDeploymentReadinessConfig({ deploymentId: "h18-readiness" });
  assert(config.version === DEPLOYMENT_READINESS_VERSION, "readiness version");
  assert(config.configId.includes("DRC-V37H18"), "config id");
  assert(config.deploymentChecks.length >= 5, "deployment checks");
  assert(config.rolloutChecks.length >= 5, "rollout checks");
  assert(config.onboardingChecks.length >= 4, "onboarding checks");
  assert(config.governanceChecks.length >= 3, "governance checks");
  assert(config.operationalChecks.length >= 3, "operational checks");
  assert(config.releaseChecks.length >= 3, "release checks");

  for (const key of CONFIG_KEYS) {
    assert(key in config, `readiness config missing ${String(key)}`);
  }

  console.log("✓ deployment readiness config");
  console.log(" ", config.summary);
}

function testRolloutSummary() {
  const summary = buildRolloutReadinessSummary({ deploymentId: "h18-summary" });
  assert(summary.version === ROLLOUT_SUMMARY_VERSION, "summary version");
  assert(summary.summaryId.includes("RRS-V37H18"), "summary id");
  assert(typeof summary.deploymentReady === "boolean", "deploymentReady");
  assert(typeof summary.rolloutReady === "boolean", "rolloutReady");
  assert(typeof summary.onboardingReady === "boolean", "onboardingReady");
  assert(typeof summary.governanceReady === "boolean", "governanceReady");
  assert(typeof summary.operationalReady === "boolean", "operationalReady");
  assert(typeof summary.releaseReady === "boolean", "releaseReady");
  assert(summary.confidenceScore >= 0 && summary.confidenceScore <= 100, "confidence score");

  for (const key of SUMMARY_KEYS) {
    assert(key in summary, `rollout summary missing ${String(key)}`);
  }

  console.log("✓ rollout readiness summary");
  console.log(" ", summary.summary);
}

function testRolloutManifest() {
  const manifest = buildRolloutManifest({ deploymentId: "h18-manifest" });
  assert(manifest.version === ROLLOUT_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("ERM-V37H18"), "manifest id");
  assert(manifest.ROLLOUT_VERSION === ROLLOUT_VERSION, "rollout version");
  assert(manifest.COMMAND_CENTER_VERSION.length > 0, "command center version");
  assert(manifest.LANDING_VERSION.length > 0, "landing version");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(typeof manifest.readyForDeployment === "boolean", "readyForDeployment");
  assert(typeof manifest.readyForRollout === "boolean", "readyForRollout");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `rollout manifest missing ${String(key)}`);
  }

  console.log("✓ rollout manifest");
  console.log(" ", manifest.summary);
}

function testRolloutApi() {
  const foundation = buildEnterpriseRolloutFoundation({ deploymentId: "h18-api" });
  assert(foundation.version === PRODUCTION_ENTERPRISE_ROLLOUT_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `rollout API missing ${String(key)}`);
  }
  assert(foundation.readiness.deploymentChecks.length >= 5, "foundation deployment checks");
  assert(foundation.summary.confidenceScore >= 0, "foundation confidence");

  console.log("✓ rollout readiness API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/rollout-readiness foundationId=${foundation.foundationId}`,
  );
}

function testRolloutPage() {
  const pagePath = join(process.cwd(), "app/dashboard/rollout-readiness/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseRolloutFoundation"), "page uses rollout foundation");
  assert(content.includes("deploymentChecks"), "page shows deployment checks");
  assert(content.includes("rolloutChecks"), "page shows rollout checks");
  assert(content.includes("onboardingChecks"), "page shows onboarding checks");
  assert(content.includes("governanceChecks"), "page shows governance checks");
  assert(content.includes("operationalChecks"), "page shows operational checks");
  assert(content.includes("confidenceScore"), "page shows confidence score");
  assert(content.includes("/api/commercialization/rollout-readiness"), "page links to API");

  const foundation = buildEnterpriseRolloutFoundation({ deploymentId: "h18-page" });
  assert(foundation.manifest.readyForRollout, "rollout ready");
  assert(foundation.summary.deploymentReady, "deployment ready");

  console.log("✓ rollout readiness page");
  console.log(" ", `route=/dashboard/rollout-readiness confidence=${foundation.summary.confidenceScore}`);
}

function main() {
  testDeploymentReadiness();
  testRolloutSummary();
  testRolloutManifest();
  testRolloutApi();
  testRolloutPage();
  console.log("\nAll rollout readiness checks passed.");
}

main();
