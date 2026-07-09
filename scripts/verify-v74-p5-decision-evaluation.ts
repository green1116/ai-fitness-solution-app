/**
 * V74 P5 — Decision Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionEvaluationCatalogPass,
  buildDecisionEvaluationCatalog,
  computeDeclarativeEvaluationDeclared,
  EVALUATION_CATALOG_ENTRIES,
  EVALUATION_VALIDATION_CATALOG,
  formatDecisionEvaluationCatalogSummary,
  getEvaluationCatalogEntriesByDimension,
  getEvaluationCatalogEntryById,
  getEvaluationValidationByEvaluationRef,
  isDecisionEvaluationCatalogRefsAligned,
  runDecisionEvaluationCatalog,
  V74_DECISION_EVALUATION_FREEZE_VERSION,
  V74_DECISION_EVALUATION_VERSION,
} from "../lib/decision/v74/decision.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p5-decision-evaluation";

const REQUIRED_DIMENSIONS = [
  "score",
  "confidence",
  "risk",
  "quality",
  "cost",
  "benefit",
  "impact",
  "explainability",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.evaluation.ts",
    "lib/decision/v74/decision.evaluation.catalog.ts",
    "lib/decision/v74/decision.evaluation.builder.ts",
    "lib/decision/v74/decision.evaluation.entry.ts",
    "docs/V74-DECISION-EVALUATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision evaluation catalog module structure");
}

function testInventories() {
  check(EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isDecisionEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const dimension of REQUIRED_DIMENSIONS) {
    check(getEvaluationCatalogEntriesByDimension(dimension).length >= 1, `${dimension} dimension`);
  }
  console.log("✓ evaluations, validations, dimensions & alignment");
}

function testEvaluationFields() {
  for (const ev of EVALUATION_CATALOG_ENTRIES) {
    check(ev.purpose.length > 0, `${ev.id} purpose`);
    check(ev.inputs.length >= 1, `${ev.id} inputs`);
    check(ev.outputs.length >= 1, `${ev.id} outputs`);
    check(ev.metrics.length >= 1, `${ev.id} metrics`);
    check(ev.threshold.length > 0, `${ev.id} threshold`);
    check(ev.priority.length > 0, `${ev.id} priority`);
    check(ev.validation.length > 0, `${ev.id} validation`);
    check(ev.constraintRef.length > 0, `${ev.id} constraintRef`);
    check(ev.contextRef.length > 0, `${ev.id} contextRef`);
  }
  console.log("✓ evaluation field coverage");
}

function testEvaluationQueries() {
  const score = getEvaluationCatalogEntryById("DEC-EVAL-001");
  check(score?.dimension === "score", "DEC-EVAL-001 score");
  check(score?.threshold === "score>=100", "DEC-EVAL-001 threshold");

  const risk = getEvaluationCatalogEntriesByDimension("risk");
  check(risk.length >= 1, "risk dimension");

  const explain = getEvaluationCatalogEntryById("DEC-EVAL-008");
  check(explain?.dimension === "explainability", "DEC-EVAL-008 explainability");

  const validation = getEvaluationValidationByEvaluationRef("DEC-EVAL-003");
  check(validation?.validationKind === "risk", "DEC-EVAL-003 risk validation");

  check(
    computeDeclarativeEvaluationDeclared({
      dimension: "explainability",
      threshold: "explainability=declarative",
    }),
    "explainability declared",
  );
  check(
    !computeDeclarativeEvaluationDeclared({ dimension: "score", threshold: "" }),
    "score empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runDecisionEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildDecisionEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V74_DECISION_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.decisionConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionEvaluationCatalogPass(ready);

  console.log("✓ decision evaluation catalog report");
  console.log(formatDecisionEvaluationCatalogSummary(ready));
  console.log("\n✅ V74 P5 Decision Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V74 P5 Decision Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
