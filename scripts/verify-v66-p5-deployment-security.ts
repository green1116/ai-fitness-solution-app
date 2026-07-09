/**
 * V66 P5 — Deployment Security & Compliance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ARTIFACT_INTEGRITY_INVENTORY,
  SECURITY_GATE_COUNT,
  SECURITY_POLICY_CATALOG,
  V66_DEPLOYMENT_SECURITY_VERSION,
  V66_SECURITY_ARTIFACT_SURFACE,
  assertDeploymentSecurityPass,
  buildArtifactIntegrityManifest,
  buildComplianceChecklistManifest,
  buildDeploymentSecurityReport,
  buildSecurityGateManifest,
  buildSecurityPolicyManifest,
  formatDeploymentSecuritySummary,
  runDeploymentSecurity,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p5-deployment-security";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/security.ts",
    "lib/deployment/v66/security.types.ts",
    "lib/deployment/v66/security.artifacts.ts",
    "lib/deployment/v66/security.policy.catalog.ts",
    "lib/deployment/v66/compliance.checklist.ts",
    "lib/deployment/v66/security.gates.ts",
    "lib/deployment/v66/artifact.integrity.inventory.ts",
    "lib/deployment/v66/security.builder.ts",
    "lib/deployment/v66/security.entry.ts",
    "docs/deployment/V66-DEPLOYMENT-SECURITY.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 deployment security module structure");
}

function testInventories() {
  assert(SECURITY_POLICY_CATALOG.length >= 10, "security policy catalog");
  assert(SECURITY_GATE_COUNT >= 6, "security gates");
  assert(ARTIFACT_INTEGRITY_INVENTORY.length >= 8, "artifact integrity inventory");
  console.log("✓ security policy, gates & artifact inventories");
}

function testArtifactPresence() {
  const presenceEntries = ARTIFACT_INTEGRITY_INVENTORY.filter(
    (e) => e.integrityCheck === "presence",
  );
  for (const entry of presenceEntries) {
    assert(fs.existsSync(path.join(ROOT, entry.path)), `missing artifact: ${entry.path}`);
  }
  console.log("✓ artifact integrity presence checks");
}

function testManifests() {
  const policies = buildSecurityPolicyManifest();
  assert(policies.catalogComplete, "policy catalog complete");

  const integrity = buildArtifactIntegrityManifest();
  assert(integrity.integrityComplete, "artifact integrity complete");

  const signals = {
    orchestrationReady: true,
    policyCatalogComplete: true,
    complianceChecklistPass: true,
    securityGatesPass: true,
    artifactIntegrityComplete: true,
  };
  const compliance = buildComplianceChecklistManifest(signals);
  assert(compliance.checklistPass, "compliance checklist pass");

  const gates = buildSecurityGateManifest(signals);
  assert(gates.gatesPass, "security gates pass");
  console.log("✓ security policy, compliance & gate manifests");
}

function testReport() {
  const incomplete = runDeploymentSecurity({
    deploymentId: DEPLOYMENT_ID,
    signals: { policyCatalogComplete: false },
  });
  assert(!incomplete.securityReady, "incomplete policy not ready");

  const ready = buildDeploymentSecurityReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_DEPLOYMENT_SECURITY_VERSION, "security version");
  assert(ready.orchestrationReady, "orchestration ready");
  assert(ready.securityPolicies.catalogComplete, "policies complete");
  assert(ready.complianceChecklist.checklistPass, "compliance pass");
  assert(ready.securityGates.gatesPass, "gates pass");
  assert(ready.artifactIntegrity.integrityComplete, "integrity complete");
  assert(ready.securityReady, "security ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertDeploymentSecurityPass(ready);

  assert(
    V66_SECURITY_ARTIFACT_SURFACE.verifySecurity.includes("verify:v66-p5"),
    "artifact surface verify script",
  );

  console.log("✓ deployment security report");
  console.log(formatDeploymentSecuritySummary(ready));
  console.log("\n✅ V66 P5 Deployment Security & Compliance — verify PASS");
}

function main() {
  console.log("V66 P5 Deployment Security & Compliance Verification\n");
  checkModuleStructure();
  testInventories();
  testArtifactPresence();
  testManifests();
  testReport();
}

main();
