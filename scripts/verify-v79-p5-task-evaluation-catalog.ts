/**
 * V79 P5 — Task Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_EVALUATION_CATALOG_ENTRIES,
  TASK_EVALUATION_VALIDATION_CATALOG,
  V79_TASK_EVALUATION_FREEZE_VERSION,
  V79_TASK_EVALUATION_VERSION,
  assertTaskEvaluationCatalogPass,
  buildTaskEvaluationCatalog,
  computeTaskDeclarativeEvaluationDeclared,
  formatTaskEvaluationCatalogSummary,
  getTaskEvaluationCatalogEntriesByKind,
  getTaskEvaluationCatalogEntryById,
  getTaskEvaluationValidationByEvaluationRef,
  isTaskEvaluationCatalogRefsAligned,
  runTaskEvaluationCatalog,
} from "../lib/task/v79/task.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p5-task-evaluation-catalog";

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
    "lib/task/v79/task.evaluation.ts",
    "lib/task/v79/task.evaluation.catalog.ts",
    "lib/task/v79/task.evaluation.builder.ts",
    "lib/task/v79/task.evaluation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task evaluation catalog module structure");
}

function testInventories() {
  check(TASK_EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(TASK_EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isTaskEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getTaskEvaluationCatalogEntriesByKind(kind).length >= 1, `${kind} evaluation kind`);
  }
  console.log("✓ evaluations, validations, kinds & alignment");
}

function testEvaluationFields() {
  for (const ev of TASK_EVALUATION_CATALOG_ENTRIES) {
    check(ev.purpose.length > 0, `${ev.id} purpose`);
    check(ev.roleRef.length > 0, `${ev.id} roleRef`);
    check(ev.stateRef.length > 0, `${ev.id} stateRef`);
    check(ev.topologyRef.length > 0, `${ev.id} topologyRef`);
    check(ev.dependencyRef.length > 0, `${ev.id} dependencyRef`);
    check(ev.metrics.length >= 1, `${ev.id} metrics`);
    check(ev.threshold.length > 0, `${ev.id} threshold`);
    check(ev.passRule.length > 0, `${ev.id} passRule`);
    check(ev.priority.length > 0, `${ev.id} priority`);
    check(ev.validation.length > 0, `${ev.id} validation`);
    check(ev.constraintRef.length > 0, `${ev.id} constraintRef`);
    check(ev.contextRef.length > 0, `${ev.id} contextRef`);
  }
  console.log("✓ evaluation field coverage");
}

function testEvaluationQueries() {
  const shared = getTaskEvaluationCatalogEntryById("TSK-EVAL-001");
  check(shared?.kind === "shared", "TSK-EVAL-001 shared");
  check(shared?.passRule === "upstream-execution-freeze-intact", "TSK-EVAL-001 passRule");

  const state = getTaskEvaluationCatalogEntriesByKind("state");
  check(state.length >= 1, "state evaluations");
  check(state[0]?.constraintRef === "TSK-CON-003", "state evaluation constraint ref");

  const boundary = getTaskEvaluationCatalogEntryById("TSK-EVAL-008");
  check(boundary?.kind === "boundary", "TSK-EVAL-008 boundary");
  check(boundary?.passRule === "no-runtime-task-engine", "TSK-EVAL-008 passRule");

  const validation = getTaskEvaluationValidationByEvaluationRef("TSK-EVAL-004");
  check(validation?.validationKind === "topology", "TSK-EVAL-004 topology validation");

  check(
    computeTaskDeclarativeEvaluationDeclared({
      kind: "boundary",
      threshold: "declarative-only=true",
    }),
    "boundary declared",
  );
  check(
    !computeTaskDeclarativeEvaluationDeclared({ kind: "shared", threshold: "" }),
    "shared empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runTaskEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildTaskEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V79_TASK_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.taskConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskEvaluationCatalogPass(ready);

  console.log("✓ task evaluation catalog report");
  console.log(formatTaskEvaluationCatalogSummary(ready));
  console.log("\n✅ V79 P5 Task Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V79 P5 Task Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
