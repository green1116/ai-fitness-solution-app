/**
 * V78 P3 — Execution Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_CONTEXT_CATALOG_ENTRIES,
  EXECUTION_CONTEXT_VALIDATION_CATALOG,
  V78_EXECUTION_CONTEXT_FREEZE_VERSION,
  V78_EXECUTION_CONTEXT_VERSION,
  assertExecutionContextCatalogPass,
  buildExecutionContextCatalog,
  computeExecutionDeclarativeContextValid,
  formatExecutionContextCatalogSummary,
  getExecutionContextCatalogEntriesByDomain,
  getExecutionContextCatalogEntryById,
  getExecutionContextValidationByContextRef,
  isExecutionContextCatalogRefsAligned,
  runExecutionContextCatalog,
} from "../lib/execution/v78/execution.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p3-execution-context-catalog";

const REQUIRED_DOMAINS = [
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
    "lib/execution/v78/execution.context.ts",
    "lib/execution/v78/execution.context.catalog.ts",
    "lib/execution/v78/execution.context.builder.ts",
    "lib/execution/v78/execution.context.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution context catalog module structure");
}

function testInventories() {
  check(EXECUTION_CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(EXECUTION_CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isExecutionContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getExecutionContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of EXECUTION_CONTEXT_CATALOG_ENTRIES) {
    check(ctx.purpose.length > 0, `${ctx.id} purpose`);
    check(ctx.lifecycle.length > 0, `${ctx.id} lifecycle`);
    check(ctx.ownership.length > 0, `${ctx.id} ownership`);
    check(ctx.boundary.length > 0, `${ctx.id} boundary`);
    check(ctx.readWriteRule.length > 0, `${ctx.id} readWriteRule`);
    check(ctx.provenance.length > 0, `${ctx.id} provenance`);
    check(ctx.roleRef.length > 0, `${ctx.id} roleRef`);
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
  const shared = getExecutionContextCatalogEntryById("EXE-CTX-001");
  check(shared?.domain === "shared", "EXE-CTX-001 shared domain");
  check(shared?.inventoryRoleRef === "EXE-ROL-001", "EXE-CTX-001 inventory role");

  const topology = getExecutionContextCatalogEntriesByDomain("topology");
  check(topology.length >= 1, "topology domain");

  const boundary = getExecutionContextCatalogEntryById("EXE-CTX-008");
  check(boundary?.domain === "boundary", "EXE-CTX-008 boundary");

  const validation = getExecutionContextValidationByContextRef("EXE-CTX-008");
  check(validation?.validationKind === "no-runtime", "EXE-CTX-008 no-runtime validation");

  check(
    computeExecutionDeclarativeContextValid({ domain: "boundary", validationKind: "no-runtime" }),
    "boundary context valid",
  );
  check(
    !computeExecutionDeclarativeContextValid({ domain: "shared", validationKind: "shared" }),
    "shared context not boundary valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runExecutionContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildExecutionContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V78_EXECUTION_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.executionPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionContextCatalogPass(ready);

  console.log("✓ execution context catalog report");
  console.log(formatExecutionContextCatalogSummary(ready));
  console.log("\n✅ V78 P3 Execution Context Catalog — verify PASS");
}

function main() {
  console.log("V78 P3 Execution Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
