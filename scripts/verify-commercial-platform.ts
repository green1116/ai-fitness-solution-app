/**
 * V18 Commercial Platform Freeze — verification
 */
import {
  COMMERCIAL_FREEZE_TAG,
  COMMERCIAL_LAYER_ORDER,
  COMMERCIAL_MODULE_REGISTRY,
  COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION,
  COMMERCIAL_PLATFORM_FREEZE_VERSION,
  buildCommercialPlatformEvidence,
  buildCommercialPlatformReport,
  runCommercialPlatformDashboardRuntime,
  validateCommercialPlatformDashboardRuntime,
  assertRuntimeSuccess,
} from "../lib/commercial-platform-freeze";

const DEPLOYMENT_ID = "v18-commercial-platform-verify";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRegistry() {
  assert(COMMERCIAL_LAYER_ORDER.length === 8, "eight layers");
  assert(COMMERCIAL_MODULE_REGISTRY.length === 14, "fourteen modules");
  const domainTotal = COMMERCIAL_MODULE_REGISTRY.reduce(
    (sum, module) => sum + module.domains.length,
    0,
  );
  assert(domainTotal === 104, "104 domains");
  console.log("✓ commercial platform registry");
  console.log(" ", `layers=${COMMERCIAL_LAYER_ORDER.length} modules=${COMMERCIAL_MODULE_REGISTRY.length} domains=${domainTotal}`);
}

function testReport() {
  const report = buildCommercialPlatformReport({ deploymentId: DEPLOYMENT_ID });
  assert(report.version === COMMERCIAL_PLATFORM_FREEZE_VERSION, "report version");
  assert(report.freezeTag === COMMERCIAL_FREEZE_TAG, "freeze tag");
  assert(report.moduleCount === 14, "module count");
  assert(report.domainCount === 104, "domain count");
  assert(report.inventories.capability.length === 104, "capability inventory");
  assert(report.inventories.runtime.length === 104, "runtime inventory");
  assert(report.inventories.api.length === 104, "api inventory");
  assert(report.inventories.verify.length === 104, "verify inventory");
  assert(report.inventories.dependency.length > 0, "dependency inventory");
  assert(report.inventories.documentation.length >= 14, "documentation inventory");
  console.log("✓ commercial platform report");
  console.log(" ", report.summary);
}

function testDashboard() {
  assert(validateCommercialPlatformDashboardRuntime({ deploymentId: DEPLOYMENT_ID }).valid, "validation");
  const runtime = runCommercialPlatformDashboardRuntime({ deploymentId: DEPLOYMENT_ID });
  assertRuntimeSuccess(runtime);
  assert(runtime.payload.version === COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION, "dashboard version");
  assert(runtime.payload.platformCompleteness === 100, "completeness");
  assert(runtime.payload.platformStability === 100, "stability");
  assert(runtime.payload.platformReadiness === 100, "readiness");
  assert(runtime.payload.commercializationReadiness === 100, "commercialization readiness");
  assert(runtime.payload.layerScores.length === 8, "layer scores");
  console.log("✓ commercial platform dashboard");
  console.log(" ", runtime.summary);
}

function testEvidence() {
  const evidence = buildCommercialPlatformEvidence({ deploymentId: DEPLOYMENT_ID });
  assert(evidence.version === COMMERCIAL_PLATFORM_FREEZE_VERSION, "evidence version");
  assert(evidence.freezeTag === COMMERCIAL_FREEZE_TAG, "evidence tag");
  assert(evidence.layers.length === 8, "evidence layers");
  assert(evidence.moduleEvidence.length === 8, "layer evidence");
  assert(evidence.inventories.capability.length === 104, "evidence capabilities");
  assert(evidence.moduleEvidence.every((entry) => entry.allSuccess), "all layers stable");
  console.log("✓ commercial platform evidence");
  console.log(" ", evidence.summary);
}

testRegistry();
testReport();
testDashboard();
testEvidence();
console.log("COMMERCIAL PLATFORM FREEZE OK");
