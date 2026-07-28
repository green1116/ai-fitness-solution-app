/**
 * Product M14 — Intelligence Dependency Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_INTELLIGENCE_CATALOG_ID } from "../catalog-runtime/catalog.constants";
import {
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "./dependency.constants";
import { getIntelligenceDependencyMetadata } from "./dependency.metadata";
import type {
  IntelligenceDependencyManifest,
  IntelligenceDependencyReadinessCheck,
  IntelligenceDependencyReadinessResult,
} from "./dependency.types";
import {
  clearIntelligenceDependencyEdges,
  isIntelligenceDependencyGraphAcyclic,
  listIntelligenceDependencyEdges,
} from "./edge.registry";
import {
  clearIntelligenceDependencyGraphs,
  listIntelligenceDependencyGraphs,
} from "./graph.registry";
import {
  clearIntelligenceDependencyNodes,
  listIntelligenceDependencyNodes,
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
): IntelligenceDependencyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearIntelligenceDependencyLayer(): void {
  clearIntelligenceDependencyEdges();
  clearIntelligenceDependencyNodes();
  clearIntelligenceDependencyGraphs();
}

export function buildIntelligenceDependencyManifest(): IntelligenceDependencyManifest {
  const graphs = listIntelligenceDependencyGraphs();
  const nodes = listIntelligenceDependencyNodes();
  const edges = listIntelligenceDependencyEdges();
  const metadata = getIntelligenceDependencyMetadata();
  const acyclic = isIntelligenceDependencyGraphAcyclic();

  const payload = {
    dependencyRuntimeId: PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
    version: PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
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
    dependencyRuntimeId: PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
    version: PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
    graphCount: graphs.length,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    acyclic,
    checksum: createHash("sha256").update(JSON.stringify(payload)).digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateIntelligenceDependencyReadiness(): IntelligenceDependencyReadinessResult {
  const checks: IntelligenceDependencyReadinessCheck[] = [];
  const metadata = getIntelligenceDependencyMetadata();
  const graphs = listIntelligenceDependencyGraphs();
  const nodes = listIntelligenceDependencyNodes();
  const edges = listIntelligenceDependencyEdges();
  const manifest = buildIntelligenceDependencyManifest();

  checks.push(
    check(
      "INTDEP-BASE",
      "dependency-runtime",
      "intelligence catalog base aligned",
      PRODUCT_INTELLIGENCE_DEPENDENCY_BASE === PRODUCT_INTELLIGENCE_CATALOG_ID &&
        PRODUCT_INTELLIGENCE_CATALOG_ID ===
          "enterprise-product-intelligence-catalog-v1",
      `base=${PRODUCT_INTELLIGENCE_DEPENDENCY_BASE}`,
    ),
  );

  checks.push(
    check(
      "INTDEP-META",
      "metadata",
      "Intelligence dependency metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "INTDEP-GRAPH",
      "graph",
      "Active dependency graphs present",
      graphs.some((g) => g.status === "ACTIVE"),
      `graphs=${graphs.length}`,
    ),
  );

  checks.push(
    check(
      "INTDEP-NODE",
      "node",
      "Declared dependency nodes with soft catalog refs",
      nodes.some((n) => n.status === "DECLARED" && n.catalogKeyRef.length > 0),
      `nodes=${nodes.length}`,
    ),
  );

  checks.push(
    check(
      "INTDEP-EDGE",
      "edge",
      "Bound acyclic dependency edges present",
      edges.some((e) => e.status === "BOUND") && manifest.acyclic === true,
      `edges=${edges.length} acyclic=${manifest.acyclic}`,
    ),
  );

  checks.push(
    check(
      "INTDEP-MAN",
      "manifest",
      "Intelligence dependency manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.dependencyRuntimeId === PRODUCT_INTELLIGENCE_DEPENDENCY_ID &&
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
    summary: `product-intelligence-dependency readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntelligenceDependencyReadinessReady(
  result: IntelligenceDependencyReadinessResult,
): asserts result is IntelligenceDependencyReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product intelligence dependency not ready: ${result.summary}`,
    );
  }
}
