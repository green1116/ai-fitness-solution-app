/**
 * V76 P2 — Collaboration Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_POLICY_CATALOG_ENTRIES,
  COLLABORATION_POLICY_GATE_CATALOG,
  V76_COLLABORATION_POLICY_FREEZE_VERSION,
  V76_COLLABORATION_POLICY_VERSION,
  assertCollaborationPolicyCatalogPass,
  buildCollaborationPolicyCatalog,
  computeCollaborationDeclarativePolicyBlock,
  formatCollaborationPolicyCatalogSummary,
  getCollaborationPolicyCatalogEntriesByKind,
  getCollaborationPolicyCatalogEntryById,
  getCollaborationPolicyGateByPolicyRef,
  isCollaborationPolicyCatalogRefsAligned,
  runCollaborationPolicyCatalog,
} from "../lib/collaboration/v76/collaboration.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p2-collaboration-policy-catalog";

const REQUIRED_KINDS = [
  "role",
  "communication",
  "delegation",
  "coordination",
  "conflict",
  "governance",
  "boundary",
  "compliance",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/collaboration.policy.ts",
    "lib/collaboration/v76/collaboration.policy.catalog.ts",
    "lib/collaboration/v76/collaboration.policy.builder.ts",
    "lib/collaboration/v76/collaboration.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration policy catalog module structure");
}

function testInventories() {
  check(COLLABORATION_POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(COLLABORATION_POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isCollaborationPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getCollaborationPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates & alignment");
}

function testPolicyFields() {
  for (const entry of COLLABORATION_POLICY_CATALOG_ENTRIES) {
    check(entry.passCondition.length > 0, `${entry.id} passCondition`);
    check(entry.blockCondition.length > 0, `${entry.id} blockCondition`);
    check(entry.inventoryPolicyRef.length > 0, `${entry.id} inventoryPolicyRef`);
    check(entry.inputRef.length > 0, `${entry.id} inputRef`);
    check(entry.scopeRef.length > 0, `${entry.id} scopeRef`);
    check(entry.constraintRef.length > 0, `${entry.id} constraintRef`);
    check(entry.enforcement.length > 0, `${entry.id} enforcement`);
    check(entry.priority >= 1 && entry.priority <= 8, `${entry.id} priority`);
  }
  console.log("✓ policy field coverage");
}

function testPolicyQueries() {
  const role = getCollaborationPolicyCatalogEntryById("COL-PLC-002");
  check(role?.kind === "role", "COL-PLC-002 role");
  check(role?.priority === 2, "COL-PLC-002 priority 2");

  const communication = getCollaborationPolicyCatalogEntriesByKind("communication");
  check(communication.length >= 1, "communication policies");

  const gate = getCollaborationPolicyGateByPolicyRef("COL-PLC-008");
  check(gate?.gateKind === "compliance", "COL-PLC-008 compliance gate");

  check(
    computeCollaborationDeclarativePolicyBlock({ kind: "boundary", enforcement: "gate" }),
    "boundary gate block",
  );
  check(
    !computeCollaborationDeclarativePolicyBlock({ kind: "role", enforcement: "declarative" }),
    "role declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runCollaborationPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { collaborationInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildCollaborationPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V76_COLLABORATION_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V76_COLLABORATION_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.collaborationInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCollaborationPolicyCatalogPass(ready);

  console.log("✓ collaboration policy catalog report");
  console.log(formatCollaborationPolicyCatalogSummary(ready));
  console.log("\n✅ V76 P2 Collaboration Policy Catalog — verify PASS");
}

function main() {
  console.log("V76 P2 Collaboration Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
