/**
 * V77 P1 — Planning Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_GOVERNANCE_CATALOG,
  PLANNING_ROLE_CATALOG,
  PLANNING_SCOPE_CATALOG,
  PLANNING_TOPOLOGY_CATALOG,
  PLANNING_UPSTREAM_DEPENDENCIES,
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_VERSION,
  assertPlanningInventoryPass,
  buildPlanningInventory,
  formatPlanningInventorySummary,
  getPlanningGovernanceById,
  getPlanningRoleById,
  getPlanningRolesByKind,
  getPlanningScopeById,
  getPlanningTopologyById,
  isPlanningInventoryRefsAligned,
  isPlanningScopeCoverageComplete,
  isPlanningUpstreamAligned,
  runPlanningInventory,
} from "../lib/planning/v77/planning.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p1-planning-inventory";

const REQUIRED_ROLE_KINDS = [
  "planner",
  "coordinator",
  "executor",
  "reviewer",
  "delegator",
  "governance",
  "topology",
  "workspace",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/planning/v77/planning.types.ts",
    "lib/planning/v77/planning.inventory.ts",
    "lib/planning/v77/planning.dependencies.ts",
    "lib/planning/v77/planning.scope.ts",
    "lib/planning/v77/planning.entry.ts",
    "docs/V77-PLANNING-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning inventory module structure");
}

function testInventories() {
  check(PLANNING_ROLE_CATALOG.length === 8, "planning role catalog");
  check(PLANNING_TOPOLOGY_CATALOG.length === 8, "planning topology catalog");
  check(PLANNING_GOVERNANCE_CATALOG.length === 8, "planning governance catalog");
  check(PLANNING_SCOPE_CATALOG.length >= 6, "planning scope catalog");
  check(PLANNING_UPSTREAM_DEPENDENCIES.length >= 6, "upstream dependencies");
  check(isPlanningInventoryRefsAligned(), "inventory refs aligned");
  check(isPlanningUpstreamAligned(), "upstream aligned");
  check(isPlanningScopeCoverageComplete(), "scope coverage complete");
  for (const kind of REQUIRED_ROLE_KINDS) {
    check(getPlanningRolesByKind(kind).length >= 1, `${kind} role kind`);
  }
  console.log("✓ roles, topology, governance, scopes, dependencies & alignment");
}

function testInventoryFields() {
  for (const role of PLANNING_ROLE_CATALOG) {
    check(role.name.length > 0, `${role.id} name`);
    check(role.kind.length > 0, `${role.id} kind`);
    check(role.scopeRef.length > 0, `${role.id} scopeRef`);
    check(role.topologyRef.length > 0, `${role.id} topologyRef`);
    check(role.collaborationRef.length > 0, `${role.id} collaborationRef`);
  }
  for (const top of PLANNING_TOPOLOGY_CATALOG) {
    check(top.roleRef.length > 0, `${top.id} roleRef`);
    check(top.dependencyRef.length > 0, `${top.id} dependencyRef`);
  }
  for (const gov of PLANNING_GOVERNANCE_CATALOG) {
    check(gov.rule.length > 0, `${gov.id} rule`);
    check(gov.roleRef.length > 0, `${gov.id} roleRef`);
  }
  console.log("✓ inventory field coverage");
}

function testInventoryQueries() {
  const role = getPlanningRoleById("PLN-ROL-001");
  check(role?.kind === "planner", "PLN-ROL-001 planner");
  check(role?.collaborationRef === "COL-CTX-001", "PLN-ROL-001 collaboration ref");

  const topology = getPlanningTopologyById("PLN-TOP-008");
  check(topology?.kind === "boundary", "PLN-TOP-008 boundary");
  check(topology?.dependencyRef === "PLN-DEP-008", "PLN-TOP-008 self dep");

  const governance = getPlanningGovernanceById("PLN-GOV-001");
  check(governance?.kind === "freeze", "PLN-GOV-001 freeze");

  const scope = getPlanningScopeById("PLN-SCP-008");
  check(scope?.kind === "global", "PLN-SCP-008 global scope");

  const dep = PLANNING_UPSTREAM_DEPENDENCIES.find((d) => d.id === "PLN-DEP-001");
  check(dep?.upstreamVersion === "v76-collaboration-freeze-1", "PLN-DEP-001 upstream freeze");

  console.log("✓ inventory queries");
}

function testReport() {
  const incomplete = runPlanningInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete inventory not ready");

  const ready = buildPlanningInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_VERSION, "planning version");
  check(ready.freezeVersion === V77_PLANNING_FREEZE_VERSION, "freeze version");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.upstreamCollaborationFreeze === "v76-collaboration-freeze-1", "upstream freeze");
  check(ready.upstreamCollaborationSignoff === "v76-collaboration-signoff-1", "upstream signoff");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningInventoryPass(ready);

  console.log("✓ planning inventory report");
  console.log(formatPlanningInventorySummary(ready));
  console.log("\n✅ V77 P1 Planning Inventory — verify PASS");
}

function main() {
  console.log("V77 P1 Planning Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testInventoryFields();
  testInventoryQueries();
  testReport();
}

main();
