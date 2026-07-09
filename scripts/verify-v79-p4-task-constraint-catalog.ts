/**
 * V79 P4 — Task Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_CONSTRAINT_CATALOG_ENTRIES,
  TASK_CONSTRAINT_VALIDATION_CATALOG,
  V79_TASK_CONSTRAINT_FREEZE_VERSION,
  V79_TASK_CONSTRAINT_VERSION,
  assertTaskConstraintCatalogPass,
  buildTaskConstraintCatalog,
  computeTaskDeclarativeConstraintBlock,
  formatTaskConstraintCatalogSummary,
  getTaskConstraintCatalogEntriesByKind,
  getTaskConstraintCatalogEntryById,
  getTaskConstraintValidationByConstraintRef,
  isTaskConstraintCatalogRefsAligned,
  runTaskConstraintCatalog,
} from "../lib/task/v79/task.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p4-task-constraint-catalog";

const REQUIRED_KINDS = [
  "shared",
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/task.constraint.ts",
    "lib/task/v79/task.constraint.catalog.ts",
    "lib/task/v79/task.constraint.builder.ts",
    "lib/task/v79/task.constraint.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task constraint catalog module structure");
}

function testInventories() {
  check(TASK_CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(TASK_CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isTaskConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getTaskConstraintCatalogEntriesByKind(kind).length >= 1, `${kind} constraint kind`);
  }
  console.log("✓ constraints, validations, kinds & alignment");
}

function testConstraintFields() {
  for (const con of TASK_CONSTRAINT_CATALOG_ENTRIES) {
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
  const shared = getTaskConstraintCatalogEntryById("TSK-CON-001");
  check(shared?.kind === "shared", "TSK-CON-001 shared");
  check(shared?.inventoryGovernanceRef === "TSK-GOV-001", "TSK-CON-001 governance ref");

  const state = getTaskConstraintCatalogEntriesByKind("state");
  check(state.length >= 1, "state constraints");
  check(state[0]?.contextRef === "TSK-CTX-003", "state constraint context ref");

  const boundary = getTaskConstraintCatalogEntryById("TSK-CON-008");
  check(boundary?.kind === "boundary", "TSK-CON-008 boundary");
  check(boundary?.level === "critical", "TSK-CON-008 critical level");
  check(boundary?.condition === "no-runtime-task-engine", "TSK-CON-008 boundary condition");

  const validation = getTaskConstraintValidationByConstraintRef("TSK-CON-008");
  check(validation?.validationKind === "boundary", "TSK-CON-008 boundary validation");

  check(
    computeTaskDeclarativeConstraintBlock({ kind: "boundary", level: "critical" }),
    "boundary critical block",
  );
  check(
    !computeTaskDeclarativeConstraintBlock({ kind: "shared", level: "L1" }),
    "shared L1 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runTaskConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildTaskConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V79_TASK_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.taskContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskConstraintCatalogPass(ready);

  console.log("✓ task constraint catalog report");
  console.log(formatTaskConstraintCatalogSummary(ready));
  console.log("\n✅ V79 P4 Task Constraint Catalog — verify PASS");
}

function main() {
  console.log("V79 P4 Task Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
