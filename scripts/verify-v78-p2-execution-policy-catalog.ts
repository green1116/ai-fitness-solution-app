/**
 * V78 P2 — Execution Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_POLICY_CATALOG_ENTRIES,
  EXECUTION_POLICY_GATE_CATALOG,
  V78_EXECUTION_POLICY_FREEZE_VERSION,
  V78_EXECUTION_POLICY_VERSION,
  assertExecutionPolicyCatalogPass,
  buildExecutionPolicyCatalog,
  computeExecutionDeclarativePolicyBlock,
  formatExecutionPolicyCatalogSummary,
  getExecutionPolicyCatalogEntriesByKind,
  getExecutionPolicyCatalogEntryById,
  getExecutionPolicyGateByPolicyRef,
  isExecutionPolicyCatalogRefsAligned,
  runExecutionPolicyCatalog,
} from "../lib/execution/v78/execution.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p2-execution-policy-catalog";

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
    "lib/execution/v78/execution.policy.ts",
    "lib/execution/v78/execution.policy.catalog.ts",
    "lib/execution/v78/execution.policy.builder.ts",
    "lib/execution/v78/execution.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution policy catalog module structure");
}

function testInventories() {
  check(EXECUTION_POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(EXECUTION_POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isExecutionPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getExecutionPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates & alignment");
}

function testPolicyFields() {
  for (const entry of EXECUTION_POLICY_CATALOG_ENTRIES) {
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
  const role = getExecutionPolicyCatalogEntryById("EXE-PLC-002");
  check(role?.kind === "role", "EXE-PLC-002 role");
  check(role?.priority === 2, "EXE-PLC-002 priority 2");

  const topology = getExecutionPolicyCatalogEntriesByKind("topology");
  check(topology.length >= 1, "topology policies");

  const gate = getExecutionPolicyGateByPolicyRef("EXE-PLC-007");
  check(gate?.gateKind === "compliance", "EXE-PLC-007 compliance gate");

  check(
    computeExecutionDeclarativePolicyBlock({ kind: "boundary", enforcement: "gate" }),
    "boundary gate block",
  );
  check(
    !computeExecutionDeclarativePolicyBlock({ kind: "role", enforcement: "declarative" }),
    "role declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runExecutionPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { executionInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildExecutionPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V78_EXECUTION_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V78_EXECUTION_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.executionInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertExecutionPolicyCatalogPass(ready);

  console.log("✓ execution policy catalog report");
  console.log(formatExecutionPolicyCatalogSummary(ready));
  console.log("\n✅ V78 P2 Execution Policy Catalog — verify PASS");
}

function main() {
  console.log("V78 P2 Execution Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
