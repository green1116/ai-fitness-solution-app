/**
 * Product M11 — Knowledge Dependency Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_KNOWLEDGE_CATALOG_ID } from "../catalog/catalog.constants";
import {
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./dependency.constants";
import { getKnowledgeDependencyMetadata } from "./dependency.metadata";
import type {
  KnowledgeDependencyManifest,
  KnowledgeDependencyReadinessCheck,
  KnowledgeDependencyReadinessResult,
} from "./dependency.types";
import {
  clearKnowledgeDependencyEdges,
  isKnowledgeDependencyGraphAcyclic,
  listKnowledgeDependencyEdges,
} from "./edge.registry";
import {
  clearKnowledgeDependencyGraphs,
  listKnowledgeDependencyGraphs,
} from "./graph.registry";
import {
  clearKnowledgeDependencyNodes,
  listKnowledgeDependencyNodes,
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
): KnowledgeDependencyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearKnowledgeDependencyLayer(): void {
  clearKnowledgeDependencyEdges();
  clearKnowledgeDependencyNodes();
  clearKnowledgeDependencyGraphs();
}

export function buildKnowledgeDependencyManifest(): KnowledgeDependencyManifest {
  const graphs = listKnowledgeDependencyGraphs();
  const nodes = listKnowledgeDependencyNodes();
  const edges = listKnowledgeDependencyEdges();
  const metadata = getKnowledgeDependencyMetadata();
  const acyclic = isKnowledgeDependencyGraphAcyclic();

  const payload = {
    dependencyRuntimeId: PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
    version: PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
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
    dependencyRuntimeId: PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
    version: PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
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

export function evaluateKnowledgeDependencyReadiness(): KnowledgeDependencyReadinessResult {
  const checks: KnowledgeDependencyReadinessCheck[] = [];
  const metadata = getKnowledgeDependencyMetadata();
  const graphs = listKnowledgeDependencyGraphs();
  const nodes = listKnowledgeDependencyNodes();
  const edges = listKnowledgeDependencyEdges();
  const manifest = buildKnowledgeDependencyManifest();

  checks.push(
    check(
      "KNWDEP-BASE",
      "dependency",
      "knowledge catalog base aligned",
      PRODUCT_KNOWLEDGE_DEPENDENCY_BASE === PRODUCT_KNOWLEDGE_CATALOG_ID &&
        PRODUCT_KNOWLEDGE_CATALOG_ID ===
          "enterprise-product-knowledge-catalog-v1",
      `base=${PRODUCT_KNOWLEDGE_DEPENDENCY_BASE}`,
    ),
  );

  checks.push(
    check(
      "KNWDEP-META",
      "metadata",
      "Knowledge dependency metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "KNWDEP-GRAPH",
      "graph",
      "Active dependency graphs present",
      graphs.some((g) => g.status === "ACTIVE"),
      `graphs=${graphs.length}`,
    ),
  );

  checks.push(
    check(
      "KNWDEP-NODE",
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
      "KNWDEP-EDGE",
      "edge",
      "Bound acyclic dependency edges present",
      edges.some((e) => e.status === "BOUND") && manifest.acyclic === true,
      `edges=${edges.length} acyclic=${manifest.acyclic}`,
    ),
  );

  checks.push(
    check(
      "KNWDEP-MAN",
      "manifest",
      "Knowledge dependency manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.dependencyRuntimeId === PRODUCT_KNOWLEDGE_DEPENDENCY_ID &&
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
    summary: `product-knowledge-dependency readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertKnowledgeDependencyReadinessReady(
  result: KnowledgeDependencyReadinessResult,
): asserts result is KnowledgeDependencyReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product knowledge dependency not ready: ${result.summary}`,
    );
  }
}
