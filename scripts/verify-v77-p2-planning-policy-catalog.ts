/**
 * V77 P2 — Planning Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_POLICY_CATALOG_ENTRIES,
  PLANNING_POLICY_GATE_CATALOG,
  V77_PLANNING_POLICY_FREEZE_VERSION,
  V77_PLANNING_POLICY_VERSION,
  assertPlanningPolicyCatalogPass,
  buildPlanningPolicyCatalog,
  computePlanningDeclarativePolicyBlock,
  formatPlanningPolicyCatalogSummary,
  getPlanningPolicyCatalogEntriesByKind,
  getPlanningPolicyCatalogEntryById,
  getPlanningPolicyGateByPolicyRef,
  isPlanningPolicyCatalogRefsAligned,
  runPlanningPolicyCatalog,
} from "../lib/planning/v77/planning.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p2-planning-policy-catalog";

const REQUIRED_KINDS = [
  "role",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
  "compliance",
  "version",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/planning/v77/planning.policy.ts",
    "lib/planning/v77/planning.policy.catalog.ts",
    "lib/planning/v77/planning.policy.builder.ts",
    "lib/planning/v77/planning.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning policy catalog module structure");
}

function testInventories() {
  check(PLANNING_POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(PLANNING_POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isPlanningPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPlanningPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates & alignment");
}

function testPolicyFields() {
  for (const entry of PLANNING_POLICY_CATALOG_ENTRIES) {
    check(entry.passCondition.length > 0, `${entry.id} passCondition`);
    check(entry.blockCondition.length > 0, `${entry.id} blockCondition`);
    check(entry.roleRef.length > 0, `${entry.id} roleRef`);
    check(entry.topologyRef.length > 0, `${entry.id} topologyRef`);
    check(entry.governanceRef.length > 0, `${entry.id} governanceRef`);
    check(entry.dependencyRef.length > 0, `${entry.id} dependencyRef`);
    check(entry.scopeRef.length > 0, `${entry.id} scopeRef`);
    check(entry.enforcement.length > 0, `${entry.id} enforcement`);
    check(entry.priority >= 1 && entry.priority <= 8, `${entry.id} priority`);
  }
  console.log("✓ policy field coverage");
}

function testPolicyQueries() {
  const role = getPlanningPolicyCatalogEntryById("PLN-PLC-002");
  check(role?.kind === "role", "PLN-PLC-002 role");
  check(role?.priority === 2, "PLN-PLC-002 priority 2");

  const topology = getPlanningPolicyCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology policies");

  const gate = getPlanningPolicyGateByPolicyRef("PLN-PLC-007");
  check(gate?.gateKind === "compliance", "PLN-PLC-007 compliance gate");

  check(
    computePlanningDeclarativePolicyBlock({ kind: "boundary", enforcement: "gate" }),
    "boundary gate block",
  );
  check(
    !computePlanningDeclarativePolicyBlock({ kind: "role", enforcement: "declarative" }),
    "role declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runPlanningPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { planningInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildPlanningPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V77_PLANNING_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V77_PLANNING_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.planningInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPlanningPolicyCatalogPass(ready);

  console.log("✓ planning policy catalog report");
  console.log(formatPlanningPolicyCatalogSummary(ready));
  console.log("\n✅ V77 P2 Planning Policy Catalog — verify PASS");
}

function main() {
  console.log("V77 P2 Planning Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
