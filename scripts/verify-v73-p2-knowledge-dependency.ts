/**
 * V73 P2 — Knowledge Dependency Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeDependencyPass,
  buildKnowledgeDependency,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  formatKnowledgeDependencySummary,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getKnowledgeNodeById,
  getUpstreamNodes,
  isKnowledgeDependencyRefsAligned,
  KNOWLEDGE_DEPENDENCY_CATALOG,
  KNOWLEDGE_NODE_CATALOG,
  runKnowledgeDependency,
  V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  V73_KNOWLEDGE_DEPENDENCY_VERSION,
} from "../lib/knowledge/v73/dependency.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p2-knowledge-dependency";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/knowledge.dependency.ts",
    "lib/knowledge/v73/dependency.graph.ts",
    "lib/knowledge/v73/dependency.builder.ts",
    "lib/knowledge/v73/dependency.entry.ts",
    "docs/V73-P2-KNOWLEDGE-DEPENDENCY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge dependency module structure");
}

function testInventories() {
  check(KNOWLEDGE_NODE_CATALOG.length >= 6, "knowledge node catalog");
  check(KNOWLEDGE_DEPENDENCY_CATALOG.length >= 6, "dependency catalog");
  check(isKnowledgeDependencyRefsAligned(), "knowledge dependency refs aligned");

  const cycle = computeCycleCheck();
  check(cycle.acyclic, "cycle check acyclic");
  check(!cycle.cycleDetected, "no cycle detected");

  console.log("✓ nodes, dependencies & cycle check");
}

function testDependencyFields() {
  for (const dep of KNOWLEDGE_DEPENDENCY_CATALOG) {
    check(dep.upstream.length > 0, `${dep.id} upstream`);
    check(dep.downstream.length > 0, `${dep.id} downstream`);
    check(typeof dep.required === "boolean", `${dep.id} required`);
    check(typeof dep.optional === "boolean", `${dep.id} optional`);
    check(dep.order > 0, `${dep.id} order`);
    check(dep.impact.length > 0, `${dep.id} impact`);
    check(dep.required !== dep.optional, `${dep.id} required/optional exclusive`);
  }

  for (const node of KNOWLEDGE_NODE_CATALOG) {
    check(node.knowledgeRef.startsWith("KNW-"), `${node.id} knowledgeRef`);
    check(node.order > 0, `${node.id} order`);
  }

  console.log("✓ dependency field coverage");
}

function testGraphQueries() {
  const node = getKnowledgeNodeById("KNW-NOD-002");
  check(node?.knowledgeRef === "KNW-002", "KNW-NOD-002 knowledge ref");

  const dep = getDependencyById("KNW-DEP-001");
  check(dep?.upstream === "KNW-NOD-001", "KNW-DEP-001 upstream");
  check(dep?.downstream === "KNW-NOD-002", "KNW-DEP-001 downstream");
  check(dep?.required === true, "KNW-DEP-001 required");

  const upstream = getUpstreamNodes("KNW-NOD-004");
  check(upstream.includes("KNW-NOD-003"), "KNW-NOD-004 upstream from policy");
  check(upstream.includes("KNW-NOD-001"), "KNW-NOD-004 optional upstream shortcut");

  const downstream = getDownstreamNodes("KNW-NOD-001");
  check(downstream.length >= 2, "KNW-NOD-001 downstream nodes");

  const critical = getDependenciesByImpact("critical");
  check(critical.length >= 1, "critical impact dependencies");

  check(computeDeclarativeImpactScore({ impact: "critical" }) === 4, "impact score critical");

  console.log("✓ graph queries");
}

function testReport() {
  const incomplete = runKnowledgeDependency({
    deploymentId: DEPLOYMENT_ID,
    signals: { cycleCheckPass: false },
  });
  check(!incomplete.dependencyReady, "failed cycle check not ready");

  const ready = buildKnowledgeDependency({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_DEPENDENCY_VERSION, "dependency version");
  check(ready.freezeVersion === V73_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION, "freeze version");
  check(ready.knowledgeCatalogReady, "P1 catalog ready");
  check(ready.nodes.catalogComplete, "nodes complete");
  check(ready.dependencies.catalogComplete, "dependencies complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.graph.cycleCheck.acyclic, "graph acyclic");
  check(ready.dependencyReady, "dependency ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgeDependencyPass(ready);

  console.log("✓ knowledge dependency report");
  console.log(formatKnowledgeDependencySummary(ready));
  console.log("\n✅ V73 P2 Knowledge Dependency — verify PASS");
}

function main() {
  console.log("V73 P2 Knowledge Dependency Verification\n");
  checkModuleStructure();
  testInventories();
  testDependencyFields();
  testGraphQueries();
  testReport();
}

main();
