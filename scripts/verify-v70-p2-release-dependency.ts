/**
 * V70 P2 — Release Dependency Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertReleaseDependencyPass,
  buildReleaseDependency,
  computeCycleCheck,
  computeDeclarativeImpactScore,
  formatReleaseDependencySummary,
  getDependenciesByImpact,
  getDependencyById,
  getDownstreamNodes,
  getReleaseNodeById,
  getUpstreamNodes,
  isReleaseDependencyRefsAligned,
  RELEASE_DEPENDENCY_CATALOG,
  RELEASE_NODE_CATALOG,
  runReleaseDependency,
  V70_RELEASE_DEPENDENCY_FREEZE_VERSION,
  V70_RELEASE_DEPENDENCY_VERSION,
} from "../lib/delivery/v70/dependency.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p2-release-dependency";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/release.dependency.ts",
    "lib/delivery/v70/dependency.graph.ts",
    "lib/delivery/v70/dependency.builder.ts",
    "lib/delivery/v70/dependency.entry.ts",
    "docs/V70-P2-RELEASE-DEPENDENCY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 release dependency module structure");
}

function testInventories() {
  check(RELEASE_NODE_CATALOG.length >= 6, "release node catalog");
  check(RELEASE_DEPENDENCY_CATALOG.length >= 6, "dependency catalog");
  check(isReleaseDependencyRefsAligned(), "release dependency refs aligned");

  const cycle = computeCycleCheck();
  check(cycle.acyclic, "cycle check acyclic");
  check(!cycle.cycleDetected, "no cycle detected");

  console.log("✓ nodes, dependencies & cycle check");
}

function testDependencyFields() {
  for (const dep of RELEASE_DEPENDENCY_CATALOG) {
    check(dep.upstream.length > 0, `${dep.id} upstream`);
    check(dep.downstream.length > 0, `${dep.id} downstream`);
    check(typeof dep.required === "boolean", `${dep.id} required`);
    check(typeof dep.optional === "boolean", `${dep.id} optional`);
    check(dep.order > 0, `${dep.id} order`);
    check(dep.impact.length > 0, `${dep.id} impact`);
    check(dep.required !== dep.optional, `${dep.id} required/optional exclusive`);
  }

  for (const node of RELEASE_NODE_CATALOG) {
    check(node.releaseRef.startsWith("DLV-REL-"), `${node.id} releaseRef`);
    check(node.order > 0, `${node.id} order`);
  }

  console.log("✓ dependency field coverage");
}

function testGraphQueries() {
  const node = getReleaseNodeById("DLV-NOD-005");
  check(node?.releaseRef === "DLV-REL-005", "DLV-NOD-005 release ref");

  const dep = getDependencyById("DLV-DEP-003");
  check(dep?.upstream === "DLV-NOD-001", "DLV-DEP-003 upstream");
  check(dep?.downstream === "DLV-NOD-005", "DLV-DEP-003 downstream");
  check(dep?.required === true, "DLV-DEP-003 required");

  const upstream = getUpstreamNodes("DLV-NOD-005");
  check(upstream.includes("DLV-NOD-001"), "DLV-NOD-005 upstream nodes");

  const downstream = getDownstreamNodes("DLV-NOD-003");
  check(downstream.length >= 2, "DLV-NOD-003 downstream nodes");

  const critical = getDependenciesByImpact("critical");
  check(critical.length >= 1, "critical impact dependencies");

  check(computeDeclarativeImpactScore({ impact: "critical" }) === 4, "impact score critical");

  console.log("✓ graph queries");
}

function testReport() {
  const incomplete = runReleaseDependency({
    deploymentId: DEPLOYMENT_ID,
    signals: { cycleCheckPass: false },
  });
  check(!incomplete.dependencyReady, "failed cycle check not ready");

  const ready = buildReleaseDependency({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V70_RELEASE_DEPENDENCY_VERSION, "dependency version");
  check(ready.freezeVersion === V70_RELEASE_DEPENDENCY_FREEZE_VERSION, "freeze version");
  check(ready.releaseCatalogReady, "P1 catalog ready");
  check(ready.nodes.catalogComplete, "nodes complete");
  check(ready.dependencies.catalogComplete, "dependencies complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.graph.cycleCheck.acyclic, "graph acyclic");
  check(ready.dependencyReady, "dependency ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertReleaseDependencyPass(ready);

  console.log("✓ release dependency report");
  console.log(formatReleaseDependencySummary(ready));
  console.log("\n✅ V70 P2 Release Dependency — verify PASS");
}

function main() {
  console.log("V70 P2 Release Dependency Verification\n");
  checkModuleStructure();
  testInventories();
  testDependencyFields();
  testGraphQueries();
  testReport();
}

main();
