/**
 * V3.7-H17 Enterprise Landing & SaaS Deployment Readiness — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_ENTERPRISE_LANDING_VERSION,
  LANDING_CARDS_VERSION,
  SAAS_READINESS_VERSION,
  LANDING_MANIFEST_VERSION,
  LANDING_VERSION,
  getLandingCardsConfig,
  buildSaasReadinessSummary,
  buildLandingManifest,
  buildEnterpriseLandingFoundation,
  type EnterpriseLandingFoundation,
  type LandingCardsConfig,
  type SaasReadinessSummary,
  type LandingManifest,
} from "../lib/commercialization/landing/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseLandingFoundation)[] = [
  "version",
  "foundationId",
  "cards",
  "readiness",
  "manifest",
  "foundationSummary",
];

const READINESS_KEYS: (keyof SaasReadinessSummary)[] = [
  "version",
  "readinessId",
  "deploymentReady",
  "governanceReady",
  "releaseReady",
  "opsReady",
  "auditReady",
  "observabilityReady",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof LandingManifest)[] = [
  "version",
  "manifestId",
  "LANDING_VERSION",
  "COMMAND_CENTER_VERSION",
  "OPS_PORTAL_VERSION",
  "GOVERNANCE_VERSION",
  "RELEASE_LEDGER_VERSION",
  "readyForLanding",
  "readyForDeployment",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testLandingCards() {
  const config = getLandingCardsConfig();
  assert(config.version === LANDING_CARDS_VERSION, "cards version");
  assert(config.cards.length >= 10, "cards count");
  assert(config.categories.length >= 6, "categories");
  assert(config.quickActions.length >= 8, "quick actions");
  assert(config.readinessCards.length >= 6, "readiness cards");
  assert(config.governanceCards.length >= 2, "governance cards");
  assert(config.releaseCards.length >= 2, "release cards");
  assert(config.auditCards.length >= 1, "audit cards");

  const requiredIds = [
    "command-center",
    "enterprise-ops",
    "governance-review",
    "release-ledger",
    "audit-review",
    "evidence-export",
    "access-control",
    "observability-ops",
  ];
  for (const id of requiredIds) {
    assert(config.cards.some((c) => c.id === id), `missing card ${id}`);
  }

  console.log("✓ landing cards config");
  console.log(" ", `cards=${config.cards.length} quickActions=${config.quickActions.length}`);
}

function testSaasReadiness() {
  const readiness = buildSaasReadinessSummary({ deploymentId: "h17-readiness" });
  assert(readiness.version === SAAS_READINESS_VERSION, "readiness version");
  assert(readiness.readinessId.includes("SAR-V37H17"), "readiness id");
  assert(typeof readiness.deploymentReady === "boolean", "deploymentReady");
  assert(typeof readiness.governanceReady === "boolean", "governanceReady");
  assert(typeof readiness.releaseReady === "boolean", "releaseReady");
  assert(typeof readiness.opsReady === "boolean", "opsReady");
  assert(typeof readiness.auditReady === "boolean", "auditReady");
  assert(typeof readiness.observabilityReady === "boolean", "observabilityReady");
  assert(readiness.confidenceScore >= 0 && readiness.confidenceScore <= 100, "confidence score");

  for (const key of READINESS_KEYS) {
    assert(key in readiness, `readiness shape missing ${String(key)}`);
  }

  console.log("✓ SaaS readiness summary");
  console.log(" ", readiness.summary);
}

function testLandingManifest() {
  const manifest = buildLandingManifest({ deploymentId: "h17-manifest" });
  assert(manifest.version === LANDING_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("ELM-V37H17"), "manifest id");
  assert(manifest.LANDING_VERSION === LANDING_VERSION, "landing version");
  assert(manifest.COMMAND_CENTER_VERSION.length > 0, "command center version");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.GOVERNANCE_VERSION.length > 0, "governance version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(typeof manifest.readyForLanding === "boolean", "readyForLanding");
  assert(typeof manifest.readyForDeployment === "boolean", "readyForDeployment");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `manifest shape missing ${String(key)}`);
  }

  console.log("✓ landing manifest");
  console.log(" ", manifest.summary);
}

function testLandingApi() {
  const foundation = buildEnterpriseLandingFoundation({ deploymentId: "h17-api" });
  assert(foundation.version === PRODUCTION_ENTERPRISE_LANDING_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `landing API missing ${String(key)}`);
  }
  assert(foundation.cards.cards.length >= 10, "foundation cards");
  assert(foundation.readiness.confidenceScore >= 0, "foundation readiness");

  console.log("✓ enterprise landing API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/enterprise-landing foundationId=${foundation.foundationId}`,
  );
}

function testLandingPage() {
  const pagePath = join(process.cwd(), "app/dashboard/enterprise-landing/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseLandingFoundation"), "page uses landing foundation");
  assert(content.includes("quickActions"), "page shows quick actions");
  assert(content.includes("readinessCards"), "page shows readiness cards");
  assert(content.includes("governanceCards"), "page shows governance cards");
  assert(content.includes("releaseCards"), "page shows release cards");
  assert(content.includes("auditCards"), "page shows audit cards");
  assert(content.includes("confidenceScore"), "page shows confidence score");
  assert(content.includes("/api/commercialization/enterprise-landing"), "page links to API");

  const foundation = buildEnterpriseLandingFoundation({ deploymentId: "h17-page" });
  assert(foundation.manifest.readyForLanding, "landing ready");
  assert(foundation.cards.quickActions.some((a) => a.href === "/dashboard/command-center"), "cc quick action");

  console.log("✓ enterprise landing page");
  console.log(" ", `route=/dashboard/enterprise-landing cards=${foundation.cards.cards.length}`);
}

function main() {
  testLandingCards();
  testSaasReadiness();
  testLandingManifest();
  testLandingApi();
  testLandingPage();
  console.log("\nAll enterprise landing checks passed.");
}

main();
