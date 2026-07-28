/**
 * Product M13 — OS Dependency Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_OS_CATALOG_ID } from "../catalog-runtime/catalog.constants";
import {
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "./dependency.constants";
import { getOsDependencyMetadata } from "./dependency.metadata";
import type {
  OsDependencyManifest,
  OsDependencyReadinessCheck,
  OsDependencyReadinessResult,
} from "./dependency.types";
import {
  clearOsDependencyEdges,
  isOsDependencyGraphAcyclic,
  listOsDependencyEdges,
} from "./edge.registry";
import {
  clearOsDependencyGraphs,
  listOsDependencyGraphs,
} from "./graph.registry";
import {
  clearOsDependencyNodes,
  listOsDependencyNodes,
} from "./node.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OsDependencyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsDependencyLayer(): void {
  clearOsDependencyEdges();
  clearOsDependencyNodes();
  clearOsDependencyGraphs();
}

export function buildOsDependencyManifest(): OsDependencyManifest {
  const graphs = listOsDependencyGraphs();
  const nodes = listOsDependencyNodes();
  const edges = listOsDependencyEdges();
  const metadata = getOsDependencyMetadata();
  const acyclic = isOsDependencyGraphAcyclic();

  const payload = {
    dependencyRuntimeId: PRODUCT_OS_DEPENDENCY_ID,
    version: PRODUCT_OS_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_OS_DEPENDENCY_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    acyclic,
    graphs: graphs.map((g) => ({
      graphKey: g.graphKey,
      kind: g.kind,
      status: g.status,
    })),
    nodes: nodes.map((n) => ({
      nodeKey: n.nodeKey,
      sequence: n.sequence,
      status: n.status,
      graphId: n.graphId,
      catalogKeyRef: n.catalogKeyRef,
    })),
    edges: edges.map((e) => ({
      edgeKey: e.edgeKey,
      upstreamNodeId: e.upstreamNodeId,
      downstreamNodeId: e.downstreamNodeId,
      impact: e.impact,
      status: e.status,
      graphId: e.graphId,
    })),
  };

  return {
    dependencyRuntimeId: PRODUCT_OS_DEPENDENCY_ID,
    version: PRODUCT_OS_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_OS_DEPENDENCY_BASE,
    graphCount: graphs.length,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    acyclic,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateOsDependencyReadiness(): OsDependencyReadinessResult {
  const checks: OsDependencyReadinessCheck[] = [];
  const metadata = getOsDependencyMetadata();
  const graphs = listOsDependencyGraphs();
  const nodes = listOsDependencyNodes();
  const edges = listOsDependencyEdges();
  const manifest = buildOsDependencyManifest();

  checks.push(
    check(
      "OSDEP-BASE",
      "dependency",
      "os catalog base aligned",
      PRODUCT_OS_DEPENDENCY_BASE === PRODUCT_OS_CATALOG_ID &&
        PRODUCT_OS_CATALOG_ID === "enterprise-product-os-catalog-v1",
      `base=${PRODUCT_OS_DEPENDENCY_BASE}`,
    ),
  );

  checks.push(
    check(
      "OSDEP-META",
      "metadata",
      "OS dependency metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OSDEP-GRAPH",
      "graph",
      "Active dependency graphs present",
      graphs.some((g) => g.status === "ACTIVE"),
      `graphs=${graphs.length}`,
    ),
  );

  checks.push(
    check(
      "OSDEP-NODE",
      "node",
      "Declared dependency nodes with soft catalog refs",
      nodes.some(
        (n) => n.status === "DECLARED" && n.catalogKeyRef.length > 0,
      ),
      `nodes=${nodes.length}`,
    ),
  );

  checks.push(
    check(
      "OSDEP-EDGE",
      "edge",
      "Bound acyclic dependency edges present",
      edges.some((e) => e.status === "BOUND") && manifest.acyclic === true,
      `edges=${edges.length} acyclic=${manifest.acyclic}`,
    ),
  );

  checks.push(
    check(
      "OSDEP-MAN",
      "manifest",
      "OS dependency manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.dependencyRuntimeId === PRODUCT_OS_DEPENDENCY_ID &&
        manifest.graphCount >= 1 &&
        manifest.nodeCount >= 2 &&
        manifest.edgeCount >= 1 &&
        manifest.acyclic === true,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-os-dependency readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsDependencyReadinessReady(
  result: OsDependencyReadinessResult,
): asserts result is OsDependencyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os dependency not ready: ${result.summary}`);
  }
}
