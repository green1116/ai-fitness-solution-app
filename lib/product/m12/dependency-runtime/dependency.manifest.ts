/**
 * Product M12 — Agent Dependency Runtime manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AGENT_CATALOG_ID } from "../catalog/catalog.constants";
import {
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "./dependency.constants";
import { getAgentDependencyMetadata } from "./dependency.metadata";
import type {
  AgentDependencyManifest,
  AgentDependencyReadinessCheck,
  AgentDependencyReadinessResult,
} from "./dependency.types";
import {
  clearAgentDependencyEdges,
  isAgentDependencyGraphAcyclic,
  listAgentDependencyEdges,
} from "./edge.registry";
import {
  clearAgentDependencyGraphs,
  listAgentDependencyGraphs,
} from "./graph.registry";
import {
  clearAgentDependencyNodes,
  listAgentDependencyNodes,
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
): AgentDependencyReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAgentDependencyLayer(): void {
  clearAgentDependencyEdges();
  clearAgentDependencyNodes();
  clearAgentDependencyGraphs();
}

export function buildAgentDependencyManifest(): AgentDependencyManifest {
  const graphs = listAgentDependencyGraphs();
  const nodes = listAgentDependencyNodes();
  const edges = listAgentDependencyEdges();
  const metadata = getAgentDependencyMetadata();
  const acyclic = isAgentDependencyGraphAcyclic();

  const payload = {
    dependencyRuntimeId: PRODUCT_AGENT_DEPENDENCY_ID,
    version: PRODUCT_AGENT_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_AGENT_DEPENDENCY_BASE,
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
    dependencyRuntimeId: PRODUCT_AGENT_DEPENDENCY_ID,
    version: PRODUCT_AGENT_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
    base: PRODUCT_AGENT_DEPENDENCY_BASE,
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

export function evaluateAgentDependencyReadiness(): AgentDependencyReadinessResult {
  const checks: AgentDependencyReadinessCheck[] = [];
  const metadata = getAgentDependencyMetadata();
  const graphs = listAgentDependencyGraphs();
  const nodes = listAgentDependencyNodes();
  const edges = listAgentDependencyEdges();
  const manifest = buildAgentDependencyManifest();

  checks.push(
    check(
      "AGTDEP-BASE",
      "dependency",
      "agent catalog base aligned",
      PRODUCT_AGENT_DEPENDENCY_BASE === PRODUCT_AGENT_CATALOG_ID &&
        PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1",
      `base=${PRODUCT_AGENT_DEPENDENCY_BASE}`,
    ),
  );

  checks.push(
    check(
      "AGTDEP-META",
      "metadata",
      "Agent dependency metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AGTDEP-GRAPH",
      "graph",
      "Active dependency graphs present",
      graphs.some((g) => g.status === "ACTIVE"),
      `graphs=${graphs.length}`,
    ),
  );

  checks.push(
    check(
      "AGTDEP-NODE",
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
      "AGTDEP-EDGE",
      "edge",
      "Bound acyclic dependency edges present",
      edges.some((e) => e.status === "BOUND") && manifest.acyclic === true,
      `edges=${edges.length} acyclic=${manifest.acyclic}`,
    ),
  );

  checks.push(
    check(
      "AGTDEP-MAN",
      "manifest",
      "Agent dependency manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.dependencyRuntimeId === PRODUCT_AGENT_DEPENDENCY_ID &&
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
    summary: `product-agent-dependency readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAgentDependencyReadinessReady(
  result: AgentDependencyReadinessResult,
): asserts result is AgentDependencyReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(`product agent dependency not ready: ${result.summary}`);
  }
}
