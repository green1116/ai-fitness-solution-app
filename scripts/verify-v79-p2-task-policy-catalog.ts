/**
 * V79 P2 — Task Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  TASK_POLICY_CATALOG_ENTRIES,
  TASK_POLICY_GATE_CATALOG,
  V79_TASK_POLICY_FREEZE_VERSION,
  V79_TASK_POLICY_VERSION,
  assertTaskPolicyCatalogPass,
  buildTaskPolicyCatalog,
  computeTaskDeclarativePolicyBlock,
  formatTaskPolicyCatalogSummary,
  getTaskPolicyCatalogEntriesByKind,
  getTaskPolicyCatalogEntryById,
  getTaskPolicyGateByPolicyRef,
  isTaskPolicyCatalogRefsAligned,
  runTaskPolicyCatalog,
} from "../lib/task/v79/task.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p2-task-policy-catalog";

const REQUIRED_KINDS = [
  "role",
  "state",
  "topology",
  "scope",
  "dependency",
  "governance",
  "boundary",
  "version",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/task.policy.ts",
    "lib/task/v79/task.policy.catalog.ts",
    "lib/task/v79/task.policy.builder.ts",
    "lib/task/v79/task.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task policy catalog module structure");
}

function testInventories() {
  check(TASK_POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(TASK_POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isTaskPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getTaskPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates, kinds & alignment");
}

function testPolicyFields() {
  for (const entry of TASK_POLICY_CATALOG_ENTRIES) {
    check(entry.passCondition.length > 0, `${entry.id} passCondition`);
    check(entry.blockCondition.length > 0, `${entry.id} blockCondition`);
    check(entry.roleRef.length > 0, `${entry.id} roleRef`);
    check(entry.stateRef.length > 0, `${entry.id} stateRef`);
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
  const role = getTaskPolicyCatalogEntryById("TSK-PLC-002");
  check(role?.kind === "role", "TSK-PLC-002 role");
  check(role?.priority === 2, "TSK-PLC-002 priority 2");

  const state = getTaskPolicyCatalogEntriesByKind("state");
  check(state.length >= 1, "state policies");
  check(state[0]?.stateRef === "TSK-STA-004", "state policy stateRef");

  const gate = getTaskPolicyGateByPolicyRef("TSK-PLC-003");
  check(gate?.gateKind === "state", "TSK-PLC-003 state gate");

  check(
    computeTaskDeclarativePolicyBlock({ kind: "boundary", enforcement: "gate" }),
    "boundary gate block",
  );
  check(
    !computeTaskDeclarativePolicyBlock({ kind: "role", enforcement: "declarative" }),
    "role declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runTaskPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { taskInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildTaskPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V79_TASK_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V79_TASK_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.taskInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTaskPolicyCatalogPass(ready);

  console.log("✓ task policy catalog report");
  console.log(formatTaskPolicyCatalogSummary(ready));
  console.log("\n✅ V79 P2 Task Policy Catalog — verify PASS");
}

function main() {
  console.log("V79 P2 Task Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
