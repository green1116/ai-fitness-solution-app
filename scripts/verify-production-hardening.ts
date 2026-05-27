/**
 * V3.7-H1 Production Hardening Foundation — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  INCIDENT_CLASSES,
  INCIDENT_SEVERITY_ORDER,
  PRODUCTION_HARDENING_VERSION,
  RUNTIME_HEALTH_VERSION,
  RELEASE_READINESS_VERSION,
  DEPLOYMENT_CONFIDENCE_VERSION,
  OPERATIONAL_READINESS_VERSION,
  buildProductionHardeningFoundation,
  buildRuntimeHealthSnapshot,
  buildReleaseReadinessReport,
  buildDeploymentConfidenceReport,
  buildOperationalReadinessManifest,
  classifyIncident,
} from "../lib/commercialization/hardening";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testIncidentTaxonomy() {
  assert(INCIDENT_SEVERITY_ORDER.length === 5, "five severities");
  assert(INCIDENT_CLASSES.length === 5, "five incident classes");

  const incident = classifyIncident({
    severity: "degraded",
    domain: "runtime",
    detail: "partial verification drift",
  });
  assert(incident.code === "INC-DEGRADED", "degraded code");
  assert(incident.operationalImpact === "degrade", "degrade impact");

  console.log("✓ incident taxonomy");
}

function testRuntimeHealth() {
  const health = buildRuntimeHealthSnapshot({ deploymentId: "h1-health" });
  assert(health.version === RUNTIME_HEALTH_VERSION, "health version");
  assert(health.buildStatus === "healthy", "build healthy at freeze");
  assert(health.verificationStatus === "verified", "verification verified");
  assert(health.freezeIntegrity === "intact", "freeze intact");
  assert(health.orchestrationHealth === "healthy", "orchestration healthy");
  assert(health.executiveRuntimeHealth === "healthy", "executive healthy");

  console.log("✓ runtime health snapshot");
  console.log(" ", health.summary);
}

function testReleaseReadiness() {
  const report = buildReleaseReadinessReport({ deploymentId: "h1-release" });
  assert(report.version === RELEASE_READINESS_VERSION, "release version");
  assert(report.readinessScore >= 85, "readiness score");
  assert(report.releasable === true, "releasable at freeze");
  assert(report.blocked === false, "not blocked");
  assert(report.riskLevel === "low", "low risk");

  console.log("✓ release readiness report");
  console.log(" ", report.summary);
}

function testDeploymentConfidence() {
  const report = buildDeploymentConfidenceReport({ deploymentId: "h1-deploy" });
  assert(report.version === DEPLOYMENT_CONFIDENCE_VERSION, "deploy version");
  assert(report.deploymentReady === true, "deployment ready");
  assert(report.runtimeReady === true, "runtime ready");
  assert(report.verificationReady === true, "verification ready");
  assert(report.freezeReady === true, "freeze ready");
  assert(report.confidenceScore >= 80, "confidence score");

  console.log("✓ deployment confidence layer");
  console.log(" ", report.summary);
}

function testOperationalReadiness() {
  const manifest = buildOperationalReadinessManifest({ deploymentId: "h1-ops" });
  assert(manifest.version === OPERATIONAL_READINESS_VERSION, "ops version");
  assert(manifest.commercialReady === true, "commercial ready");
  assert(manifest.opsReady === true, "ops ready");
  assert(manifest.supportReady === true, "support ready");
  assert(manifest.deploymentReady === true, "deployment ready");
  assert(manifest.runtimeVerified === true, "runtime verified");

  console.log("✓ operational readiness manifest");
  console.log(" ", manifest.summary);
}

function testFoundationAggregate() {
  const foundation = buildProductionHardeningFoundation({ deploymentId: "h1-foundation" });
  assert(foundation.version === PRODUCTION_HARDENING_VERSION, "foundation version");
  assert(foundation.health.snapshotId.includes("RH-V37H1"), "health linked");
  assert(foundation.release.releasable, "release linked");
  assert(foundation.deployment.deploymentReady, "deployment linked");
  assert(foundation.operational.opsReady, "ops linked");
  assert(foundation.incidentTaxonomy.includes("fatal=INC-FATAL"), "taxonomy linked");
  assert(BUILD_FREEZE_MANIFEST.buildPassed, "freeze baseline");

  console.log("✓ production hardening foundation");
  console.log(" ", foundation.summary);
}

function main() {
  testIncidentTaxonomy();
  testRuntimeHealth();
  testReleaseReadiness();
  testDeploymentConfidence();
  testOperationalReadiness();
  testFoundationAggregate();
  console.log("\nAll production hardening checks passed.");
}

main();
