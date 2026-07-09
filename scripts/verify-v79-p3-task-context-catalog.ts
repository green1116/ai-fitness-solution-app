/**
 * V79 P3 — Task Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_CONTEXT_CATALOG_ENTRIES,
  TASK_CONTEXT_VALIDATION_CATALOG,
  V79_TASK_CONTEXT_FREEZE_VERSION,
  V79_TASK_CONTEXT_VERSION,
  assertTaskContextCatalogPass,
  buildTaskContextCatalog,
  computeTaskDeclarativeContextValid,
  formatTaskContextCatalogSummary,
  getTaskContextCatalogEntriesByDomain,
  getTaskContextCatalogEntryById,
  getTaskContextValidationByContextRef,
  isTaskContextCatalogRefsAligned,
  runTaskContextCatalog,
} from "../lib/task/v79/task.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p3-task-context-catalog";

const REQUIRED_DOMAINS = [
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
    "lib/task/v79/task.context.ts",
    "lib/task/v79/task.context.catalog.ts",
    "lib/task/v79/task.context.builder.ts",
    "lib/task/v79/task.context.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task context catalog module structure");
}

function testInventories() {
  check(TASK_CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(TASK_CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isTaskContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getTaskContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of TASK_CONTEXT_CATALOG_ENTRIES) {
    check(ctx.purpose.length > 0, `${ctx.id} purpose`);
    check(ctx.lifecycle.length > 0, `${ctx.id} lifecycle`);
    check(ctx.ownership.length > 0, `${ctx.id} ownership`);
    check(ctx.boundary.length > 0, `${ctx.id} boundary`);
    check(ctx.readWriteRule.length > 0, `${ctx.id} readWriteRule`);
    check(ctx.provenance.length > 0, `${ctx.id} provenance`);
    check(ctx.roleRef.length > 0, `${ctx.id} roleRef`);
    check(ctx.stateRef.length > 0, `${ctx.id} stateRef`);
    check(ctx.topologyRef.length > 0, `${ctx.id} topologyRef`);
    check(ctx.governanceRef.length > 0, `${ctx.id} governanceRef`);
    check(ctx.priority.length > 0, `${ctx.id} priority`);
    check(ctx.dependencies.length >= 1, `${ctx.id} dependencies`);
    check(ctx.validation.length > 0, `${ctx.id} validation`);
    check(ctx.inventoryRoleRef.length > 0, `${ctx.id} inventoryRoleRef`);
    check(ctx.policyRef.length > 0, `${ctx.id} policyRef`);
    check(ctx.scopeRef.length > 0, `${ctx.id} scopeRef`);
  }
  console.log("✓ context field coverage");
}

function testContextQueries() {
  const shared = getTaskContextCatalogEntryById("TSK-CTX-001");
  check(shared?.domain === "shared", "TSK-CTX-001 shared domain");
  check(shared?.inventoryRoleRef === "TSK-ROL-001", "TSK-CTX-001 inventory role");

  const state = getTaskContextCatalogEntriesByDomain("state");
  check(state.length >= 1, "state domain");
  check(state[0]?.stateRef === "TSK-STA-004", "state context stateRef");

  const boundary = getTaskContextCatalogEntryById("TSK-CTX-008");
  check(boundary?.domain === "boundary", "TSK-CTX-008 boundary");

  const validation = getTaskContextValidationByContextRef("TSK-CTX-008");
  check(validation?.validationKind === "no-runtime", "TSK-CTX-008 no-runtime validation");

  check(
    computeTaskDeclarativeContextValid({ domain: "boundary", validationKind: "no-runtime" }),
    "boundary context valid",
  );
  check(
    !computeTaskDeclarativeContextValid({ domain: "shared", validationKind: "shared" }),
    "shared context not boundary valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runTaskContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildTaskContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V79_TASK_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.taskPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskContextCatalogPass(ready);

  console.log("✓ task context catalog report");
  console.log(formatTaskContextCatalogSummary(ready));
  console.log("\n✅ V79 P3 Task Context Catalog — verify PASS");
}

function main() {
  console.log("V79 P3 Task Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
