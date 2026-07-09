/**
 * V76 P3 — Collaboration Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_CONTEXT_CATALOG_ENTRIES,
  COLLABORATION_CONTEXT_VALIDATION_CATALOG,
  V76_COLLABORATION_CONTEXT_FREEZE_VERSION,
  V76_COLLABORATION_CONTEXT_VERSION,
  assertCollaborationContextCatalogPass,
  buildCollaborationContextCatalog,
  computeCollaborationDeclarativeContextValid,
  formatCollaborationContextCatalogSummary,
  getCollaborationContextCatalogEntriesByDomain,
  getCollaborationContextCatalogEntryById,
  getCollaborationContextValidationByContextRef,
  isCollaborationContextCatalogRefsAligned,
  runCollaborationContextCatalog,
} from "../lib/collaboration/v76/collaboration.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p3-collaboration-context-catalog";

const REQUIRED_DOMAINS = [
  "shared",
  "ownership",
  "boundary",
  "lifecycle",
  "readWrite",
  "provenance",
  "governance",
  "workspace",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.context.ts",
    "lib/collaboration/v76/collaboration.context.catalog.ts",
    "lib/collaboration/v76/collaboration.context.builder.ts",
    "lib/collaboration/v76/collaboration.context.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration context catalog module structure");
}

function testInventories() {
  check(COLLABORATION_CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(COLLABORATION_CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isCollaborationContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getCollaborationContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of COLLABORATION_CONTEXT_CATALOG_ENTRIES) {
    check(ctx.purpose.length > 0, `${ctx.id} purpose`);
    check(ctx.sourceRef.length > 0, `${ctx.id} sourceRef`);
    check(ctx.lifecycle.length > 0, `${ctx.id} lifecycle`);
    check(ctx.ownership.length > 0, `${ctx.id} ownership`);
    check(ctx.boundary.length > 0, `${ctx.id} boundary`);
    check(ctx.readWriteRule.length > 0, `${ctx.id} readWriteRule`);
    check(ctx.provenance.length > 0, `${ctx.id} provenance`);
    check(ctx.inputs.length >= 1, `${ctx.id} inputs`);
    check(ctx.outputs.length >= 1, `${ctx.id} outputs`);
    check(ctx.priority.length > 0, `${ctx.id} priority`);
    check(ctx.dependencies.length >= 1, `${ctx.id} dependencies`);
    check(ctx.validation.length > 0, `${ctx.id} validation`);
    check(ctx.inventoryContextRef.length > 0, `${ctx.id} inventoryContextRef`);
    check(ctx.policyRef.length > 0, `${ctx.id} policyRef`);
    check(ctx.scopeRef.length > 0, `${ctx.id} scopeRef`);
  }
  console.log("✓ context field coverage");
}

function testContextQueries() {
  const shared = getCollaborationContextCatalogEntryById("COL-CTX-001");
  check(shared?.domain === "shared", "COL-CTX-001 shared domain");
  check(shared?.ownership === "shared-role-pool", "COL-CTX-001 ownership");

  const readWrite = getCollaborationContextCatalogEntriesByDomain("readWrite");
  check(readWrite.length >= 1, "readWrite domain");
  check(readWrite[0]?.id === "COL-CTX-003", "COL-CTX-003 readWrite domain");

  const workspace = getCollaborationContextCatalogEntryById("COL-CTX-008");
  check(workspace?.domain === "workspace", "COL-CTX-008 workspace");

  const validation = getCollaborationContextValidationByContextRef("COL-CTX-008");
  check(validation?.validationKind === "no-runtime", "COL-CTX-008 no-runtime validation");

  check(
    computeCollaborationDeclarativeContextValid({ domain: "workspace", validationKind: "no-runtime" }),
    "workspace context valid",
  );
  check(
    !computeCollaborationDeclarativeContextValid({ domain: "shared", validationKind: "shared-role" }),
    "shared context not workspace valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runCollaborationContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildCollaborationContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.collaborationPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationContextCatalogPass(ready);

  console.log("✓ collaboration context catalog report");
  console.log(formatCollaborationContextCatalogSummary(ready));
  console.log("\n✅ V76 P3 Collaboration Context Catalog — verify PASS");
}

function main() {
  console.log("V76 P3 Collaboration Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
