/**
 * V75 P5 — Agent Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_EVALUATION_CATALOG_ENTRIES,
  AGENT_EVALUATION_VALIDATION_CATALOG,
  assertAgentEvaluationCatalogPass,
  buildAgentEvaluationCatalog,
  computeAgentDeclarativeEvaluationDeclared,
  formatAgentEvaluationCatalogSummary,
  getAgentEvaluationCatalogEntriesByDimension,
  getAgentEvaluationCatalogEntryById,
  getAgentEvaluationValidationByEvaluationRef,
  isAgentEvaluationCatalogRefsAligned,
  runAgentEvaluationCatalog,
  V75_AGENT_EVALUATION_FREEZE_VERSION,
  V75_AGENT_EVALUATION_VERSION,
} from "../lib/agent/v75/agent.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p5-agent-evaluation-catalog";

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
    "lib/agent/v75/agent.evaluation.ts",
    "lib/agent/v75/agent.evaluation.catalog.ts",
    "lib/agent/v75/agent.evaluation.builder.ts",
    "lib/agent/v75/agent.evaluation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent evaluation catalog module structure");
}

function testInventories() {
  check(AGENT_EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(AGENT_EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isAgentEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const dimension of REQUIRED_DIMENSIONS) {
    check(
      getAgentEvaluationCatalogEntriesByDimension(dimension).length >= 1,
      `${dimension} dimension`,
    );
  }
  console.log("✓ evaluations, validations, dimensions & alignment");
}

function testEvaluationFields() {
  for (const ev of AGENT_EVALUATION_CATALOG_ENTRIES) {
    check(ev.purpose.length > 0, `${ev.id} purpose`);
    check(ev.inputs.length >= 1, `${ev.id} inputs`);
    check(ev.outputs.length >= 1, `${ev.id} outputs`);
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
  const score = getAgentEvaluationCatalogEntryById("AGT-EVAL-001");
  check(score?.dimension === "score", "AGT-EVAL-001 score");
  check(score?.threshold === "score>=100", "AGT-EVAL-001 threshold");

  const risk = getAgentEvaluationCatalogEntriesByDimension("risk");
  check(risk.length >= 1, "risk dimension");

  const explain = getAgentEvaluationCatalogEntryById("AGT-EVAL-008");
  check(explain?.dimension === "explainability", "AGT-EVAL-008 explainability");

  const validation = getAgentEvaluationValidationByEvaluationRef("AGT-EVAL-003");
  check(validation?.validationKind === "risk", "AGT-EVAL-003 risk validation");

  check(
    computeAgentDeclarativeEvaluationDeclared({
      dimension: "explainability",
      threshold: "explainability=declarative",
    }),
    "explainability declared",
  );
  check(
    !computeAgentDeclarativeEvaluationDeclared({ dimension: "score", threshold: "" }),
    "score empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runAgentEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildAgentEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V75_AGENT_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.agentConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentEvaluationCatalogPass(ready);

  console.log("✓ agent evaluation catalog report");
  console.log(formatAgentEvaluationCatalogSummary(ready));
  console.log("\n✅ V75 P5 Agent Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V75 P5 Agent Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
