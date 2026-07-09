/**
 * V76 P4 — Collaboration Constraint Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_CONSTRAINT_CATALOG_ENTRIES,
  COLLABORATION_CONSTRAINT_VALIDATION_CATALOG,
  V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION,
  V76_COLLABORATION_CONSTRAINT_VERSION,
  assertCollaborationConstraintCatalogPass,
  buildCollaborationConstraintCatalog,
  computeCollaborationDeclarativeConstraintBlock,
  formatCollaborationConstraintCatalogSummary,
  getCollaborationConstraintCatalogEntriesByKind,
  getCollaborationConstraintCatalogEntryById,
  getCollaborationConstraintValidationByConstraintRef,
  isCollaborationConstraintCatalogRefsAligned,
  runCollaborationConstraintCatalog,
} from "../lib/collaboration/v76/collaboration.constraint.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p4-collaboration-constraint-catalog";

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
    "lib/collaboration/v76/collaboration.constraint.ts",
    "lib/collaboration/v76/collaboration.constraint.catalog.ts",
    "lib/collaboration/v76/collaboration.constraint.builder.ts",
    "lib/collaboration/v76/collaboration.constraint.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration constraint catalog module structure");
}

function testInventories() {
  check(COLLABORATION_CONSTRAINT_CATALOG_ENTRIES.length === 8, "constraint catalog entries");
  check(COLLABORATION_CONSTRAINT_VALIDATION_CATALOG.length === 8, "constraint validation catalog");
  check(isCollaborationConstraintCatalogRefsAligned(), "constraint catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getCollaborationConstraintCatalogEntriesByKind(kind).length >= 1, `${kind} constraint kind`);
  }
  console.log("✓ constraints, validations, kinds & alignment");
}

function testConstraintFields() {
  for (const con of COLLABORATION_CONSTRAINT_CATALOG_ENTRIES) {
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
  const shared = getCollaborationConstraintCatalogEntryById("COL-CON-001");
  check(shared?.kind === "shared", "COL-CON-001 shared");
  check(shared?.inventoryConstraintRef === "COL-CST-002", "COL-CON-001 inventory ref");

  const topology = getCollaborationConstraintCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology constraints");

  const boundary = getCollaborationConstraintCatalogEntryById("COL-CON-008");
  check(boundary?.kind === "boundary", "COL-CON-008 boundary");
  check(boundary?.level === "critical", "COL-CON-008 critical level");

  const validation = getCollaborationConstraintValidationByConstraintRef("COL-CON-008");
  check(validation?.validationKind === "boundary", "COL-CON-008 boundary validation");

  check(
    computeCollaborationDeclarativeConstraintBlock({ kind: "boundary", level: "critical" }),
    "boundary critical block",
  );
  check(
    !computeCollaborationDeclarativeConstraintBlock({ kind: "shared", level: "L1" }),
    "shared L1 no block",
  );

  console.log("✓ constraint queries");
}

function testReport() {
  const incomplete = runCollaborationConstraintCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationContextCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete context catalog not ready");

  const ready = buildCollaborationConstraintCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_CONSTRAINT_VERSION, "constraint catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_CONSTRAINT_FREEZE_VERSION, "freeze version");
  check(ready.collaborationContextCatalogReady, "P3 context catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationConstraintCatalogPass(ready);

  console.log("✓ collaboration constraint catalog report");
  console.log(formatCollaborationConstraintCatalogSummary(ready));
  console.log("\n✅ V76 P4 Collaboration Constraint Catalog — verify PASS");
}

function main() {
  console.log("V76 P4 Collaboration Constraint Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testConstraintFields();
  testConstraintQueries();
  testReport();
}

main();
