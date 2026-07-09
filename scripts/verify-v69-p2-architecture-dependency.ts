/**
 * V69 P2 — Architecture Dependency Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG,
  ARCHITECTURE_DEPENDENCY_EDGE_CATALOG,
  ARCHITECTURE_DEPENDENCY_KIND_CATALOG,
  ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX,
  ARCHITECTURE_DEPENDENCY_ROLLBACK_INDEX,
  ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG,
  V69_ARCHITECTURE_DEPENDENCY_ARTIFACT_SURFACE,
  V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK,
  V69_ARCHITECTURE_DEPENDENCY_VERSION,
  V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK,
  architectureDependencyFreezeLockMatchesExpected,
  assertArchitectureDependencyPass,
  buildArchitectureDependencyBoundaryManifest,
  buildArchitectureDependencyEdgeManifest,
  buildArchitectureDependencyGraphManifest,
  buildArchitectureDependencyKindManifest,
  buildArchitectureDependencyRegistry,
  buildArchitectureDependencyReport,
  buildArchitectureDependencyRollbackIndex,
  buildArchitectureDependencyStrengthManifest,
  buildDeclarativeArchitectureAdjacencyList,
  computeDeclarativeCouplingAllowed,
  formatArchitectureDependencySummary,
  getDownstreamArcDefRefs,
  getEdgesFromArcDef,
  isArchitectureDependencyFreezeLockIntact,
  isArchitectureDependencyRefsAligned,
  isBoundaryAllowedForEdge,
  isDependencyRegistryIdKnown,
  isUpstreamArchitectureCatalogLockIntact,
  runArchitectureDependency,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p2-architecture-dependency";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/architecture-dependency/architecture-dependency.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.types.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.constants.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.surface.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.builder.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.entry.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.registry.ts",
    "lib/technical-governance/v69/architecture-dependency/freeze.lock.ts",
    "lib/technical-governance/v69/architecture-dependency/rollback.index.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.kind.catalog.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.strength.catalog.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.boundary.catalog.ts",
    "lib/technical-governance/v69/architecture-dependency/dependency.edge.catalog.ts",
    "lib/technical-governance/v69/architecture-dependency/alignment.catalog.ts",
    "docs/technical-governance/V69-ARCHITECTURE-DEPENDENCY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 architecture dependency module structure");
}

function testInventories() {
  check(ARCHITECTURE_DEPENDENCY_KIND_CATALOG.length >= 4, "dependency kind catalog");
  check(ARCHITECTURE_DEPENDENCY_STRENGTH_CATALOG.length >= 4, "dependency strength catalog");
  check(ARCHITECTURE_DEPENDENCY_BOUNDARY_CATALOG.length >= 5, "dependency boundary catalog");
  check(ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.length >= 6, "dependency edge catalog");
  check(isUpstreamArchitectureCatalogLockIntact(), "upstream architecture catalog lock");
  check(isArchitectureDependencyFreezeLockIntact(), "freeze lock intact");
  check(architectureDependencyFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ kinds, strengths, boundaries, edges, freeze & upstream lock");
}

function testCrossReferences() {
  check(isArchitectureDependencyRefsAligned(), "architecture dependency refs aligned");

  const apiEdges = getEdgesFromArcDef("ARC-DEF-002");
  check(apiEdges.length >= 2, "ARC-DEF-002 outbound edges");

  const adj = buildDeclarativeArchitectureAdjacencyList();
  check(Object.keys(adj).length >= 6, "adjacency node count");

  const downstream = getDownstreamArcDefRefs("ARC-DEF-001");
  check(downstream.includes("ARC-DEF-002"), "ARC-DEF-001 downstream includes ARC-DEF-002");

  check(isBoundaryAllowedForEdge("ADEP-BND-001"), "layer-adjacent boundary allowed");
  check(
    computeDeclarativeCouplingAllowed({
      strengthRef: "ADEP-STR-003",
      boundaryAllowed: true,
    }),
    "declarative coupling allowed",
  );

  check(
    V69_UPSTREAM_ARCHITECTURE_CATALOG_LOCK.architectureCatalog.length > 0,
    "P1 catalog version in lock",
  );
  check(
    V69_ARCHITECTURE_DEPENDENCY_FREEZE_LOCK.architectureDependency ===
      V69_ARCHITECTURE_DEPENDENCY_VERSION,
    "freeze lock dependency version",
  );
  console.log("✓ cross-references, adjacency & P1 alignment");
}

function testRegistryAndRollback() {
  const registry = buildArchitectureDependencyRegistry();
  check(registry.registryComplete, "dependency registry complete");
  check(registry.totalEntries >= 20, "registry total entries");
  check(isDependencyRegistryIdKnown("edges", "ADEP-EDGE-001"), "registry knows ADEP-EDGE-001");
  check(
    ARCHITECTURE_DEPENDENCY_REGISTRY_INDEX.edges.length ===
      ARCHITECTURE_DEPENDENCY_EDGE_CATALOG.length,
    "registry edge index synced",
  );

  const rollback = buildArchitectureDependencyRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(ARCHITECTURE_DEPENDENCY_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ dependency registry & rollback index");
}

function testManifests() {
  check(buildArchitectureDependencyKindManifest().catalogComplete, "kind manifest complete");
  check(
    buildArchitectureDependencyStrengthManifest().catalogComplete,
    "strength manifest complete",
  );
  check(
    buildArchitectureDependencyBoundaryManifest().catalogComplete,
    "boundary manifest complete",
  );
  check(buildArchitectureDependencyEdgeManifest().catalogComplete, "edge manifest complete");
  check(buildArchitectureDependencyGraphManifest().graphComplete, "graph manifest complete");
  console.log("✓ architecture dependency manifests");
}

function testReport() {
  const incomplete = runArchitectureDependency({
    deploymentId: DEPLOYMENT_ID,
    signals: { architectureCatalogReady: false },
  });
  check(!incomplete.dependencyReady, "incomplete catalog not ready");

  const ready = buildArchitectureDependencyReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_ARCHITECTURE_DEPENDENCY_VERSION, "dependency version");
  check(ready.architectureCatalogReady, "architecture catalog ready");
  check(ready.dependencyKinds.catalogComplete, "kinds complete");
  check(ready.dependencyStrengths.catalogComplete, "strengths complete");
  check(ready.dependencyBoundaries.catalogComplete, "boundaries complete");
  check(ready.dependencyEdges.catalogComplete, "edges complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.dependencyReady, "dependency ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertArchitectureDependencyPass(ready);

  check(
    V69_ARCHITECTURE_DEPENDENCY_ARTIFACT_SURFACE.verifyDependency.includes("verify:v69-p2"),
    "artifact surface verify script",
  );

  console.log("✓ architecture dependency report");
  console.log(formatArchitectureDependencySummary(ready));
  console.log("\n✅ V69 P2 Architecture Dependency — verify PASS");
}

function main() {
  console.log("V69 P2 Architecture Dependency Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
