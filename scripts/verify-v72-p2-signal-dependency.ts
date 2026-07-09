/**
 * V72 P2 — Signal Dependency Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertSignalDependencyPass,
  buildSignalDependency,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  formatSignalDependencySummary,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getSignalNodeById,
  getUpstreamNodes,
  isSignalDependencyRefsAligned,
  runSignalDependency,
  SIGNAL_DEPENDENCY_CATALOG,
  SIGNAL_NODE_CATALOG,
  V72_SIGNAL_DEPENDENCY_FREEZE_VERSION,
  V72_SIGNAL_DEPENDENCY_VERSION,
} from "../lib/intelligence/v72/dependency.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p2-signal-dependency";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/signal.dependency.ts",
    "lib/intelligence/v72/dependency.graph.ts",
    "lib/intelligence/v72/dependency.builder.ts",
    "lib/intelligence/v72/dependency.entry.ts",
    "docs/V72-P2-SIGNAL-DEPENDENCY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 signal dependency module structure");
}

function testInventories() {
  check(SIGNAL_NODE_CATALOG.length >= 6, "signal node catalog");
  check(SIGNAL_DEPENDENCY_CATALOG.length >= 6, "dependency catalog");
  check(isSignalDependencyRefsAligned(), "signal dependency refs aligned");

  const cycle = computeCycleCheck();
  check(cycle.acyclic, "cycle check acyclic");
  check(!cycle.cycleDetected, "no cycle detected");

  console.log("✓ nodes, dependencies & cycle check");
}

function testDependencyFields() {
  for (const dep of SIGNAL_DEPENDENCY_CATALOG) {
    check(dep.upstream.length > 0, `${dep.id} upstream`);
    check(dep.downstream.length > 0, `${dep.id} downstream`);
    check(typeof dep.required === "boolean", `${dep.id} required`);
    check(typeof dep.optional === "boolean", `${dep.id} optional`);
    check(dep.order > 0, `${dep.id} order`);
    check(dep.impact.length > 0, `${dep.id} impact`);
    check(dep.required !== dep.optional, `${dep.id} required/optional exclusive`);
  }

  for (const node of SIGNAL_NODE_CATALOG) {
    check(node.insightRef.startsWith("INT-"), `${node.id} insightRef`);
    check(node.order > 0, `${node.id} order`);
  }

  console.log("✓ dependency field coverage");
}

function testGraphQueries() {
  const node = getSignalNodeById("INT-NOD-002");
  check(node?.insightRef === "INT-002", "INT-NOD-002 insight ref");

  const dep = getDependencyById("INT-DEP-001");
  check(dep?.upstream === "INT-NOD-001", "INT-DEP-001 upstream");
  check(dep?.downstream === "INT-NOD-002", "INT-DEP-001 downstream");
  check(dep?.required === true, "INT-DEP-001 required");

  const upstream = getUpstreamNodes("INT-NOD-004");
  check(upstream.includes("INT-NOD-003"), "INT-NOD-004 upstream from policy");
  check(upstream.includes("INT-NOD-001"), "INT-NOD-004 optional upstream shortcut");

  const downstream = getDownstreamNodes("INT-NOD-001");
  check(downstream.length >= 2, "INT-NOD-001 downstream nodes");

  const critical = getDependenciesByImpact("critical");
  check(critical.length >= 1, "critical impact dependencies");

  check(computeDeclarativeImpactScore({ impact: "critical" }) === 4, "impact score critical");

  console.log("✓ graph queries");
}

function testReport() {
  const incomplete = runSignalDependency({
    deploymentId: DEPLOYMENT_ID,
    signals: { cycleCheckPass: false },
  });
  check(!incomplete.dependencyReady, "failed cycle check not ready");

  const ready = buildSignalDependency({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_SIGNAL_DEPENDENCY_VERSION, "dependency version");
  check(ready.freezeVersion === V72_SIGNAL_DEPENDENCY_FREEZE_VERSION, "freeze version");
  check(ready.intelligenceCatalogReady, "P1 catalog ready");
  check(ready.nodes.catalogComplete, "nodes complete");
  check(ready.dependencies.catalogComplete, "dependencies complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.graph.cycleCheck.acyclic, "graph acyclic");
  check(ready.dependencyReady, "dependency ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertSignalDependencyPass(ready);

  console.log("✓ signal dependency report");
  console.log(formatSignalDependencySummary(ready));
  console.log("\n✅ V72 P2 Signal Dependency — verify PASS");
}

function main() {
  console.log("V72 P2 Signal Dependency Verification\n");
  checkModuleStructure();
  testInventories();
  testDependencyFields();
  testGraphQueries();
  testReport();
}

main();
