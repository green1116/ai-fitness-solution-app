/**
 * V78 P5 — Execution Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_EVALUATION_CATALOG_ENTRIES,
  EXECUTION_EVALUATION_VALIDATION_CATALOG,
  V78_EXECUTION_EVALUATION_FREEZE_VERSION,
  V78_EXECUTION_EVALUATION_VERSION,
  assertExecutionEvaluationCatalogPass,
  buildExecutionEvaluationCatalog,
  computeExecutionDeclarativeEvaluationDeclared,
  formatExecutionEvaluationCatalogSummary,
  getExecutionEvaluationCatalogEntriesByKind,
  getExecutionEvaluationCatalogEntryById,
  getExecutionEvaluationValidationByEvaluationRef,
  isExecutionEvaluationCatalogRefsAligned,
  runExecutionEvaluationCatalog,
} from "../lib/execution/v78/execution.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p5-execution-evaluation-catalog";

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
    "lib/execution/v78/execution.evaluation.ts",
    "lib/execution/v78/execution.evaluation.catalog.ts",
    "lib/execution/v78/execution.evaluation.builder.ts",
    "lib/execution/v78/execution.evaluation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution evaluation catalog module structure");
}

function testInventories() {
  check(EXECUTION_EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(EXECUTION_EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isExecutionEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getExecutionEvaluationCatalogEntriesByKind(kind).length >= 1, `${kind} evaluation kind`);
  }
  console.log("✓ evaluations, validations, kinds & alignment");
}

function testEvaluationFields() {
  for (const ev of EXECUTION_EVALUATION_CATALOG_ENTRIES) {
    check(ev.purpose.length > 0, `${ev.id} purpose`);
    check(ev.roleRef.length > 0, `${ev.id} roleRef`);
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
  const shared = getExecutionEvaluationCatalogEntryById("EXE-EVAL-001");
  check(shared?.kind === "shared", "EXE-EVAL-001 shared");
  check(shared?.passRule === "upstream-planning-freeze-intact", "EXE-EVAL-001 passRule");

  const topology = getExecutionEvaluationCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology evaluations");

  const boundary = getExecutionEvaluationCatalogEntryById("EXE-EVAL-008");
  check(boundary?.kind === "boundary", "EXE-EVAL-008 boundary");

  const validation = getExecutionEvaluationValidationByEvaluationRef("EXE-EVAL-003");
  check(validation?.validationKind === "topology", "EXE-EVAL-003 topology validation");

  check(
    computeExecutionDeclarativeEvaluationDeclared({
      kind: "boundary",
      threshold: "declarative-only=true",
    }),
    "boundary declared",
  );
  check(
    !computeExecutionDeclarativeEvaluationDeclared({ kind: "shared", threshold: "" }),
    "shared empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runExecutionEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildExecutionEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V78_EXECUTION_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.executionConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionEvaluationCatalogPass(ready);

  console.log("✓ execution evaluation catalog report");
  console.log(formatExecutionEvaluationCatalogSummary(ready));
  console.log("\n✅ V78 P5 Execution Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V78 P5 Execution Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
