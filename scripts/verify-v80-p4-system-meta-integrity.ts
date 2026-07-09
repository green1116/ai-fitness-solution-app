/**
 * V80 P4 — System Meta Integrity Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SYSTEM_CONSISTENCY_CHECKS,
  SYSTEM_DRIFT_DETECTORS,
  SYSTEM_GLOBAL_FREEZE_SEMANTICS,
  SYSTEM_INTEGRITY_CATALOG,
  SYSTEM_RECONCILIATION_RULES,
  V80_SYSTEM_INTEGRITY_FREEZE_VERSION,
  V80_SYSTEM_INTEGRITY_VERSION,
  assertSystemIntegrityCatalogPass,
  buildSystemIntegrityCatalog,
  computeSystemDeclarativeIntegrityEnforced,
  formatSystemIntegrityCatalogSummary,
  getSystemConsistencyCheckById,
  getSystemDriftDetectorByLayer,
  getSystemGlobalFreezeSemanticById,
  getSystemIntegrityRuleById,
  getSystemIntegrityRulesByKind,
  getSystemReconciliationRuleById,
  isSystemConsistencyValidationComplete,
  isSystemDriftDetectionComplete,
  isSystemIntegrityCatalogRefsAligned,
  isSystemReconciliationComplete,
  runSystemIntegrityCatalog,
} from "../lib/system/v80/system.integrity.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-p4-system-meta-integrity";
const STACK_LAYERS = ["V76", "V77", "V78", "V79"];

const REQUIRED_KINDS = [
  "consistency",
  "drift",
  "reconciliation",
  "freeze",
  "policy",
  "simulation",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/system/v80/system.integrity.ts",
    "lib/system/v80/system.integrity.catalog.ts",
    "lib/system/v80/system.integrity.consistency.ts",
    "lib/system/v80/system.integrity.drift.ts",
    "lib/system/v80/system.integrity.reconciliation.ts",
    "lib/system/v80/system.integrity.builder.ts",
    "lib/system/v80/system.integrity.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V80 system meta integrity module structure");
}

function testCatalogs() {
  check(SYSTEM_INTEGRITY_CATALOG.length === 6, "SYS-INT-001…006");
  check(SYSTEM_CONSISTENCY_CHECKS.length === 4, "consistency checks");
  check(SYSTEM_DRIFT_DETECTORS.length === 4, "drift detectors");
  check(SYSTEM_RECONCILIATION_RULES.length === 3, "reconciliation rules");
  check(SYSTEM_GLOBAL_FREEZE_SEMANTICS.length === 3, "freeze semantics");
  check(isSystemIntegrityCatalogRefsAligned(), "integrity refs aligned");
  check(isSystemConsistencyValidationComplete(), "consistency complete");
  check(isSystemDriftDetectionComplete(), "drift complete");
  check(isSystemReconciliationComplete(), "reconciliation complete");
  for (const kind of REQUIRED_KINDS) {
    check(getSystemIntegrityRulesByKind(kind).length >= 1, `${kind} integrity kind`);
  }
  console.log("✓ integrity rules, consistency, drift & reconciliation");
}

function testCrossLayerAndUpstreamInput() {
  for (const rule of SYSTEM_INTEGRITY_CATALOG) {
    check(rule.layerRefs.length === 4, `${rule.id} spans 4 layers`);
    for (const layer of STACK_LAYERS) {
      check(rule.layerRefs.includes(layer), `${rule.id} includes ${layer}`);
    }
    check(rule.policyRef.startsWith("SYS-POL-"), `${rule.id} policyRef`);
    check(rule.invariantRef.startsWith("SYS-INV-"), `${rule.id} invariantRef`);
    check(rule.simulationRef.startsWith("SYS-SIM-"), `${rule.id} simulationRef`);
    check(rule.status === "enforced", `${rule.id} enforced`);
  }

  const cons = getSystemConsistencyCheckById("SYS-CONS-001");
  check(cons?.checkKind === "cross-layer-map", "cross-layer map consistency");

  const drift = getSystemDriftDetectorByLayer("V79");
  check(drift?.driftKind === "v79-signoff-drift", "V79 drift detector");

  console.log("✓ cross-layer validation & V80 POL+INV+SIM input");
}

function testReconciliationAndFreeze() {
  const rec = getSystemReconciliationRuleById("SYS-REC-002");
  check(rec?.action.includes("no-mutation") === true, "declarative reconciliation no mutation");

  const gfz = getSystemGlobalFreezeSemanticById("SYS-GFZ-001");
  check(gfz?.semanticKind === "stack-wide-freeze-lock", "stack-wide freeze lock");
  check(gfz?.layerRefs.length === 4, "freeze semantics span V76–V79");

  const freezeRule = getSystemGlobalFreezeSemanticById("SYS-GFZ-003");
  check(freezeRule?.rule.includes("no-mutation") === true, "freeze exclusion boundary");

  check(
    computeSystemDeclarativeIntegrityEnforced({ kind: "freeze", status: "enforced" }),
    "freeze enforced",
  );
  check(
    !computeSystemDeclarativeIntegrityEnforced({ kind: "drift", status: "pending" }),
    "drift pending not enforced",
  );

  console.log("✓ reconciliation + global freeze semantics");
}

function testReport() {
  const incomplete = runSystemIntegrityCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { systemSimulationCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete simulation catalog not ready");

  const ready = buildSystemIntegrityCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_SYSTEM_INTEGRITY_VERSION, "integrity version");
  check(ready.freezeVersion === V80_SYSTEM_INTEGRITY_FREEZE_VERSION, "freeze version");
  check(ready.systemSimulationCatalogReady, "P3 simulation catalog ready");
  check(ready.catalog.catalogComplete, "integrity rules complete");
  check(ready.consistency.consistencyComplete, "consistency complete");
  check(ready.drift.driftDetectionComplete, "drift complete");
  check(ready.reconciliation.reconciliationComplete, "reconciliation complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertSystemIntegrityCatalogPass(ready);

  const int = getSystemIntegrityRuleById("SYS-INT-005");
  check(int?.kind === "policy", "SYS-INT-005 policy integrity");

  console.log("✓ system meta integrity report");
  console.log(formatSystemIntegrityCatalogSummary(ready));
  console.log("\n✅ V80 P4 System Meta Integrity — verify PASS");
}

function main() {
  console.log("V80 P4 System Meta Integrity Verification\n");
  checkModuleStructure();
  testCatalogs();
  testCrossLayerAndUpstreamInput();
  testReconciliationAndFreeze();
  testReport();
}

main();
