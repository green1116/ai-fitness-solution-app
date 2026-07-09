/**
 * V76 P5 — Collaboration Evaluation Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_EVALUATION_CATALOG_ENTRIES,
  COLLABORATION_EVALUATION_VALIDATION_CATALOG,
  V76_COLLABORATION_EVALUATION_FREEZE_VERSION,
  V76_COLLABORATION_EVALUATION_VERSION,
  assertCollaborationEvaluationCatalogPass,
  buildCollaborationEvaluationCatalog,
  computeCollaborationDeclarativeEvaluationDeclared,
  formatCollaborationEvaluationCatalogSummary,
  getCollaborationEvaluationCatalogEntriesByKind,
  getCollaborationEvaluationCatalogEntryById,
  getCollaborationEvaluationValidationByEvaluationRef,
  isCollaborationEvaluationCatalogRefsAligned,
  runCollaborationEvaluationCatalog,
} from "../lib/collaboration/v76/collaboration.evaluation.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p5-collaboration-evaluation-catalog";

const REQUIRED_KINDS = [
  "shared",
  "topology",
  "communication",
  "delegation",
  "coordination",
  "governance",
  "workspace",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.evaluation.ts",
    "lib/collaboration/v76/collaboration.evaluation.catalog.ts",
    "lib/collaboration/v76/collaboration.evaluation.builder.ts",
    "lib/collaboration/v76/collaboration.evaluation.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration evaluation catalog module structure");
}

function testInventories() {
  check(COLLABORATION_EVALUATION_CATALOG_ENTRIES.length === 8, "evaluation catalog entries");
  check(COLLABORATION_EVALUATION_VALIDATION_CATALOG.length === 8, "evaluation validation catalog");
  check(isCollaborationEvaluationCatalogRefsAligned(), "evaluation catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getCollaborationEvaluationCatalogEntriesByKind(kind).length >= 1, `${kind} evaluation kind`);
  }
  console.log("✓ evaluations, validations, kinds & alignment");
}

function testEvaluationFields() {
  for (const ev of COLLABORATION_EVALUATION_CATALOG_ENTRIES) {
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
  const shared = getCollaborationEvaluationCatalogEntryById("COL-EVAL-001");
  check(shared?.kind === "shared", "COL-EVAL-001 shared");
  check(shared?.passRule === "upstream-agent-freeze-intact", "COL-EVAL-001 passRule");

  const topology = getCollaborationEvaluationCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology evaluations");

  const boundary = getCollaborationEvaluationCatalogEntryById("COL-EVAL-008");
  check(boundary?.kind === "boundary", "COL-EVAL-008 boundary");

  const validation = getCollaborationEvaluationValidationByEvaluationRef("COL-EVAL-003");
  check(validation?.validationKind === "communication", "COL-EVAL-003 communication validation");

  check(
    computeCollaborationDeclarativeEvaluationDeclared({
      kind: "boundary",
      threshold: "declarative-only=true",
    }),
    "boundary declared",
  );
  check(
    !computeCollaborationDeclarativeEvaluationDeclared({ kind: "shared", threshold: "" }),
    "shared empty threshold not declared",
  );

  console.log("✓ evaluation queries");
}

function testReport() {
  const incomplete = runCollaborationEvaluationCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationConstraintCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete constraint catalog not ready");

  const ready = buildCollaborationEvaluationCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_EVALUATION_VERSION, "evaluation catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_EVALUATION_FREEZE_VERSION, "freeze version");
  check(ready.collaborationConstraintCatalogReady, "P4 constraint catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationEvaluationCatalogPass(ready);

  console.log("✓ collaboration evaluation catalog report");
  console.log(formatCollaborationEvaluationCatalogSummary(ready));
  console.log("\n✅ V76 P5 Collaboration Evaluation Catalog — verify PASS");
}

function main() {
  console.log("V76 P5 Collaboration Evaluation Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testEvaluationFields();
  testEvaluationQueries();
  testReport();
}

main();
