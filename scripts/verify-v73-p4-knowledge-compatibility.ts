/**
 * V73 P4 — Knowledge Compatibility Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeCompatibilityPass,
  buildKnowledgeCompatibility,
  COMPATIBILITY_CONSTRAINT_CATALOG,
  computeDeclarativeCompatibilityPass,
  formatKnowledgeCompatibilitySummary,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  KNOWLEDGE_VERSION_PAIR_CATALOG,
  isKnowledgeCompatibilityRefsAligned,
  runKnowledgeCompatibility,
  V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  V73_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "../lib/knowledge/v73/compatibility.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p4-knowledge-compatibility";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/knowledge.compatibility.ts",
    "lib/knowledge/v73/compatibility.matrix.ts",
    "lib/knowledge/v73/compatibility.builder.ts",
    "lib/knowledge/v73/compatibility.entry.ts",
    "docs/V73-P4-KNOWLEDGE-COMPATIBILITY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge compatibility module structure");
}

function testInventories() {
  check(KNOWLEDGE_VERSION_PAIR_CATALOG.length >= 6, "version pair catalog");
  check(COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6, "constraint catalog");
  check(isKnowledgeCompatibilityRefsAligned(), "compatibility refs aligned");
  console.log("✓ pairs, constraints & alignment");
}

function testMatrixFields() {
  for (const pair of KNOWLEDGE_VERSION_PAIR_CATALOG) {
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
  const pair = getVersionPairById("KNW-VPX-001");
  check(pair?.compatible === true, "KNW-VPX-001 compatible");
  check(pair?.supported === true, "KNW-VPX-001 supported");

  const deprecated = getVersionPairById("KNW-VPX-004");
  check(deprecated?.incompatible === true, "KNW-VPX-004 incompatible");
  check(deprecated?.deprecated === true, "KNW-VPX-004 deprecated");

  const fromCatalog = getVersionPairsBySourceRef("KNW-001");
  check(fromCatalog.length >= 2, "KNW-001 source pairs");

  const cst = getCompatibilityConstraintById("KNW-CMP-CST-003");
  check(cst?.kind === "dependency-order", "KNW-CMP-CST-003 dependency order");

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
  const incomplete = runKnowledgeCompatibility({
    deploymentId: DEPLOYMENT_ID,
    signals: { knowledgePolicyReady: false },
  });
  check(!incomplete.compatibilityReady, "incomplete policy not ready");

  const ready = buildKnowledgeCompatibility({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_COMPATIBILITY_VERSION, "compatibility version");
  check(ready.freezeVersion === V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION, "freeze version");
  check(ready.knowledgePolicyReady, "P3 policy ready");
  check(ready.pairs.catalogComplete, "pairs complete");
  check(ready.constraints.catalogComplete, "constraints complete");
  check(ready.matrix.matrixComplete, "matrix complete");
  check(ready.compatibilityReady, "compatibility ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgeCompatibilityPass(ready);

  console.log("✓ knowledge compatibility report");
  console.log(formatKnowledgeCompatibilitySummary(ready));
  console.log("\n✅ V73 P4 Knowledge Compatibility — verify PASS");
}

function main() {
  console.log("V73 P4 Knowledge Compatibility Verification\n");
  checkModuleStructure();
  testInventories();
  testMatrixFields();
  testMatrixQueries();
  testReport();
}

main();
