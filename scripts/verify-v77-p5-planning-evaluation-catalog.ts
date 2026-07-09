/**
 * V77 P5 — Planning Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_EVALUATION_CATALOG_ENTRIES,
  PLANNING_EVALUATION_VALIDATION_CATALOG,
  V77_PLANNING_EVALUATION_FREEZE_VERSION,
  V77_PLANNING_EVALUATION_VERSION,
  assertPlanningEvaluationCatalogPass,
  buildPlanningEvaluationCatalog,
  computePlanningDeclarativeEvaluationDeclared,
  formatPlanningEvaluationCatalogSummary,
  getPlanningEvaluationCatalogEntriesByKind,
  getPlanningEvaluationCatalogEntryById,
  getPlanningEvaluationValidationByEvaluationRef,
  isPlanningEvaluationCatalogRefsAligned,
  runPlanningEvaluationCatalog,
} from "../lib/planning/v77/planning.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p5-planning-evaluation-catalog";

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
    "lib/planning/v77/planning.evaluation.ts",
    "lib/planning/v77/planning.evaluation.catalog.ts",
    "lib/planning/v77/planning.evaluation.builder.ts",
    "lib/planning/v77/planning.evaluation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning evaluation catalog module structure");
}

function testInventories() {
  check(PLANNING_EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(PLANNING_EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isPlanningEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPlanningEvaluationCatalogEntriesByKind(kind).length >= 1, `${kind} evaluation kind`);
  }
  console.log("✓ evaluations, validations, kinds & alignment");
}

function testEvaluationFields() {
  for (const ev of PLANNING_EVALUATION_CATALOG_ENTRIES) {
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
  const shared = getPlanningEvaluationCatalogEntryById("PLN-EVAL-001");
  check(shared?.kind === "shared", "PLN-EVAL-001 shared");
  check(shared?.passRule === "upstream-collaboration-freeze-intact", "PLN-EVAL-001 passRule");

  const topology = getPlanningEvaluationCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology evaluations");

  const boundary = getPlanningEvaluationCatalogEntryById("PLN-EVAL-008");
  check(boundary?.kind === "boundary", "PLN-EVAL-008 boundary");

  const validation = getPlanningEvaluationValidationByEvaluationRef("PLN-EVAL-003");
  check(validation?.validationKind === "topology", "PLN-EVAL-003 topology validation");

  check(
    computePlanningDeclarativeEvaluationDeclared({
      kind: "boundary",
      threshold: "declarative-only=true",
    }),
    "boundary declared",
  );
  check(
    !computePlanningDeclarativeEvaluationDeclared({ kind: "shared", threshold: "" }),
    "shared empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runPlanningEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildPlanningEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V77_PLANNING_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.planningConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningEvaluationCatalogPass(ready);

  console.log("✓ planning evaluation catalog report");
  console.log(formatPlanningEvaluationCatalogSummary(ready));
  console.log("\n✅ V77 P5 Planning Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V77 P5 Planning Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
