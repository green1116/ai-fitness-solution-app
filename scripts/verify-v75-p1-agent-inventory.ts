/**
 * V75 P1 — Agent Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_CONSTRAINT_CATALOG,
  AGENT_CONTEXT_CATALOG,
  AGENT_INPUT_CATALOG,
  AGENT_OUTPUT_CATALOG,
  AGENT_POLICY_CATALOG,
  AGENT_SCOPE_CATALOG,
  AGENT_SOURCE_CATALOG,
  AGENT_UPSTREAM_DEPENDENCIES,
  assertAgentInventoryPass,
  buildAgentInventory,
  formatAgentInventorySummary,
  getAgentInputById,
  getAgentPolicyById,
  getAgentScopeById,
  getAgentSourceById,
  isAgentInventoryRefsAligned,
  isAgentScopeCoverageComplete,
  isAgentUpstreamAligned,
  runAgentInventory,
  V75_AGENT_FREEZE_VERSION,
  V75_AGENT_VERSION,
} from "../lib/agent/v75/agent.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p1-agent-inventory";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/agent/v75/agent.types.ts",
    "lib/agent/v75/agent.inventory.ts",
    "lib/agent/v75/agent.dependencies.ts",
    "lib/agent/v75/agent.scope.ts",
    "lib/agent/v75/agent.entry.ts",
    "docs/V75-AGENT-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent inventory module structure");
}

function testInventories() {
  check(AGENT_INPUT_CATALOG.length >= 6, "agent input catalog");
  check(AGENT_OUTPUT_CATALOG.length >= 6, "agent output catalog");
  check(AGENT_CONTEXT_CATALOG.length >= 6, "agent context catalog");
  check(AGENT_CONSTRAINT_CATALOG.length >= 6, "agent constraint catalog");
  check(AGENT_POLICY_CATALOG.length >= 6, "agent policy catalog");
  check(AGENT_SOURCE_CATALOG.length >= 6, "agent source catalog");
  check(AGENT_SCOPE_CATALOG.length >= 6, "agent scope catalog");
  check(AGENT_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isAgentInventoryRefsAligned(), "inventory refs aligned");
  check(isAgentUpstreamAligned(), "upstream aligned");
  check(isAgentScopeCoverageComplete(), "scope coverage complete");
  console.log("✓ inputs, outputs, contexts, constraints, policies, sources & alignment");
}

function testInventoryFields() {
  for (const input of AGENT_INPUT_CATALOG) {
    check(input.name.length > 0, `${input.id} name`);
    check(input.kind.length > 0, `${input.id} kind`);
    check(input.status.length > 0, `${input.id} status`);
    check(input.sourceRef.length > 0, `${input.id} sourceRef`);
    check(input.scopeRef.length > 0, `${input.id} scopeRef`);
  }
  for (const output of AGENT_OUTPUT_CATALOG) {
    check(output.kind.length > 0, `${output.id} kind`);
    check(output.status.length > 0, `${output.id} status`);
    check(output.inputRef.length > 0, `${output.id} inputRef`);
  }
  for (const source of AGENT_SOURCE_CATALOG) {
    check(source.upstreamVersion.length > 0, `${source.id} upstreamVersion`);
    check(source.decisionRef.length > 0, `${source.id} decisionRef`);
    check(source.status.length > 0, `${source.id} status`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const input = getAgentInputById("AGT-INP-001");
  check(input?.kind === "decision", "AGT-INP-001 decision kind");
  check(input?.sourceRef === "AGT-SRC-001", "AGT-INP-001 source ref");

  const source = getAgentSourceById("AGT-SRC-001");
  check(source?.upstreamVersion === "v74-decision-freeze-1", "AGT-SRC-001 upstream freeze");

  const policy = getAgentPolicyById("AGT-POL-002");
  check(policy?.policyKind === "upstream", "AGT-POL-002 upstream policy");

  const scope = getAgentScopeById("AGT-SCP-008");
  check(scope?.kind === "global", "AGT-SCP-008 global scope");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runAgentInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildAgentInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V75_AGENT_VERSION, "agent version");
  check(ready.freezeVersion === V75_AGENT_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.manifest.inputs.catalogComplete, "inputs complete");
  check(ready.manifest.outputs.catalogComplete, "outputs complete");
  check(ready.manifest.contexts.catalogComplete, "contexts complete");
  check(ready.manifest.constraints.catalogComplete, "constraints complete");
  check(ready.manifest.policies.catalogComplete, "policies complete");
  check(ready.manifest.sources.catalogComplete, "sources complete");
  check(ready.upstreamDecisionFreeze === "v74-decision-freeze-1", "upstream freeze");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAgentInventoryPass(ready);

  console.log("✓ agent inventory report");
  console.log(formatAgentInventorySummary(ready));
  console.log("\n✅ V75 P1 Agent Inventory — verify PASS");
}

function main() {
  console.log("V75 P1 Agent Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
