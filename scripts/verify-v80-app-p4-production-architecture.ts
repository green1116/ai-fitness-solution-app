/**
 * V80 APP P4 — Production Architecture Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  BILLING_FEATURE_GATING_MATRIX,
  DEPLOYMENT_ARCHITECTURE,
  MULTI_TENANT_RUNTIME,
  OBSERVABILITY_GOVERNANCE,
  V80_APP_PRODUCTION_VERSION,
  assertProductionArchitecturePass,
  buildProductionArchitecture,
  formatProductionArchitectureSummary,
  getBillingGatesByPlan,
  getDeploymentByTier,
  getObservabilityByKind,
  isBillingFeatureGatingComplete,
  isDeploymentArchitectureComplete,
  isMultiTenantRuntimeComplete,
  isObservabilityGovernanceComplete,
  runProductionArchitecture,
} from "../lib/app/v80/production.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-app-p4-production-architecture";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/app/v80/production.types.ts",
    "lib/app/v80/production.deployment.spec.ts",
    "lib/app/v80/production.tenant.spec.ts",
    "lib/app/v80/production.billing.spec.ts",
    "lib/app/v80/production.observability.spec.ts",
    "lib/app/v80/production.builder.ts",
    "lib/app/v80/production.entry.ts",
    "docs/V80-APP-P4-PRODUCTION-ARCHITECTURE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V80 APP production architecture module structure");
}

function testSpecs() {
  check(DEPLOYMENT_ARCHITECTURE.length === 6, "deployment components");
  check(MULTI_TENANT_RUNTIME.length === 6, "tenant layers");
  check(BILLING_FEATURE_GATING_MATRIX.length === 8, "billing gates");
  check(OBSERVABILITY_GOVERNANCE.length === 6, "observability specs");
  check(isDeploymentArchitectureComplete(), "deployment complete");
  check(isMultiTenantRuntimeComplete(), "tenant complete");
  check(isBillingFeatureGatingComplete(), "billing complete");
  check(isObservabilityGovernanceComplete(), "observability complete");

  check(getDeploymentByTier("worker").length >= 2, "pdf + workflow workers");
  check(getBillingGatesByPlan("ENTERPRISE").length >= 2, "enterprise gates");
  check(getObservabilityByKind("integrity").length >= 1, "integrity obs");

  console.log("✓ deployment, tenant, billing & observability specs");
}

function testReport() {
  const ready = buildProductionArchitecture({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_APP_PRODUCTION_VERSION, "production version");
  check(ready.blueprintReady, "P3 blueprint ready");
  check(ready.manifest.architectureComplete, "architecture complete");
  check(ready.architectureReady, "architecture ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertProductionArchitecturePass(ready);

  const run = runProductionArchitecture({ deploymentId: DEPLOYMENT_ID });
  check(run.architectureReady, "run ready");

  console.log("✓ production architecture report");
  console.log(formatProductionArchitectureSummary(ready));
  console.log("\n✅ V80 APP P4 Production Architecture — verify PASS");
}

function main() {
  console.log("V80 APP P4 Production Architecture Verification\n");
  checkModuleStructure();
  testSpecs();
  testReport();
}

main();
