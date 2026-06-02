/**
 * V4-A1 Production Operations Runtime — verification
 */
import {
  V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION,
  buildProductionOperationsRegistry,
  buildOperationalStabilityReport,
  buildOperationalIntelligenceSummary,
  buildOperationalSustainabilityReport,
  buildV4ProductionOperationsFoundation,
  warmOperationsReleaseContext,
  type ProductionOperationRecord,
  type ProductionOperationStatus,
} from "../lib/operations/index";

const DEPLOYMENT_ID = "v4-verify-operations";

const OPERATION_STATUSES: ProductionOperationStatus[] = [
  "planned",
  "active",
  "degraded",
  "maintenance",
  "stabilizing",
  "frozen",
  "retired",
];

const RECORD_KEYS: (keyof ProductionOperationRecord)[] = [
  "id",
  "domain",
  "owner",
  "stage",
  "status",
  "stabilityScore",
  "operationalConfidence",
  "createdAt",
  "updatedAt",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testOperationsRegistry() {
  const registry = buildProductionOperationsRegistry({ deploymentId: DEPLOYMENT_ID });
  assert(registry.records.length >= 15, "registry records");
  assert(registry.activeCount >= 9, "active operations");
  assert(registry.frozenCount >= 1, "frozen operation");
  assert(registry.operationalCount === registry.records.length, "all operational states");

  for (const record of registry.records) {
    for (const key of RECORD_KEYS) {
      assert(key in record, `record ${record.id} missing ${String(key)}`);
    }
    assert(OPERATION_STATUSES.includes(record.status), `invalid status ${record.status}`);
    assert(record.stabilityScore >= 0 && record.stabilityScore <= 100, "stability score range");
    assert(
      record.operationalConfidence >= 0 && record.operationalConfidence <= 100,
      "confidence range",
    );
  }

  console.log("✓ production operations registry");
  console.log(" ", registry.summary);
}

function testOperationalStability() {
  const stability = buildOperationalStabilityReport({ deploymentId: DEPLOYMENT_ID });
  assert(stability.stabilityIndex >= 80, "stability index");
  assert(stability.baselineAligned, "baseline aligned");
  assert(stability.freezeStable, "freeze stable");
  assert(stability.integrityStable, "integrity stable");
  console.log("✓ operational stability");
  console.log(" ", stability.summary);
}

function testOperationalIntelligence() {
  const intelligence = buildOperationalIntelligenceSummary({ deploymentId: DEPLOYMENT_ID });
  assert(intelligence.confidenceScore >= 80, "intelligence confidence");
  assert(intelligence.releaseReadiness, "release readiness");
  assert(intelligence.operationalReadiness, "operational readiness");
  assert(intelligence.insights.length >= 4, "operational insights");
  console.log("✓ operational intelligence");
  console.log(" ", intelligence.summary);
}

function testOperationalSustainability() {
  const sustainability = buildOperationalSustainabilityReport({ deploymentId: DEPLOYMENT_ID });
  assert(sustainability.sustainable, "sustainable");
  assert(sustainability.sustainabilityScore >= 80, "sustainability score");
  assert(sustainability.longTermOperational, "long-term operational");
  assert(sustainability.preservationContinuity, "preservation continuity");
  assert(sustainability.lifecycleContinuity, "lifecycle continuity");
  assert(sustainability.pillars.length >= 6, "sustainability pillars");
  console.log("✓ operational sustainability");
  console.log(" ", sustainability.summary);
}

function testProductionOperationsFoundation() {
  const foundation = buildV4ProductionOperationsFoundation({ deploymentId: DEPLOYMENT_ID });
  assert(foundation.version === V4_PRODUCTION_OPERATIONS_FOUNDATION_VERSION, "foundation version");
  assert(foundation.operationallyReady, "operationally ready");
  assert(foundation.registry.records.length >= 15, "foundation registry");
  assert(foundation.stability.stabilityIndex >= 80, "foundation stability");
  assert(foundation.sustainability.sustainable, "foundation sustainability");
  console.log("✓ production operations foundation");
  console.log(" ", foundation.foundationSummary);
}

function main() {
  warmOperationsReleaseContext(DEPLOYMENT_ID);
  testOperationsRegistry();
  testOperationalStability();
  testOperationalIntelligence();
  testOperationalSustainability();
  testProductionOperationsFoundation();
  console.log("\nAll production operations checks passed.");
}

main();
