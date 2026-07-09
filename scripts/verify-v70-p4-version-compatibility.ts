/**
 * V70 P4 — Version Compatibility Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertVersionCompatibilityPass,
  buildVersionCompatibility,
  COMPATIBILITY_CONSTRAINT_CATALOG,
  computeDeclarativeCompatibilityPass,
  formatVersionCompatibilitySummary,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  isVersionCompatibilityRefsAligned,
  runVersionCompatibility,
  VERSION_PAIR_CATALOG,
  V70_VERSION_COMPATIBILITY_FREEZE_VERSION,
  V70_VERSION_COMPATIBILITY_VERSION,
} from "../lib/delivery/v70/compatibility.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p4-version-compatibility";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/version.compatibility.ts",
    "lib/delivery/v70/compatibility.matrix.ts",
    "lib/delivery/v70/compatibility.builder.ts",
    "lib/delivery/v70/compatibility.entry.ts",
    "docs/V70-P4-VERSION-COMPATIBILITY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 version compatibility module structure");
}

function testInventories() {
  check(VERSION_PAIR_CATALOG.length >= 6, "version pair catalog");
  check(COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6, "constraint catalog");
  check(isVersionCompatibilityRefsAligned(), "compatibility refs aligned");
  console.log("✓ pairs, constraints & alignment");
}

function testMatrixFields() {
  for (const pair of VERSION_PAIR_CATALOG) {
    check(pair.sourceVersion.length > 0, `${pair.id} sourceVersion`);
    check(pair.targetVersion.length > 0, `${pair.id} targetVersion`);
    check(typeof pair.compatible === "boolean", `${pair.id} compatible`);
    check(typeof pair.incompatible === "boolean", `${pair.id} incompatible`);
    check(typeof pair.deprecated === "boolean", `${pair.id} deprecated`);
    check(typeof pair.supported === "boolean", `${pair.id} supported`);
    check(pair.minimum.length > 0, `${pair.id} minimum`);
    check(pair.maximum.length > 0, `${pair.id} maximum`);
    check(pair.constraint.length > 0, `${pair.id} constraint`);
    check(pair.fallback.length > 0, `${pair.id} fallback`);
    check(pair.compatible !== pair.incompatible, `${pair.id} compatible/incompatible exclusive`);
  }

  for (const cst of COMPATIBILITY_CONSTRAINT_CATALOG) {
    check(cst.minimum.length > 0, `${cst.id} minimum`);
    check(cst.maximum.length > 0, `${cst.id} maximum`);
    check(cst.fallback.length > 0, `${cst.id} fallback`);
  }

  console.log("✓ matrix field coverage");
}

function testMatrixQueries() {
  const pair = getVersionPairById("DLV-VPX-001");
  check(pair?.compatible === true, "DLV-VPX-001 compatible");
  check(pair?.supported === true, "DLV-VPX-001 supported");

  const legacy = getVersionPairById("DLV-VPX-004");
  check(legacy?.incompatible === true, "DLV-VPX-004 incompatible");
  check(legacy?.deprecated === true, "DLV-VPX-004 deprecated");

  const fromApp = getVersionPairsBySourceRef("DLV-REL-003");
  check(fromApp.length >= 2, "DLV-REL-003 source pairs");

  const cst = getCompatibilityConstraintById("DLV-CMP-CST-003");
  check(cst?.kind === "api-contract", "DLV-CMP-CST-003 api contract");

  check(
    computeDeclarativeCompatibilityPass({ compatible: true, incompatible: false }),
    "compatibility pass",
  );
  check(
    !computeDeclarativeCompatibilityPass({ compatible: false, incompatible: true }),
    "compatibility fail",
  );

  console.log("✓ matrix queries");
}

function testReport() {
  const incomplete = runVersionCompatibility({
    deploymentId: DEPLOYMENT_ID,
    signals: { releasePolicyReady: false },
  });
  check(!incomplete.compatibilityReady, "incomplete policy not ready");

  const ready = buildVersionCompatibility({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_VERSION_COMPATIBILITY_VERSION, "compatibility version");
  check(ready.freezeVersion === V70_VERSION_COMPATIBILITY_FREEZE_VERSION, "freeze version");
  check(ready.releasePolicyReady, "P3 policy ready");
  check(ready.pairs.catalogComplete, "pairs complete");
  check(ready.constraints.catalogComplete, "constraints complete");
  check(ready.matrix.matrixComplete, "matrix complete");
  check(ready.compatibilityReady, "compatibility ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertVersionCompatibilityPass(ready);

  console.log("✓ version compatibility report");
  console.log(formatVersionCompatibilitySummary(ready));
  console.log("\n✅ V70 P4 Version Compatibility — verify PASS");
}

function main() {
  console.log("V70 P4 Version Compatibility Verification\n");
  checkModuleStructure();
  testInventories();
  testMatrixFields();
  testMatrixQueries();
  testReport();
}

main();
