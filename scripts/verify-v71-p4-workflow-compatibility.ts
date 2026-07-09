/**
 * V71 P4 — Workflow Compatibility Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowCompatibilityPass,
  buildWorkflowCompatibility,
  COMPATIBILITY_CONSTRAINT_CATALOG,
  computeDeclarativeCompatibilityPass,
  formatWorkflowCompatibilitySummary,
  getCompatibilityConstraintById,
  getWorkflowVersionPairById,
  getWorkflowVersionPairsBySourceRef,
  isWorkflowCompatibilityRefsAligned,
  runWorkflowCompatibility,
  V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION,
  V71_WORKFLOW_COMPATIBILITY_VERSION,
  WORKFLOW_VERSION_PAIR_CATALOG,
} from "../lib/orchestration/v71/compatibility.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p4-workflow-compatibility";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/workflow.compatibility.ts",
    "lib/orchestration/v71/compatibility.matrix.ts",
    "lib/orchestration/v71/compatibility.builder.ts",
    "lib/orchestration/v71/compatibility.entry.ts",
    "docs/V71-P4-WORKFLOW-COMPATIBILITY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow compatibility module structure");
}

function testInventories() {
  check(WORKFLOW_VERSION_PAIR_CATALOG.length >= 6, "workflow version pair catalog");
  check(COMPATIBILITY_CONSTRAINT_CATALOG.length >= 6, "constraint catalog");
  check(isWorkflowCompatibilityRefsAligned(), "compatibility refs aligned");
  console.log("✓ pairs, constraints & alignment");
}

function testMatrixFields() {
  for (const pair of WORKFLOW_VERSION_PAIR_CATALOG) {
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
  const pair = getWorkflowVersionPairById("ORC-WPX-001");
  check(pair?.compatible === true, "ORC-WPX-001 compatible");
  check(pair?.supported === true, "ORC-WPX-001 supported");

  const deprecated = getWorkflowVersionPairById("ORC-WPX-004");
  check(deprecated?.incompatible === true, "ORC-WPX-004 incompatible");
  check(deprecated?.deprecated === true, "ORC-WPX-004 deprecated");

  const fromCatalog = getWorkflowVersionPairsBySourceRef("ORC-001");
  check(fromCatalog.length >= 2, "ORC-001 source pairs");

  const cst = getCompatibilityConstraintById("ORC-CMP-CST-003");
  check(cst?.kind === "dependency-order", "ORC-CMP-CST-003 dependency order");

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
  const incomplete = runWorkflowCompatibility({
    deploymentId: DEPLOYMENT_ID,
    signals: { workflowPolicyReady: false },
  });
  check(!incomplete.compatibilityReady, "incomplete policy not ready");

  const ready = buildWorkflowCompatibility({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_WORKFLOW_COMPATIBILITY_VERSION, "compatibility version");
  check(ready.freezeVersion === V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION, "freeze version");
  check(ready.workflowPolicyReady, "P3 policy ready");
  check(ready.pairs.catalogComplete, "pairs complete");
  check(ready.constraints.catalogComplete, "constraints complete");
  check(ready.matrix.matrixComplete, "matrix complete");
  check(ready.compatibilityReady, "compatibility ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertWorkflowCompatibilityPass(ready);

  console.log("✓ workflow compatibility report");
  console.log(formatWorkflowCompatibilitySummary(ready));
  console.log("\n✅ V71 P4 Workflow Compatibility — verify PASS");
}

function main() {
  console.log("V71 P4 Workflow Compatibility Verification\n");
  checkModuleStructure();
  testInventories();
  testMatrixFields();
  testMatrixQueries();
  testReport();
}

main();
