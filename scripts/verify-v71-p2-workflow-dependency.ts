/**
 * V71 P2 — Workflow Dependency Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowDependencyPass,
  buildWorkflowDependency,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  formatWorkflowDependencySummary,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getUpstreamNodes,
  getWorkflowNodeById,
  isWorkflowDependencyRefsAligned,
  runWorkflowDependency,
  V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION,
  V71_WORKFLOW_DEPENDENCY_VERSION,
  WORKFLOW_DEPENDENCY_CATALOG,
  WORKFLOW_NODE_CATALOG,
} from "../lib/orchestration/v71/dependency.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p2-workflow-dependency";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/workflow.dependency.ts",
    "lib/orchestration/v71/dependency.graph.ts",
    "lib/orchestration/v71/dependency.builder.ts",
    "lib/orchestration/v71/dependency.entry.ts",
    "docs/V71-P2-WORKFLOW-DEPENDENCY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow dependency module structure");
}

function testInventories() {
  check(WORKFLOW_NODE_CATALOG.length >= 6, "workflow node catalog");
  check(WORKFLOW_DEPENDENCY_CATALOG.length >= 6, "dependency catalog");
  check(isWorkflowDependencyRefsAligned(), "workflow dependency refs aligned");

  const cycle = computeCycleCheck();
  check(cycle.acyclic, "cycle check acyclic");
  check(!cycle.cycleDetected, "no cycle detected");

  console.log("✓ nodes, dependencies & cycle check");
}

function testDependencyFields() {
  for (const dep of WORKFLOW_DEPENDENCY_CATALOG) {
    check(dep.upstream.length > 0, `${dep.id} upstream`);
    check(dep.downstream.length > 0, `${dep.id} downstream`);
    check(typeof dep.required === "boolean", `${dep.id} required`);
    check(typeof dep.optional === "boolean", `${dep.id} optional`);
    check(dep.order > 0, `${dep.id} order`);
    check(dep.impact.length > 0, `${dep.id} impact`);
    check(dep.required !== dep.optional, `${dep.id} required/optional exclusive`);
  }

  for (const node of WORKFLOW_NODE_CATALOG) {
    check(node.orchestrationRef.startsWith("ORC-"), `${node.id} orchestrationRef`);
    check(node.order > 0, `${node.id} order`);
  }

  console.log("✓ dependency field coverage");
}

function testGraphQueries() {
  const node = getWorkflowNodeById("ORC-NOD-002");
  check(node?.orchestrationRef === "ORC-002", "ORC-NOD-002 orchestration ref");

  const dep = getDependencyById("ORC-DEP-001");
  check(dep?.upstream === "ORC-NOD-001", "ORC-DEP-001 upstream");
  check(dep?.downstream === "ORC-NOD-002", "ORC-DEP-001 downstream");
  check(dep?.required === true, "ORC-DEP-001 required");

  const upstream = getUpstreamNodes("ORC-NOD-004");
  check(upstream.includes("ORC-NOD-003"), "ORC-NOD-004 upstream from policy gate");
  check(upstream.includes("ORC-NOD-001"), "ORC-NOD-004 optional upstream shortcut");

  const downstream = getDownstreamNodes("ORC-NOD-001");
  check(downstream.length >= 2, "ORC-NOD-001 downstream nodes");

  const critical = getDependenciesByImpact("critical");
  check(critical.length >= 1, "critical impact dependencies");

  check(computeDeclarativeImpactScore({ impact: "critical" }) === 4, "impact score critical");

  console.log("✓ graph queries");
}

function testReport() {
  const incomplete = runWorkflowDependency({
    deploymentId: DEPLOYMENT_ID,
    signals: { cycleCheckPass: false },
  });
  check(!incomplete.dependencyReady, "failed cycle check not ready");

  const ready = buildWorkflowDependency({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V71_WORKFLOW_DEPENDENCY_VERSION, "dependency version");
  check(ready.freezeVersion === V71_WORKFLOW_DEPENDENCY_FREEZE_VERSION, "freeze version");
  check(ready.orchestrationCatalogReady, "P1 catalog ready");
  check(ready.nodes.catalogComplete, "nodes complete");
  check(ready.dependencies.catalogComplete, "dependencies complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.graph.cycleCheck.acyclic, "graph acyclic");
  check(ready.dependencyReady, "dependency ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertWorkflowDependencyPass(ready);

  console.log("✓ workflow dependency report");
  console.log(formatWorkflowDependencySummary(ready));
  console.log("\n✅ V71 P2 Workflow Dependency — verify PASS");
}

function main() {
  console.log("V71 P2 Workflow Dependency Verification\n");
  checkModuleStructure();
  testInventories();
  testDependencyFields();
  testGraphQueries();
  testReport();
}

main();
