/**
 * V68 P2 — Dependency Graph Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DEPENDENCY_EDGE_CATALOG,
  DEPENDENCY_TYPE_CATALOG,
  V68_DEPENDENCY_GRAPH_ARTIFACT_SURFACE,
  V68_DEPENDENCY_GRAPH_VERSION,
  V68_UPSTREAM_SERVICE_CATALOG_LOCK,
  assertDependencyGraphPass,
  buildDeclarativeAdjacencyList,
  buildDependencyEdgeManifest,
  buildDependencyGraphManifest,
  buildDependencyGraphReport,
  buildDependencyTypeManifest,
  formatDependencyGraphSummary,
  getDownstreamRefs,
  getEdgesFromService,
  isDependencyGraphRefsAligned,
  isUpstreamServiceCatalogLockIntact,
  runDependencyGraph,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p2-dependency-graph";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/dependency-graph/graph.ts",
    "lib/platform/v68/dependency-graph/graph.types.ts",
    "lib/platform/v68/dependency-graph/graph.constants.ts",
    "lib/platform/v68/dependency-graph/graph.surface.ts",
    "lib/platform/v68/dependency-graph/graph.builder.ts",
    "lib/platform/v68/dependency-graph/graph.entry.ts",
    "lib/platform/v68/dependency-graph/dependency.type.catalog.ts",
    "lib/platform/v68/dependency-graph/dependency.edge.catalog.ts",
    "lib/platform/v68/dependency-graph/alignment.catalog.ts",
    "docs/platform/V68-DEPENDENCY-GRAPH.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 dependency graph module structure");
}

function testInventories() {
  check(DEPENDENCY_TYPE_CATALOG.length >= 4, "dependency type catalog");
  check(DEPENDENCY_EDGE_CATALOG.length >= 6, "dependency edge catalog");
  check(isUpstreamServiceCatalogLockIntact(), "upstream service catalog lock");
  console.log("✓ dependency types, edges & upstream lock");
}

function testCrossReferences() {
  check(isDependencyGraphRefsAligned(), "dependency graph refs aligned");

  const apiEdges = getEdgesFromService("SVC-DEF-001");
  check(apiEdges.length >= 2, "production-api outbound edges");

  const adj = buildDeclarativeAdjacencyList();
  check(Object.keys(adj).length >= 6, "adjacency node count");

  const downstream = getDownstreamRefs("SVC-DEF-001");
  check(downstream.includes("SVC-DEF-002"), "SVC-DEF-001 downstream includes health-probe");

  check(
    V68_UPSTREAM_SERVICE_CATALOG_LOCK.serviceCatalog.length > 0,
    "P1 catalog version in lock",
  );
  console.log("✓ cross-references, adjacency & P1 alignment");
}

function testManifests() {
  check(buildDependencyTypeManifest().catalogComplete, "type manifest complete");
  check(buildDependencyEdgeManifest().catalogComplete, "edge manifest complete");
  check(buildDependencyGraphManifest().graphComplete, "graph manifest complete");
  console.log("✓ dependency graph manifests");
}

function testReport() {
  const incomplete = runDependencyGraph({
    deploymentId: DEPLOYMENT_ID,
    signals: { serviceCatalogReady: false },
  });
  check(!incomplete.graphReady, "incomplete catalog not ready");

  const ready = buildDependencyGraphReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_DEPENDENCY_GRAPH_VERSION, "graph version");
  check(ready.serviceCatalogReady, "service catalog ready");
  check(ready.dependencyTypes.catalogComplete, "types complete");
  check(ready.dependencyEdges.catalogComplete, "edges complete");
  check(ready.graph.graphComplete, "graph complete");
  check(ready.graphReady, "graph ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertDependencyGraphPass(ready);

  check(
    V68_DEPENDENCY_GRAPH_ARTIFACT_SURFACE.verifyGraph.includes("verify:v68-p2"),
    "artifact surface verify script",
  );

  console.log("✓ dependency graph report");
  console.log(formatDependencyGraphSummary(ready));
  console.log("\n✅ V68 P2 Dependency Graph — verify PASS");
}

function main() {
  console.log("V68 P2 Dependency Graph Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
