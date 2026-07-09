/**
 * V80 P5 — System Meta Closure Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SYSTEM_CLOSURE_CATALOG,
  SYSTEM_COMPLETENESS_PROOFS,
  SYSTEM_GLOBAL_INVARIANT_CERTS,
  SYSTEM_ROLLBACK_INDEX,
  V80_SYSTEM_CLOSURE_FREEZE_VERSION,
  V80_SYSTEM_CLOSURE_VERSION,
  V80_SYSTEM_FREEZE_VERSION,
  V80_SYSTEM_LAYER_VERSION_LOCK,
  V80_SYSTEM_SIGNOFF_VERSION,
  assertSystemClosurePass,
  buildSystemClosure,
  closeV80System,
  collectSystemPhaseReadiness,
  computeSystemDeclarativeClosureSealed,
  formatSystemClosureSummary,
  getSystemClosureProofById,
  getSystemCompletenessProofByPhase,
  getSystemGlobalInvariantCertByInvariantRef,
  getSystemRollbackEntryByPhase,
  isSystemClosureCatalogRefsAligned,
  isSystemCompletenessProofComplete,
  isSystemGlobalInvariantCertComplete,
  isSystemLayerVersionLockIntact,
  isSystemRollbackIndexComplete,
  runSystemClosure,
  systemVersionLockMatchesExpected,
} from "../lib/system/v80/system.closure.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-p5-system-meta-closure";
const STACK_LAYERS = ["V76", "V77", "V78", "V79"];

const REQUIRED_KINDS = [
  "ontology",
  "policy",
  "simulation",
  "integrity",
  "completeness",
  "seal",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/system/v80/system.closure.ts",
    "lib/system/v80/system.closure.catalog.ts",
    "lib/system/v80/system.closure.completeness.ts",
    "lib/system/v80/system.closure.invariant.ts",
    "lib/system/v80/system.closure.freeze.ts",
    "lib/system/v80/system.closure.readiness.ts",
    "lib/system/v80/system.closure.builder.ts",
    "lib/system/v80/system.closure.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V80 system meta closure module structure");
}

function testCatalogs() {
  check(SYSTEM_CLOSURE_CATALOG.length === 6, "SYS-CLS-001…006");
  check(SYSTEM_COMPLETENESS_PROOFS.length === 4, "completeness proofs P1–P4");
  check(SYSTEM_GLOBAL_INVARIANT_CERTS.length === 6, "global invariant certs");
  check(SYSTEM_ROLLBACK_INDEX.length === 6, "rollback index");
  check(isSystemClosureCatalogRefsAligned(), "closure refs aligned");
  check(isSystemCompletenessProofComplete(), "completeness complete");
  check(isSystemGlobalInvariantCertComplete(), "invariant cert complete");
  check(isSystemLayerVersionLockIntact(), "version lock intact");
  check(systemVersionLockMatchesExpected(), "version lock matches");
  check(isSystemRollbackIndexComplete(), "rollback index complete");
  for (const kind of REQUIRED_KINDS) {
    check(
      SYSTEM_CLOSURE_CATALOG.some((p) => p.kind === kind),
      `${kind} closure kind`,
    );
  }
  console.log("✓ closure proofs, completeness, invariant certs & freeze index");
}

function testP1P4Coverage() {
  for (const phase of ["P1", "P2", "P3", "P4"]) {
    const proof = getSystemCompletenessProofByPhase(phase);
    check(proof != null, `${phase} completeness proof`);
    check(proof!.verifyScript.includes("verify-v80"), `${phase} verify script`);
  }

  for (const proof of SYSTEM_CLOSURE_CATALOG) {
    check(proof.layerRefs.length === 4, `${proof.id} spans V76–V79`);
    for (const layer of STACK_LAYERS) {
      check(proof.layerRefs.includes(layer), `${proof.id} includes ${layer}`);
    }
  }

  const cert = getSystemGlobalInvariantCertByInvariantRef("SYS-INV-006");
  check(cert?.certificationRule === "declarative-stack-certified", "declarative cert");

  console.log("✓ P1–P4 completeness & global invariant certification");
}

function testFreezeManifest() {
  const rollback = getSystemRollbackEntryByPhase("P5");
  check(rollback?.snapshotPath.includes("system.closure") === true, "P5 rollback path");

  check(
    V80_SYSTEM_LAYER_VERSION_LOCK.upstreamV79TaskSignoff === "v79-task-signoff-1",
    "upstream V79 signoff lock",
  );
  check(V80_SYSTEM_LAYER_VERSION_LOCK.signoff === V80_SYSTEM_SIGNOFF_VERSION, "signoff version");
  check(V80_SYSTEM_LAYER_VERSION_LOCK.freeze === V80_SYSTEM_FREEZE_VERSION, "freeze version");

  const seal = getSystemClosureProofById("SYS-CLS-006");
  check(seal?.kind === "seal", "SYS-CLS-006 seal");
  check(
    computeSystemDeclarativeClosureSealed({ kind: "seal", status: "certified" }),
    "seal certified",
  );

  console.log("✓ final freeze manifest & seal state");
}

function testReport() {
  const incomplete = runSystemClosure({
    deploymentId: DEPLOYMENT_ID,
    signals: { systemIntegrityCatalogReady: false },
  });
  check(!incomplete.closureReady, "incomplete integrity not ready");

  const ready = buildSystemClosure({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_SYSTEM_CLOSURE_VERSION, "closure version");
  check(ready.freezeVersion === V80_SYSTEM_CLOSURE_FREEZE_VERSION, "closure freeze");
  check(ready.systemIntegrityReady, "P4 integrity ready");
  check(ready.readiness.ready, "P1–P4 readiness");
  check(ready.catalog.catalogComplete, "closure catalog complete");
  check(ready.completeness.completenessComplete, "completeness complete");
  check(ready.invariantCert.certificationComplete, "certification complete");
  check(ready.freeze.sealed, "system sealed");
  check(ready.closureReady, "closure ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertSystemClosurePass(ready);

  const closed = closeV80System({ deploymentId: DEPLOYMENT_ID });
  check(closed.closureReady, "closeV80System sealed");

  const readiness = collectSystemPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.p1 && readiness.p2 && readiness.p3 && readiness.p4, "all phases ready");

  console.log("✓ system meta closure report");
  console.log(formatSystemClosureSummary(ready));
  console.log(ready.closingSummary);
  console.log("\n✅ V80 P5 System Meta Closure — verify PASS");
}

function main() {
  console.log("V80 P5 System Meta Closure Verification\n");
  checkModuleStructure();
  testCatalogs();
  testP1P4Coverage();
  testFreezeManifest();
  testReport();
}

main();
