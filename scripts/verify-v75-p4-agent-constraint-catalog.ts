/**
 * V75 P4 — Agent Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_CONSTRAINT_CATALOG_ENTRIES,
  AGENT_CONSTRAINT_VALIDATION_CATALOG,
  assertAgentConstraintCatalogPass,
  buildAgentConstraintCatalog,
  computeAgentDeclarativeConstraintBlock,
  formatAgentConstraintCatalogSummary,
  getAgentConstraintCatalogEntriesByType,
  getAgentConstraintCatalogEntryById,
  getAgentConstraintValidationByConstraintRef,
  isAgentConstraintCatalogRefsAligned,
  runAgentConstraintCatalog,
  V75_AGENT_CONSTRAINT_FREEZE_VERSION,
  V75_AGENT_CONSTRAINT_VERSION,
} from "../lib/agent/v75/agent.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p4-agent-constraint-catalog";

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
    "lib/agent/v75/agent.constraint.ts",
    "lib/agent/v75/agent.constraint.catalog.ts",
    "lib/agent/v75/agent.constraint.builder.ts",
    "lib/agent/v75/agent.constraint.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent constraint catalog module structure");
}

function testInventories() {
  check(AGENT_CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(AGENT_CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isAgentConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const type of REQUIRED_TYPES) {
    check(getAgentConstraintCatalogEntriesByType(type).length >= 1, `${type} constraint type`);
  }
  console.log("✓ constraints, validations, types & alignment");
}

function testConstraintFields() {
  for (const con of AGENT_CONSTRAINT_CATALOG_ENTRIES) {
    check(con.purpose.length > 0, `${con.id} purpose`);
    check(con.scopeRef.length > 0, `${con.id} scopeRef`);
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
  const hard = getAgentConstraintCatalogEntryById("AGT-CON-001");
  check(hard?.type === "hardRule", "AGT-CON-001 hardRule");
  check(hard?.level === "critical", "AGT-CON-001 critical level");

  const dependency = getAgentConstraintCatalogEntriesByType("dependency");
  check(dependency.length >= 1, "dependency constraints");

  const precondition = getAgentConstraintCatalogEntryById("AGT-CON-007");
  check(precondition?.type === "precondition", "AGT-CON-007 precondition");

  const validation = getAgentConstraintValidationByConstraintRef("AGT-CON-001");
  check(validation?.validationKind === "hard-rule", "AGT-CON-001 hard-rule validation");

  check(
    computeAgentDeclarativeConstraintBlock({ type: "hardRule", level: "critical" }),
    "hardRule critical block",
  );
  check(
    !computeAgentDeclarativeConstraintBlock({ type: "softRule", level: "L2" }),
    "softRule L2 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runAgentConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildAgentConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V75_AGENT_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.agentContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentConstraintCatalogPass(ready);

  console.log("✓ agent constraint catalog report");
  console.log(formatAgentConstraintCatalogSummary(ready));
  console.log("\n✅ V75 P4 Agent Constraint Catalog — verify PASS");
}

function main() {
  console.log("V75 P4 Agent Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
