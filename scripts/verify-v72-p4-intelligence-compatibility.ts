/**
 * V72 P4 — Intelligence Compatibility Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceCompatibilityPass,
  buildIntelligenceCompatibility,
  COMPATIBILITY_CONSTRAINT_CATALOG,
  computeDeclarativeCompatibilityPass,
  formatIntelligenceCompatibilitySummary,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  INTELLIGENCE_VERSION_PAIR_CATALOG,
  isIntelligenceCompatibilityRefsAligned,
  runIntelligenceCompatibility,
  V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "../lib/intelligence/v72/compatibility.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p4-intelligence-compatibility";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/intelligence.compatibility.ts",
    "lib/intelligence/v72/compatibility.matrix.ts",
    "lib/intelligence/v72/compatibility.builder.ts",
    "lib/intelligence/v72/compatibility.entry.ts",
    "docs/V72-P4-INTELLIGENCE-COMPATIBILITY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence compatibility module structure");
}

function testInventories() {
  check(INTELLIGENCE_VERSION_PAIR_CATALOG.length >= 6, "version pair catalog");
  check(COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6, "constraint catalog");
  check(isIntelligenceCompatibilityRefsAligned(), "compatibility refs aligned");
  console.log("✓ pairs, constraints & alignment");
}

function testMatrixFields() {
  for (const pair of INTELLIGENCE_VERSION_PAIR_CATALOG) {
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
  const pair = getVersionPairById("INT-VPX-001");
  check(pair?.compatible === true, "INT-VPX-001 compatible");
  check(pair?.supported === true, "INT-VPX-001 supported");

  const deprecated = getVersionPairById("INT-VPX-004");
  check(deprecated?.incompatible === true, "INT-VPX-004 incompatible");
  check(deprecated?.deprecated === true, "INT-VPX-004 deprecated");

  const fromCatalog = getVersionPairsBySourceRef("INT-001");
  check(fromCatalog.length >= 2, "INT-001 source pairs");

  const cst = getCompatibilityConstraintById("INT-CMP-CST-003");
  check(cst?.kind === "dependency-order", "INT-CMP-CST-003 dependency order");

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
  const incomplete = runIntelligenceCompatibility({
    deploymentId: DEPLOYMENT_ID,
    signals: { intelligencePolicyReady: false },
  });
  check(!incomplete.compatibilityReady, "incomplete policy not ready");

  const ready = buildIntelligenceCompatibility({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_COMPATIBILITY_VERSION, "compatibility version");
  check(ready.freezeVersion === V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION, "freeze version");
  check(ready.intelligencePolicyReady, "P3 policy ready");
  check(ready.pairs.catalogComplete, "pairs complete");
  check(ready.constraints.catalogComplete, "constraints complete");
  check(ready.matrix.matrixComplete, "matrix complete");
  check(ready.compatibilityReady, "compatibility ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligenceCompatibilityPass(ready);

  console.log("✓ intelligence compatibility report");
  console.log(formatIntelligenceCompatibilitySummary(ready));
  console.log("\n✅ V72 P4 Intelligence Compatibility — verify PASS");
}

function main() {
  console.log("V72 P4 Intelligence Compatibility Verification\n");
  checkModuleStructure();
  testInventories();
  testMatrixFields();
  testMatrixQueries();
  testReport();
}

main();
