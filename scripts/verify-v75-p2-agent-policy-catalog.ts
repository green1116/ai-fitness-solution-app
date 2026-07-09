/**
 * V75 P2 — Agent Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_POLICY_CATALOG_ENTRIES,
  AGENT_POLICY_GATE_CATALOG,
  assertAgentPolicyCatalogPass,
  buildAgentPolicyCatalog,
  computeAgentDeclarativePolicyBlock,
  formatAgentPolicyCatalogSummary,
  getAgentPolicyCatalogEntriesByKind,
  getAgentPolicyCatalogEntryById,
  getAgentPolicyGateByPolicyRef,
  isAgentPolicyCatalogRefsAligned,
  runAgentPolicyCatalog,
  V75_AGENT_POLICY_FREEZE_VERSION,
  V75_AGENT_POLICY_VERSION,
} from "../lib/agent/v75/agent.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p2-agent-policy-catalog";

const REQUIRED_KINDS = [
  "safety",
  "business",
  "cost",
  "quality",
  "priority",
  "confidence",
  "fallback",
  "compliance",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/agent/v75/agent.policy.ts",
    "lib/agent/v75/agent.policy.catalog.ts",
    "lib/agent/v75/agent.policy.builder.ts",
    "lib/agent/v75/agent.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent policy catalog module structure");
}

function testInventories() {
  check(AGENT_POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(AGENT_POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isAgentPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getAgentPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates & alignment");
}

function testPolicyFields() {
  for (const entry of AGENT_POLICY_CATALOG_ENTRIES) {
    check(entry.passCondition.length > 0, `${entry.id} passCondition`);
    check(entry.blockCondition.length > 0, `${entry.id} blockCondition`);
    check(entry.inventoryPolicyRef.length > 0, `${entry.id} inventoryPolicyRef`);
    check(entry.inputRef.length > 0, `${entry.id} inputRef`);
    check(entry.scopeRef.length > 0, `${entry.id} scopeRef`);
    check(entry.constraintRef.length > 0, `${entry.id} constraintRef`);
    check(entry.enforcement.length > 0, `${entry.id} enforcement`);
    check(entry.priority >= 1 && entry.priority <= 8, `${entry.id} priority`);
  }
  console.log("✓ policy field coverage");
}

function testPolicyQueries() {
  const safety = getAgentPolicyCatalogEntryById("AGT-PLC-001");
  check(safety?.kind === "safety", "AGT-PLC-001 safety");
  check(safety?.enforcement === "gate", "AGT-PLC-001 gate enforcement");
  check(safety?.priority === 1, "AGT-PLC-001 priority 1");

  const compliance = getAgentPolicyCatalogEntriesByKind("compliance");
  check(compliance.length >= 1, "compliance policies");

  const gate = getAgentPolicyGateByPolicyRef("AGT-PLC-008");
  check(gate?.gateKind === "compliance", "AGT-PLC-008 compliance gate");

  check(
    computeAgentDeclarativePolicyBlock({ kind: "safety", enforcement: "gate" }),
    "safety gate block",
  );
  check(
    !computeAgentDeclarativePolicyBlock({ kind: "business", enforcement: "declarative" }),
    "business declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runAgentPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { agentInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildAgentPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V75_AGENT_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.agentInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentPolicyCatalogPass(ready);

  console.log("✓ agent policy catalog report");
  console.log(formatAgentPolicyCatalogSummary(ready));
  console.log("\n✅ V75 P2 Agent Policy Catalog — verify PASS");
}

function main() {
  console.log("V75 P2 Agent Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
