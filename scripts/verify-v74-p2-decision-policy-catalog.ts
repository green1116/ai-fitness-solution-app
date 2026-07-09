/**
 * V74 P2 — Decision Policy Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionPolicyCatalogPass,
  buildDecisionPolicyCatalog,
  computeDeclarativePolicyBlock,
  formatDecisionPolicyCatalogSummary,
  getPolicyCatalogEntriesByKind,
  getPolicyCatalogEntryById,
  getPolicyGateByPolicyRef,
  isDecisionPolicyCatalogRefsAligned,
  POLICY_CATALOG_ENTRIES,
  POLICY_GATE_CATALOG,
  runDecisionPolicyCatalog,
  V74_DECISION_POLICY_FREEZE_VERSION,
  V74_DECISION_POLICY_VERSION,
} from "../lib/decision/v74/decision.policy.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p2-decision-policy-catalog";

const REQUIRED_KINDS = [
  "safety",
  "business",
  "cost",
  "quality",
  "priority",
  "confidence",
  "fallback",
  "compliance",
] as const;

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/decision.policy.ts",
    "lib/decision/v74/decision.policy.catalog.ts",
    "lib/decision/v74/decision.policy.builder.ts",
    "lib/decision/v74/decision.policy.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision policy catalog module structure");
}

function testInventories() {
  check(POLICY_CATALOG_ENTRIES.length === 8, "policy catalog entries");
  check(POLICY_GATE_CATALOG.length === 8, "policy gate catalog");
  check(isDecisionPolicyCatalogRefsAligned(), "policy catalog refs aligned");
  for (const kind of REQUIRED_KINDS) {
    check(getPolicyCatalogEntriesByKind(kind).length >= 1, `${kind} policy kind`);
  }
  console.log("✓ policies, gates & alignment");
}

function testPolicyFields() {
  for (const entry of POLICY_CATALOG_ENTRIES) {
    check(entry.passCondition.length > 0, `${entry.id} passCondition`);
    check(entry.blockCondition.length > 0, `${entry.id} blockCondition`);
    check(entry.inventoryPolicyRef.length > 0, `${entry.id} inventoryPolicyRef`);
    check(entry.inputRef.length > 0, `${entry.id} inputRef`);
    check(entry.scopeRef.length > 0, `${entry.id} scopeRef`);
    check(entry.enforcement.length > 0, `${entry.id} enforcement`);
  }
  console.log("✓ policy field coverage");
}

function testPolicyQueries() {
  const safety = getPolicyCatalogEntryById("DEC-PLC-001");
  check(safety?.kind === "safety", "DEC-PLC-001 safety");
  check(safety?.enforcement === "gate", "DEC-PLC-001 gate enforcement");

  const compliance = getPolicyCatalogEntriesByKind("compliance");
  check(compliance.length >= 1, "compliance policies");

  const gate = getPolicyGateByPolicyRef("DEC-PLC-008");
  check(gate?.gateKind === "compliance", "DEC-PLC-008 compliance gate");

  check(
    computeDeclarativePolicyBlock({ kind: "safety", enforcement: "gate" }),
    "safety gate block",
  );
  check(
    !computeDeclarativePolicyBlock({ kind: "business", enforcement: "declarative" }),
    "business declarative no block",
  );

  console.log("✓ policy queries");
}

function testReport() {
  const incomplete = runDecisionPolicyCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { decisionInventoryReady: false },
  });
  check(!incomplete.catalogReady, "incomplete inventory not ready");

  const ready = buildDecisionPolicyCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V74_DECISION_POLICY_VERSION, "policy catalog version");
  check(ready.freezeVersion === V74_DECISION_POLICY_FREEZE_VERSION, "freeze version");
  check(ready.decisionInventoryReady, "P1 inventory ready");
  check(ready.catalog.catalogComplete, "catalog complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDecisionPolicyCatalogPass(ready);

  console.log("✓ decision policy catalog report");
  console.log(formatDecisionPolicyCatalogSummary(ready));
  console.log("\n✅ V74 P2 Decision Policy Catalog — verify PASS");
}

function main() {
  console.log("V74 P2 Decision Policy Catalog Verification\n");
  checkModuleStructure();
  testInventories();
  testPolicyFields();
  testPolicyQueries();
  testReport();
}

main();
