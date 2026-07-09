/**
 * V78 P1 — Execution Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_GOVERNANCE_CATALOG,
  EXECUTION_ROLE_CATALOG,
  EXECUTION_SCOPE_CATALOG,
  EXECUTION_TOPOLOGY_CATALOG,
  EXECUTION_UPSTREAM_DEPENDENCIES,
  V78_EXECUTION_FREEZE_VERSION,
  V78_EXECUTION_VERSION,
  assertExecutionInventoryPass,
  buildExecutionInventory,
  formatExecutionInventorySummary,
  getExecutionGovernanceById,
  getExecutionRoleById,
  getExecutionRolesByKind,
  getExecutionScopeById,
  getExecutionTopologyById,
  isExecutionInventoryRefsAligned,
  isExecutionScopeCoverageComplete,
  isExecutionUpstreamAligned,
  runExecutionInventory,
} from "../lib/execution/v78/execution.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p1-execution-inventory";

const REQUIRED_ROLE_KINDS = [
  "executor",
  "dispatcher",
  "runner",
  "monitor",
  "coordinator",
  "governance",
  "topology",
  "workspace",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/execution/v78/execution.types.ts",
    "lib/execution/v78/execution.inventory.ts",
    "lib/execution/v78/execution.dependencies.ts",
    "lib/execution/v78/execution.scope.ts",
    "lib/execution/v78/execution.entry.ts",
    "docs/V78-EXECUTION-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution inventory module structure");
}

function testInventories() {
  check(EXECUTION_ROLE_CATALOG.length === 8, "execution role catalog");
  check(EXECUTION_TOPOLOGY_CATALOG.length === 8, "execution topology catalog");
  check(EXECUTION_GOVERNANCE_CATALOG.length === 8, "execution governance catalog");
  check(EXECUTION_SCOPE_CATALOG.length >= 6, "execution scope catalog");
  check(EXECUTION_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isExecutionInventoryRefsAligned(), "inventory refs aligned");
  check(isExecutionUpstreamAligned(), "upstream aligned");
  check(isExecutionScopeCoverageComplete(), "scope coverage complete");
  for (const kind of REQUIRED_ROLE_KINDS) {
    check(getExecutionRolesByKind(kind).length >= 1, `${kind} role kind`);
  }
  console.log("✓ roles, topology, governance, scopes, dependencies & alignment");
}

function testInventoryFields() {
  for (const role of EXECUTION_ROLE_CATALOG) {
    check(role.name.length > 0, `${role.id} name`);
    check(role.kind.length > 0, `${role.id} kind`);
    check(role.scopeRef.length > 0, `${role.id} scopeRef`);
    check(role.topologyRef.length > 0, `${role.id} topologyRef`);
    check(role.planningRef.length > 0, `${role.id} planningRef`);
  }
  for (const top of EXECUTION_TOPOLOGY_CATALOG) {
    check(top.roleRef.length > 0, `${top.id} roleRef`);
    check(top.dependencyRef.length > 0, `${top.id} dependencyRef`);
  }
  for (const gov of EXECUTION_GOVERNANCE_CATALOG) {
    check(gov.rule.length > 0, `${gov.id} rule`);
    check(gov.roleRef.length > 0, `${gov.id} roleRef`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const role = getExecutionRoleById("EXE-ROL-001");
  check(role?.kind === "executor", "EXE-ROL-001 executor");
  check(role?.planningRef === "PLN-CTX-001", "EXE-ROL-001 planning ref");

  const topology = getExecutionTopologyById("EXE-TOP-008");
  check(topology?.kind === "boundary", "EXE-TOP-008 boundary");
  check(topology?.dependencyRef === "EXE-DEP-008", "EXE-TOP-008 self dep");

  const governance = getExecutionGovernanceById("EXE-GOV-001");
  check(governance?.kind === "freeze", "EXE-GOV-001 freeze");

  const scope = getExecutionScopeById("EXE-SCP-008");
  check(scope?.kind === "global", "EXE-SCP-008 global scope");

  const dep = EXECUTION_UPSTREAM_DEPENDENCIES.find((d) => d.id === "EXE-DEP-001");
  check(dep?.upstreamVersion === "v77-planning-freeze-1", "EXE-DEP-001 upstream freeze");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runExecutionInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildExecutionInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_VERSION, "execution version");
  check(ready.freezeVersion === V78_EXECUTION_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.upstreamPlanningFreeze === "v77-planning-freeze-1", "upstream freeze");
  check(ready.upstreamPlanningSignoff === "v77-planning-signoff-1", "upstream signoff");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionInventoryPass(ready);

  console.log("✓ execution inventory report");
  console.log(formatExecutionInventorySummary(ready));
  console.log("\n✅ V78 P1 Execution Inventory — verify PASS");
}

function main() {
  console.log("V78 P1 Execution Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
