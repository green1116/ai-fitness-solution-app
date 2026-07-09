/**
 * V80 P1 — System Meta-Orchestration Inventory Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  SYSTEM_CROSS_LAYER_MAP,
  SYSTEM_GOVERNANCE_CATALOG,
  SYSTEM_ROLE_CATALOG,
  SYSTEM_SCOPE_CATALOG,
  SYSTEM_STACK_DEPENDENCIES,
  SYSTEM_TOPOLOGY_CATALOG,
  V80_SYSTEM_FREEZE_VERSION,
  V80_SYSTEM_VERSION,
  assertSystemInventoryPass,
  buildSystemInventory,
  formatSystemInventorySummary,
  getCrossLayerEntry,
  getSystemDependenciesByLayer,
  getSystemGovernanceById,
  getSystemRoleById,
  getSystemRolesByKind,
  getSystemScopeById,
  getSystemTopologyById,
  isSystemCrossLayerMapComplete,
  isSystemInventoryRefsAligned,
  isSystemScopeCoverageComplete,
  isSystemStackUpstreamAligned,
  runSystemInventory,
} from "../lib/system/v80/system.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v80-p1-system-meta-inventory";

const REQUIRED_ROLE_KINDS = [
  "collaboration",
  "planning",
  "execution",
  "task",
  "meta",
  "coordinator",
  "governance",
  "boundary",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/system/v80/system.types.ts",
    "lib/system/v80/system.inventory.ts",
    "lib/system/v80/system.crosslayer.ts",
    "lib/system/v80/system.dependencies.ts",
    "lib/system/v80/system.scope.ts",
    "lib/system/v80/system.entry.ts",
    "docs/V80-SYSTEM-META-INVENTORY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V80 system meta inventory module structure");
}

function testInventories() {
  check(SYSTEM_ROLE_CATALOG.length === 8, "system role catalog");
  check(SYSTEM_TOPOLOGY_CATALOG.length === 8, "system topology catalog");
  check(SYSTEM_GOVERNANCE_CATALOG.length === 8, "system governance catalog");
  check(SYSTEM_SCOPE_CATALOG.length >= 6, "system scope catalog");
  check(SYSTEM_STACK_DEPENDENCIES.length === 8, "stack dependencies");
  check(SYSTEM_CROSS_LAYER_MAP.length === 4, "cross-layer map V76–V79");
  check(isSystemInventoryRefsAligned(), "inventory refs aligned");
  check(isSystemStackUpstreamAligned(), "stack upstream aligned");
  check(isSystemScopeCoverageComplete(), "scope coverage complete");
  check(isSystemCrossLayerMapComplete(), "cross-layer map complete");
  for (const kind of REQUIRED_ROLE_KINDS) {
    check(getSystemRolesByKind(kind).length >= 1, `${kind} role kind`);
  }
  console.log("✓ roles, topology, governance, scopes, dependencies & cross-layer map");
}

function testCrossLayerMap() {
  const v76 = getCrossLayerEntry("V76");
  check(v76?.signoffVersion === "v76-collaboration-signoff-1", "V76 signoff");
  check(v76?.freezeVersion === "v76-collaboration-freeze-1", "V76 freeze");
  const v79 = getCrossLayerEntry("V79");
  check(v79?.domain === "task", "V79 domain");
  check(getSystemDependenciesByLayer("V78").length >= 2, "V78 deps");
  console.log("✓ cross-layer map V76–V79");
}

function testInventoryFields() {
  for (const role of SYSTEM_ROLE_CATALOG) {
    check(role.layerRef.length > 0, `${role.id} layerRef`);
    check(role.layerSignoffRef.length > 0, `${role.id} layerSignoffRef`);
  }
  for (const gov of SYSTEM_GOVERNANCE_CATALOG) {
    check(gov.rule.length > 0, `${gov.id} rule`);
  }
  const scope = getSystemScopeById("SYS-SCP-002");
  check(scope?.kind === "stack", "stack scope");
  console.log("✓ inventory field coverage");
}

function testReport() {
  const incomplete = runSystemInventory({
    deploymentId: DEPLOYMENT_ID,
    signals: { inventoryComplete: false },
  });
  check(!incomplete.inventoryReady, "incomplete not ready");

  const ready = buildSystemInventory({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V80_SYSTEM_VERSION, "system version");
  check(ready.freezeVersion === V80_SYSTEM_FREEZE_VERSION, "freeze version");
  check(ready.stackLayers.length === 4, "four stack layers");
  check(ready.manifest.inventoryComplete, "manifest complete");
  check(ready.inventoryReady, "inventory ready");
  check(ready.readinessScore === 100, "readiness 100");
  assertSystemInventoryPass(ready);

  const role = getSystemRoleById("SYS-ROL-004");
  check(role?.layerRef === "V79", "V79 bridge role");
  const topology = getSystemTopologyById("SYS-TOP-008");
  check(topology?.kind === "boundary", "boundary topology");
  const gov = getSystemGovernanceById("SYS-GOV-008");
  check(gov?.rule === "declarative-only-no-runtime", "boundary gov rule");

  console.log("✓ system meta inventory report");
  console.log(formatSystemInventorySummary(ready));
  console.log("\n✅ V80 P1 System Meta-Orchestration Inventory — verify PASS");
}

function main() {
  console.log("V80 P1 System Meta-Orchestration Inventory Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossLayerMap();
  testInventoryFields();
  testReport();
}

main();
