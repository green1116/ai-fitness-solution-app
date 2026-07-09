/**
 * V75 P3 — Agent Context Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_CONTEXT_CATALOG_ENTRIES,
  AGENT_CONTEXT_VALIDATION_CATALOG,
  assertAgentContextCatalogPass,
  buildAgentContextCatalog,
  computeAgentDeclarativeContextValid,
  formatAgentContextCatalogSummary,
  getAgentContextCatalogEntriesByDomain,
  getAgentContextCatalogEntryById,
  getAgentContextValidationByContextRef,
  isAgentContextCatalogRefsAligned,
  runAgentContextCatalog,
  V75_AGENT_CONTEXT_FREEZE_VERSION,
  V75_AGENT_CONTEXT_VERSION,
} from "../lib/agent/v75/agent.context.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p3-agent-context-catalog";

const REQUIRED_DOMAINS = [
  "user",
  "workspace",
  "organization",
  "task",
  "session",
  "orchestration",
  "environment",
  "history",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/agent/v75/agent.context.ts",
    "lib/agent/v75/agent.context.catalog.ts",
    "lib/agent/v75/agent.context.builder.ts",
    "lib/agent/v75/agent.context.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent context catalog module structure");
}

function testInventories() {
  check(AGENT_CONTEXT_CATALOG_ENTRIES.length === 8, "context catalog entries");
  check(AGENT_CONTEXT_VALIDATION_CATALOG.length === 8, "context validation catalog");
  check(isAgentContextCatalogRefsAligned(), "context catalog refs aligned");
  for (const domain of REQUIRED_DOMAINS) {
    check(getAgentContextCatalogEntriesByDomain(domain).length >= 1, `${domain} domain`);
  }
  console.log("✓ contexts, validations, domains & alignment");
}

function testContextFields() {
  for (const ctx of AGENT_CONTEXT_CATALOG_ENTRIES) {
    check(ctx.purpose.length > 0, `${ctx.id} purpose`);
    check(ctx.sourceRef.length > 0, `${ctx.id} sourceRef`);
    check(ctx.lifecycle.length > 0, `${ctx.id} lifecycle`);
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
  const user = getAgentContextCatalogEntryById("AGT-CTX-001");
  check(user?.domain === "user", "AGT-CTX-001 user domain");
  check(user?.priority === "high", "AGT-CTX-001 high priority");
  check(user?.lifecycle === "session", "AGT-CTX-001 session lifecycle");

  const task = getAgentContextCatalogEntriesByDomain("task");
  check(task.length >= 1, "task domain");
  check(task[0]?.inputs.length >= 2, "task domain multiple inputs");

  const session = getAgentContextCatalogEntryById("AGT-CTX-005");
  check(session?.domain === "session", "AGT-CTX-005 session");

  const validation = getAgentContextValidationByContextRef("AGT-CTX-005");
  check(validation?.validationKind === "no-runtime", "AGT-CTX-005 no-runtime validation");

  check(
    computeAgentDeclarativeContextValid({ domain: "session", validationKind: "no-runtime" }),
    "session context valid",
  );
  check(
    !computeAgentDeclarativeContextValid({ domain: "user", validationKind: "user-identity" }),
    "user context not session valid",
  );

  console.log("✓ context queries");
}

function testReport() {
  const incomplete = runAgentContextCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentPolicyCatalogReady: false },
  });
  check(!incomplete.catalogReady, "incomplete policy catalog not ready");

  const ready = buildAgentContextCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_CONTEXT_VERSION, "context catalog version");
  check(ready.freezeVersion === V75_AGENT_CONTEXT_FREEZE_VERSION, "freeze version");
  check(ready.agentPolicyCatalogReady, "P2 policy catalog ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.validations.catalogComplete, "validations complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentContextCatalogPass(ready);

  console.log("✓ agent context catalog report");
  console.log(formatAgentContextCatalogSummary(ready));
  console.log("\n✅ V75 P3 Agent Context Catalog — verify PASS");
}

function main() {
  console.log("V75 P3 Agent Context Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testContextFields();
  testContextQueries();
  testReport();
}

main();
