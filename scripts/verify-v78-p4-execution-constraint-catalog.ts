/**
 * V78 P4 — Execution Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_CONSTRAINT_CATALOG_ENTRIES,
  EXECUTION_CONSTRAINT_VALIDATION_CATALOG,
  V78_EXECUTION_CONSTRAINT_FREEZE_VERSION,
  V78_EXECUTION_CONSTRAINT_VERSION,
  assertExecutionConstraintCatalogPass,
  buildExecutionConstraintCatalog,
  computeExecutionDeclarativeConstraintBlock,
  formatExecutionConstraintCatalogSummary,
  getExecutionConstraintCatalogEntriesByKind,
  getExecutionConstraintCatalogEntryById,
  getExecutionConstraintValidationByConstraintRef,
  isExecutionConstraintCatalogRefsAligned,
  runExecutionConstraintCatalog,
} from "../lib/execution/v78/execution.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p4-execution-constraint-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/execution/v78/execution.constraint.ts",
    "lib/execution/v78/execution.constraint.catalog.ts",
    "lib/execution/v78/execution.constraint.builder.ts",
    "lib/execution/v78/execution.constraint.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution constraint catalog module structure");
}

function testInventories() {
  check(EXECUTION_CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(EXECUTION_CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isExecutionConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getExecutionConstraintCatalogEntriesByKind(kind).length >= 1, `${kind} constraint kind`);
  }
  console.log("✓ constraints, validations, kinds & alignment");
}

function testConstraintFields() {
  for (const con of EXECUTION_CONSTRAINT_CATALOG_ENTRIES) {
    check(con.purpose.length > 0, `${con.id} purpose`);
    check(con.scopeRef.length > 0, `${con.id} scopeRef`);
    check(con.level.length > 0, `${con.id} level`);
    check(con.trigger.length > 0, `${con.id} trigger`);
    check(con.condition.length > 0, `${con.id} condition`);
    check(con.resolution.length > 0, `${con.id} resolution`);
    check(con.priority.length > 0, `${con.id} priority`);
    check(con.validation.length > 0, `${con.id} validation`);
    check(con.inventoryGovernanceRef.length > 0, `${con.id} inventoryGovernanceRef`);
    check(con.contextRef.length > 0, `${con.id} contextRef`);
    check(con.policyRef.length > 0, `${con.id} policyRef`);
  }
  console.log("✓ constraint field coverage");
}

function testConstraintQueries() {
  const shared = getExecutionConstraintCatalogEntryById("EXE-CON-001");
  check(shared?.kind === "shared", "EXE-CON-001 shared");
  check(shared?.inventoryGovernanceRef === "EXE-GOV-001", "EXE-CON-001 governance ref");

  const topology = getExecutionConstraintCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology constraints");

  const boundary = getExecutionConstraintCatalogEntryById("EXE-CON-008");
  check(boundary?.kind === "boundary", "EXE-CON-008 boundary");
  check(boundary?.level === "critical", "EXE-CON-008 critical level");

  const validation = getExecutionConstraintValidationByConstraintRef("EXE-CON-008");
  check(validation?.validationKind === "boundary", "EXE-CON-008 boundary validation");

  check(
    computeExecutionDeclarativeConstraintBlock({ kind: "boundary", level: "critical" }),
    "boundary critical block",
  );
  check(
    !computeExecutionDeclarativeConstraintBlock({ kind: "shared", level: "L1" }),
    "shared L1 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runExecutionConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildExecutionConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V78_EXECUTION_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.executionContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionConstraintCatalogPass(ready);

  console.log("✓ execution constraint catalog report");
  console.log(formatExecutionConstraintCatalogSummary(ready));
  console.log("\n✅ V78 P4 Execution Constraint Catalog — verify PASS");
}

function main() {
  console.log("V78 P4 Execution Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
