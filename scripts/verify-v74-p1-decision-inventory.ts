/**
 * V74 P1 — Decision Engine Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionInventoryPass,
  buildDecisionInventory,
  DECISION_CONSTRAINT_CATALOG,
  DECISION_CONTEXT_CATALOG,
  DECISION_INPUT_CATALOG,
  DECISION_OUTPUT_CATALOG,
  DECISION_POLICY_CATALOG,
  DECISION_SCOPE_CATALOG,
  DECISION_SOURCE_CATALOG,
  DECISION_UPSTREAM_DEPENDENCIES,
  formatDecisionInventorySummary,
  getDecisionInputById,
  getDecisionPolicyById,
  getDecisionScopeById,
  getDecisionSourceById,
  isDecisionInventoryRefsAligned,
  isDecisionScopeCoverageComplete,
  isDecisionUpstreamAligned,
  runDecisionInventory,
  V74_DECISION_FREEZE_VERSION,
  V74_DECISION_VERSION,
} from "../lib/decision/v74/decision.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p1-decision-inventory";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.types.ts",
    "lib/decision/v74/decision.inventory.ts",
    "lib/decision/v74/decision.dependencies.ts",
    "lib/decision/v74/decision.scope.ts",
    "lib/decision/v74/decision.entry.ts",
    "docs/V74-DECISION-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision inventory module structure");
}

function testInventories() {
  check(DECISION_INPUT_CATALOG.length >= 6, "decision input catalog");
  check(DECISION_OUTPUT_CATALOG.length >= 6, "decision output catalog");
  check(DECISION_CONTEXT_CATALOG.length >= 6, "decision context catalog");
  check(DECISION_CONSTRAINT_CATALOG.length >= 6, "decision constraint catalog");
  check(DECISION_POLICY_CATALOG.length >= 6, "decision policy catalog");
  check(DECISION_SOURCE_CATALOG.length >= 6, "decision source catalog");
  check(DECISION_SCOPE_CATALOG.length >= 6, "decision scope catalog");
  check(DECISION_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isDecisionInventoryRefsAligned(), "inventory refs aligned");
  check(isDecisionUpstreamAligned(), "upstream aligned");
  check(isDecisionScopeCoverageComplete(), "scope coverage complete");
  console.log("✓ inputs, outputs, contexts, constraints, policies, sources & alignment");
}

function testInventoryFields() {
  for (const input of DECISION_INPUT_CATALOG) {
    check(input.name.length > 0, `${input.id} name`);
    check(input.kind.length > 0, `${input.id} kind`);
    check(input.sourceRef.length > 0, `${input.id} sourceRef`);
    check(input.scopeRef.length > 0, `${input.id} scopeRef`);
  }
  for (const output of DECISION_OUTPUT_CATALOG) {
    check(output.kind.length > 0, `${output.id} kind`);
    check(output.inputRef.length > 0, `${output.id} inputRef`);
  }
  for (const source of DECISION_SOURCE_CATALOG) {
    check(source.upstreamVersion.length > 0, `${source.id} upstreamVersion`);
    check(source.knowledgeRef.length > 0, `${source.id} knowledgeRef`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const input = getDecisionInputById("DEC-INP-001");
  check(input?.kind === "knowledge", "DEC-INP-001 knowledge kind");
  check(input?.sourceRef === "DEC-SRC-001", "DEC-INP-001 source ref");

  const source = getDecisionSourceById("DEC-SRC-001");
  check(source?.upstreamVersion === "v73-knowledge-freeze-1", "DEC-SRC-001 upstream freeze");

  const policy = getDecisionPolicyById("DEC-POL-002");
  check(policy?.policyKind === "upstream", "DEC-POL-002 upstream policy");

  const scope = getDecisionScopeById("DEC-SCP-008");
  check(scope?.kind === "global", "DEC-SCP-008 global scope");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runDecisionInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildDecisionInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_VERSION, "decision version");
  check(ready.freezeVersion === V74_DECISION_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.manifest.inputs.catalogComplete, "inputs complete");
  check(ready.manifest.outputs.catalogComplete, "outputs complete");
  check(ready.manifest.contexts.catalogComplete, "contexts complete");
  check(ready.manifest.constraints.catalogComplete, "constraints complete");
  check(ready.manifest.policies.catalogComplete, "policies complete");
  check(ready.manifest.sources.catalogComplete, "sources complete");
  check(ready.upstreamKnowledgeFreeze === "v73-knowledge-freeze-1", "upstream freeze");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionInventoryPass(ready);

  console.log("✓ decision inventory report");
  console.log(formatDecisionInventorySummary(ready));
  console.log("\n✅ V74 P1 Decision Engine Inventory — verify PASS");
}

function main() {
  console.log("V74 P1 Decision Engine Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
