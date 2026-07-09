/**
 * V79 P1 — Task Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_GOVERNANCE_CATALOG,
  TASK_ROLE_CATALOG,
  TASK_SCOPE_CATALOG,
  TASK_STATE_CATALOG,
  TASK_TOPOLOGY_CATALOG,
  TASK_UPSTREAM_DEPENDENCIES,
  V79_TASK_FREEZE_VERSION,
  V79_TASK_VERSION,
  assertTaskInventoryPass,
  buildTaskInventory,
  formatTaskInventorySummary,
  getTaskGovernanceById,
  getTaskRoleById,
  getTaskRolesByKind,
  getTaskScopeById,
  getTaskStateById,
  getTaskStatesByKind,
  getTaskTopologyById,
  isTaskInventoryRefsAligned,
  isTaskScopeCoverageComplete,
  isTaskStateCoverageComplete,
  isTaskUpstreamAligned,
  runTaskInventory,
} from "../lib/task/v79/task.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p1-task-inventory";

const REQUIRED_ROLE_KINDS = [
  "creator",
  "assigner",
  "executor",
  "monitor",
  "coordinator",
  "governance",
  "topology",
  "boundary",
] as const;

const REQUIRED_STATE_KINDS = [
  "draft",
  "pending",
  "queued",
  "active",
  "blocked",
  "completed",
  "cancelled",
  "frozen",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/task.types.ts",
    "lib/task/v79/task.inventory.ts",
    "lib/task/v79/task.state.ts",
    "lib/task/v79/task.dependencies.ts",
    "lib/task/v79/task.scope.ts",
    "lib/task/v79/task.entry.ts",
    "docs/V79-TASK-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task inventory module structure");
}

function testInventories() {
  check(TASK_ROLE_CATALOG.length === 8, "task role catalog");
  check(TASK_STATE_CATALOG.length === 8, "task state catalog");
  check(TASK_TOPOLOGY_CATALOG.length === 8, "task topology catalog");
  check(TASK_GOVERNANCE_CATALOG.length === 8, "task governance catalog");
  check(TASK_SCOPE_CATALOG.length >= 6, "task scope catalog");
  check(TASK_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isTaskInventoryRefsAligned(), "inventory refs aligned");
  check(isTaskUpstreamAligned(), "upstream aligned");
  check(isTaskScopeCoverageComplete(), "scope coverage complete");
  check(isTaskStateCoverageComplete(), "state coverage complete");
  for (const kind of REQUIRED_ROLE_KINDS) {
    check(getTaskRolesByKind(kind).length >= 1, `${kind} role kind`);
  }
  for (const kind of REQUIRED_STATE_KINDS) {
    check(getTaskStatesByKind(kind).length >= 1, `${kind} state kind`);
  }
  console.log("✓ roles, states, topology, governance, scopes, dependencies & alignment");
}

function testInventoryFields() {
  for (const role of TASK_ROLE_CATALOG) {
    check(role.name.length > 0, `${role.id} name`);
    check(role.kind.length > 0, `${role.id} kind`);
    check(role.scopeRef.length > 0, `${role.id} scopeRef`);
    check(role.topologyRef.length > 0, `${role.id} topologyRef`);
    check(role.executionRef.length > 0, `${role.id} executionRef`);
  }
  for (const state of TASK_STATE_CATALOG) {
    check(state.transitionRule.length > 0, `${state.id} transitionRule`);
    check(state.roleRef.length > 0, `${state.id} roleRef`);
    check(state.scopeRef.length > 0, `${state.id} scopeRef`);
  }
  for (const top of TASK_TOPOLOGY_CATALOG) {
    check(top.roleRef.length > 0, `${top.id} roleRef`);
    check(top.dependencyRef.length > 0, `${top.id} dependencyRef`);
  }
  for (const gov of TASK_GOVERNANCE_CATALOG) {
    check(gov.rule.length > 0, `${gov.id} rule`);
    check(gov.roleRef.length > 0, `${gov.id} roleRef`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const role = getTaskRoleById("TSK-ROL-001");
  check(role?.kind === "creator", "TSK-ROL-001 creator");
  check(role?.executionRef === "EXE-ROL-001", "TSK-ROL-001 execution ref");

  const state = getTaskStateById("TSK-STA-008");
  check(state?.kind === "frozen", "TSK-STA-008 frozen");
  check(state?.roleRef === "TSK-ROL-008", "TSK-STA-008 role ref");

  const topology = getTaskTopologyById("TSK-TOP-008");
  check(topology?.kind === "boundary", "TSK-TOP-008 boundary");
  check(topology?.dependencyRef === "TSK-DEP-008", "TSK-TOP-008 self dep");

  const governance = getTaskGovernanceById("TSK-GOV-001");
  check(governance?.kind === "freeze", "TSK-GOV-001 freeze");

  const scope = getTaskScopeById("TSK-SCP-008");
  check(scope?.kind === "global", "TSK-SCP-008 global scope");

  const dep = TASK_UPSTREAM_DEPENDENCIES.find((d) => d.id === "TSK-DEP-001");
  check(dep?.upstreamVersion === "v78-execution-freeze-1", "TSK-DEP-001 upstream freeze");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runTaskInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildTaskInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_VERSION, "task version");
  check(ready.freezeVersion === V79_TASK_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.upstreamExecutionFreeze === "v78-execution-freeze-1", "upstream freeze");
  check(ready.upstreamExecutionSignoff === "v78-execution-signoff-1", "upstream signoff");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskInventoryPass(ready);

  console.log("✓ task inventory report");
  console.log(formatTaskInventorySummary(ready));
  console.log("\n✅ V79 P1 Task Inventory — verify PASS");
}

function main() {
  console.log("V79 P1 Task Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
