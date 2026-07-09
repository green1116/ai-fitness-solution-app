/**
 * V77 P4 — Planning Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_CONSTRAINT_CATALOG_ENTRIES,
  PLANNING_CONSTRAINT_VALIDATION_CATALOG,
  V77_PLANNING_CONSTRAINT_FREEZE_VERSION,
  V77_PLANNING_CONSTRAINT_VERSION,
  assertPlanningConstraintCatalogPass,
  buildPlanningConstraintCatalog,
  computePlanningDeclarativeConstraintBlock,
  formatPlanningConstraintCatalogSummary,
  getPlanningConstraintCatalogEntriesByKind,
  getPlanningConstraintCatalogEntryById,
  getPlanningConstraintValidationByConstraintRef,
  isPlanningConstraintCatalogRefsAligned,
  runPlanningConstraintCatalog,
} from "../lib/planning/v77/planning.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p4-planning-constraint-catalog";

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
    "lib/planning/v77/planning.constraint.ts",
    "lib/planning/v77/planning.constraint.catalog.ts",
    "lib/planning/v77/planning.constraint.builder.ts",
    "lib/planning/v77/planning.constraint.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning constraint catalog module structure");
}

function testInventories() {
  check(PLANNING_CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(PLANNING_CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isPlanningConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPlanningConstraintCatalogEntriesByKind(kind).length >= 1, `${kind} constraint kind`);
  }
  console.log("✓ constraints, validations, kinds & alignment");
}

function testConstraintFields() {
  for (const con of PLANNING_CONSTRAINT_CATALOG_ENTRIES) {
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
  const shared = getPlanningConstraintCatalogEntryById("PLN-CON-001");
  check(shared?.kind === "shared", "PLN-CON-001 shared");
  check(shared?.inventoryGovernanceRef === "PLN-GOV-001", "PLN-CON-001 governance ref");

  const topology = getPlanningConstraintCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology constraints");

  const boundary = getPlanningConstraintCatalogEntryById("PLN-CON-008");
  check(boundary?.kind === "boundary", "PLN-CON-008 boundary");
  check(boundary?.level === "critical", "PLN-CON-008 critical level");

  const validation = getPlanningConstraintValidationByConstraintRef("PLN-CON-008");
  check(validation?.validationKind === "boundary", "PLN-CON-008 boundary validation");

  check(
    computePlanningDeclarativeConstraintBlock({ kind: "boundary", level: "critical" }),
    "boundary critical block",
  );
  check(
    !computePlanningDeclarativeConstraintBlock({ kind: "shared", level: "L1" }),
    "shared L1 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runPlanningConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildPlanningConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V77_PLANNING_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.planningContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningConstraintCatalogPass(ready);

  console.log("✓ planning constraint catalog report");
  console.log(formatPlanningConstraintCatalogSummary(ready));
  console.log("\n✅ V77 P4 Planning Constraint Catalog — verify PASS");
}

function main() {
  console.log("V77 P4 Planning Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
