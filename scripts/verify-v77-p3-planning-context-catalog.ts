/**
 * V77 P3 — Planning Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_CONTEXT_CATALOG_ENTRIES,
  PLANNING_CONTEXT_VALIDATION_CATALOG,
  V77_PLANNING_CONTEXT_FREEZE_VERSION,
  V77_PLANNING_CONTEXT_VERSION,
  assertPlanningContextCatalogPass,
  buildPlanningContextCatalog,
  computePlanningDeclarativeContextValid,
  formatPlanningContextCatalogSummary,
  getPlanningContextCatalogEntriesByDomain,
  getPlanningContextCatalogEntryById,
  getPlanningContextValidationByContextRef,
  isPlanningContextCatalogRefsAligned,
  runPlanningContextCatalog,
} from "../lib/planning/v77/planning.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p3-planning-context-catalog";

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
    "lib/planning/v77/planning.context.ts",
    "lib/planning/v77/planning.context.catalog.ts",
    "lib/planning/v77/planning.context.builder.ts",
    "lib/planning/v77/planning.context.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning context catalog module structure");
}

function testInventories() {
  check(PLANNING_CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(PLANNING_CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isPlanningContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getPlanningContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of PLANNING_CONTEXT_CATALOG_ENTRIES) {
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
  const shared = getPlanningContextCatalogEntryById("PLN-CTX-001");
  check(shared?.domain === "shared", "PLN-CTX-001 shared domain");
  check(shared?.inventoryRoleRef === "PLN-ROL-001", "PLN-CTX-001 inventory role");

  const topology = getPlanningContextCatalogEntriesByDomain("topology");
  check(topology.length >= 1, "topology domain");

  const boundary = getPlanningContextCatalogEntryById("PLN-CTX-008");
  check(boundary?.domain === "boundary", "PLN-CTX-008 boundary");

  const validation = getPlanningContextValidationByContextRef("PLN-CTX-008");
  check(validation?.validationKind === "no-runtime", "PLN-CTX-008 no-runtime validation");

  check(
    computePlanningDeclarativeContextValid({ domain: "boundary", validationKind: "no-runtime" }),
    "boundary context valid",
  );
  check(
    !computePlanningDeclarativeContextValid({ domain: "shared", validationKind: "shared" }),
    "shared context not boundary valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runPlanningContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildPlanningContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V77_PLANNING_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.planningPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningContextCatalogPass(ready);

  console.log("✓ planning context catalog report");
  console.log(formatPlanningContextCatalogSummary(ready));
  console.log("\n✅ V77 P3 Planning Context Catalog — verify PASS");
}

function main() {
  console.log("V77 P3 Planning Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
