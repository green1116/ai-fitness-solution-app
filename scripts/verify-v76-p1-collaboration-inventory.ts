/**
 * V76 P1 — Collaboration Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_CONSTRAINT_CATALOG,
  COLLABORATION_CONTEXT_CATALOG,
  COLLABORATION_INPUT_CATALOG,
  COLLABORATION_OUTPUT_CATALOG,
  COLLABORATION_POLICY_CATALOG,
  COLLABORATION_SCOPE_CATALOG,
  COLLABORATION_SOURCE_CATALOG,
  COLLABORATION_UPSTREAM_DEPENDENCIES,
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_VERSION,
  assertCollaborationInventoryPass,
  buildCollaborationInventory,
  formatCollaborationInventorySummary,
  getCollaborationInputById,
  getCollaborationPolicyById,
  getCollaborationScopeById,
  getCollaborationSourceById,
  isCollaborationInventoryRefsAligned,
  isCollaborationScopeCoverageComplete,
  isCollaborationUpstreamAligned,
  runCollaborationInventory,
} from "../lib/collaboration/v76/collaboration.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p1-collaboration-inventory";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.types.ts",
    "lib/collaboration/v76/collaboration.inventory.ts",
    "lib/collaboration/v76/collaboration.dependencies.ts",
    "lib/collaboration/v76/collaboration.scope.ts",
    "lib/collaboration/v76/collaboration.entry.ts",
    "docs/V76-COLLABORATION-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration inventory module structure");
}

function testInventories() {
  check(COLLABORATION_INPUT_CATALOG.length >= 6, "collaboration input catalog");
  check(COLLABORATION_OUTPUT_CATALOG.length >= 6, "collaboration output catalog");
  check(COLLABORATION_CONTEXT_CATALOG.length >= 6, "collaboration context catalog");
  check(COLLABORATION_CONSTRAINT_CATALOG.length >= 6, "collaboration constraint catalog");
  check(COLLABORATION_POLICY_CATALOG.length >= 6, "collaboration policy catalog");
  check(COLLABORATION_SOURCE_CATALOG.length >= 6, "collaboration source catalog");
  check(COLLABORATION_SCOPE_CATALOG.length >= 6, "collaboration scope catalog");
  check(COLLABORATION_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isCollaborationInventoryRefsAligned(), "inventory refs aligned");
  check(isCollaborationUpstreamAligned(), "upstream aligned");
  check(isCollaborationScopeCoverageComplete(), "scope coverage complete");
  console.log("✓ inputs, outputs, contexts, constraints, policies, sources & alignment");
}

function testInventoryFields() {
  for (const input of COLLABORATION_INPUT_CATALOG) {
    check(input.name.length > 0, `${input.id} name`);
    check(input.kind.length > 0, `${input.id} kind`);
    check(input.status.length > 0, `${input.id} status`);
    check(input.sourceRef.length > 0, `${input.id} sourceRef`);
    check(input.scopeRef.length > 0, `${input.id} scopeRef`);
  }
  for (const ctx of COLLABORATION_CONTEXT_CATALOG) {
    check(ctx.agentRef.length > 0, `${ctx.id} agentRef`);
  }
  for (const source of COLLABORATION_SOURCE_CATALOG) {
    check(source.upstreamVersion.length > 0, `${source.id} upstreamVersion`);
    check(source.agentRef.length > 0, `${source.id} agentRef`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const input = getCollaborationInputById("COL-INP-001");
  check(input?.kind === "agent", "COL-INP-001 agent kind");
  check(input?.sourceRef === "COL-SRC-001", "COL-INP-001 source ref");

  const source = getCollaborationSourceById("COL-SRC-001");
  check(source?.upstreamVersion === "v75-agent-freeze-1", "COL-SRC-001 upstream freeze");

  const policy = getCollaborationPolicyById("COL-POL-004");
  check(policy?.policyKind === "contract", "COL-POL-004 communication contract policy");

  const scope = getCollaborationScopeById("COL-SCP-008");
  check(scope?.kind === "global", "COL-SCP-008 global scope");

  const roles = COLLABORATION_CONTEXT_CATALOG.find((c) => c.name === "shared-role-context");
  check(roles?.id === "COL-CTX-001", "shared role context");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runCollaborationInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildCollaborationInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_VERSION, "collaboration version");
  check(ready.freezeVersion === V76_COLLABORATION_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.upstreamAgentFreeze === "v75-agent-freeze-1", "upstream freeze");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationInventoryPass(ready);

  console.log("✓ collaboration inventory report");
  console.log(formatCollaborationInventorySummary(ready));
  console.log("\n✅ V76 P1 Collaboration Inventory — verify PASS");
}

function main() {
  console.log("V76 P1 Collaboration Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
