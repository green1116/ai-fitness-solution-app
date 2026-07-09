/**
 * V74 P3 — Decision Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionContextCatalogPass,
  buildDecisionContextCatalog,
  computeDeclarativeContextValid,
  CONTEXT_CATALOG_ENTRIES,
  CONTEXT_VALIDATION_CATALOG,
  formatDecisionContextCatalogSummary,
  getContextCatalogEntriesByDomain,
  getContextCatalogEntryById,
  getContextValidationByContextRef,
  isDecisionContextCatalogRefsAligned,
  runDecisionContextCatalog,
  V74_DECISION_CONTEXT_FREEZE_VERSION,
  V74_DECISION_CONTEXT_VERSION,
} from "../lib/decision/v74/decision.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p3-decision-context";

const REQUIRED_DOMAINS = [
  "user",
  "workspace",
  "organization",
  "knowledge",
  "runtime",
  "workflow",
  "environment",
  "history",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.context.ts",
    "lib/decision/v74/decision.context.catalog.ts",
    "lib/decision/v74/decision.context.builder.ts",
    "lib/decision/v74/decision.context.entry.ts",
    "docs/V74-DECISION-CONTEXT.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision context catalog module structure");
}

function testInventories() {
  check(CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isDecisionContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of CONTEXT_CATALOG_ENTRIES) {
    check(ctx.purpose.length > 0, `${ctx.id} purpose`);
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
  const user = getContextCatalogEntryById("DEC-CTX-001");
  check(user?.domain === "user", "DEC-CTX-001 user domain");
  check(user?.priority === "high", "DEC-CTX-001 high priority");

  const knowledge = getContextCatalogEntriesByDomain("knowledge");
  check(knowledge.length >= 1, "knowledge domain");
  check(knowledge[0]?.inputs.length >= 2, "knowledge domain multiple inputs");

  const runtime = getContextCatalogEntryById("DEC-CTX-005");
  check(runtime?.domain === "runtime", "DEC-CTX-005 runtime");

  const validation = getContextValidationByContextRef("DEC-CTX-005");
  check(validation?.validationKind === "no-runtime", "DEC-CTX-005 no-runtime validation");

  check(
    computeDeclarativeContextValid({ domain: "runtime", validationKind: "no-runtime" }),
    "runtime context valid",
  );
  check(
    !computeDeclarativeContextValid({ domain: "user", validationKind: "user-identity" }),
    "user context not runtime valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runDecisionContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildDecisionContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V74_DECISION_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.decisionPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionContextCatalogPass(ready);

  console.log("✓ decision context catalog report");
  console.log(formatDecisionContextCatalogSummary(ready));
  console.log("\n✅ V74 P3 Decision Context Catalog — verify PASS");
}

function main() {
  console.log("V74 P3 Decision Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
