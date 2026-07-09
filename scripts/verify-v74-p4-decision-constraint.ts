/**
 * V74 P4 — Decision Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionConstraintCatalogPass,
  buildDecisionConstraintCatalog,
  computeDeclarativeConstraintBlock,
  CONSTRAINT_CATALOG_ENTRIES,
  CONSTRAINT_VALIDATION_CATALOG,
  formatDecisionConstraintCatalogSummary,
  getConstraintCatalogEntriesByType,
  getConstraintCatalogEntryById,
  getConstraintValidationByConstraintRef,
  isDecisionConstraintCatalogRefsAligned,
  runDecisionConstraintCatalog,
  V74_DECISION_CONSTRAINT_FREEZE_VERSION,
  V74_DECISION_CONSTRAINT_VERSION,
} from "../lib/decision/v74/decision.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p4-decision-constraint";

const REQUIRED_TYPES = [
  "hardRule",
  "softRule",
  "priority",
  "conflict",
  "dependency",
  "limit",
  "precondition",
  "postcondition",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.constraint.ts",
    "lib/decision/v74/decision.constraint.catalog.ts",
    "lib/decision/v74/decision.constraint.builder.ts",
    "lib/decision/v74/decision.constraint.entry.ts",
    "docs/V74-DECISION-CONSTRAINT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision constraint catalog module structure");
}

function testInventories() {
  check(CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isDecisionConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const type of REQUIRED_TYPES) {
    check(getConstraintCatalogEntriesByType(type).length >= 1, `${type} constraint type`);
  }
  console.log("✓ constraints, validations, types & alignment");
}

function testConstraintFields() {
  for (const con of CONSTRAINT_CATALOG_ENTRIES) {
    check(con.purpose.length > 0, `${con.id} purpose`);
    check(con.level.length > 0, `${con.id} level`);
    check(con.trigger.length > 0, `${con.id} trigger`);
    check(con.condition.length > 0, `${con.id} condition`);
    check(con.resolution.length > 0, `${con.id} resolution`);
    check(con.priority.length > 0, `${con.id} priority`);
    check(con.validation.length > 0, `${con.id} validation`);
    check(con.inventoryConstraintRef.length > 0, `${con.id} inventoryConstraintRef`);
    check(con.contextRef.length > 0, `${con.id} contextRef`);
    check(con.policyRef.length > 0, `${con.id} policyRef`);
  }
  console.log("✓ constraint field coverage");
}

function testConstraintQueries() {
  const hard = getConstraintCatalogEntryById("DEC-CON-001");
  check(hard?.type === "hardRule", "DEC-CON-001 hardRule");
  check(hard?.level === "critical", "DEC-CON-001 critical level");

  const dependency = getConstraintCatalogEntriesByType("dependency");
  check(dependency.length >= 1, "dependency constraints");

  const precondition = getConstraintCatalogEntryById("DEC-CON-007");
  check(precondition?.type === "precondition", "DEC-CON-007 precondition");

  const validation = getConstraintValidationByConstraintRef("DEC-CON-001");
  check(validation?.validationKind === "hard-rule", "DEC-CON-001 hard-rule validation");

  check(
    computeDeclarativeConstraintBlock({ type: "hardRule", level: "critical" }),
    "hardRule critical block",
  );
  check(
    !computeDeclarativeConstraintBlock({ type: "softRule", level: "L2" }),
    "softRule L2 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runDecisionConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildDecisionConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V74_DECISION_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.decisionContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionConstraintCatalogPass(ready);

  console.log("✓ decision constraint catalog report");
  console.log(formatDecisionConstraintCatalogSummary(ready));
  console.log("\n✅ V74 P4 Decision Constraint Catalog — verify PASS");
}

function main() {
  console.log("V74 P4 Decision Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
