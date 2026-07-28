/**
 * Product M12 — Agent Dependency Release Gate
 * MODULE: Agent Dependency (M12-P3)
 * BASE: enterprise-product-agent-catalog-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AGENT_CATALOG_ID } from "../catalog/catalog.constants";
import {
  AGENT_DEPENDENCY_EDGE_STATUSES,
  AGENT_DEPENDENCY_GRAPH_KINDS,
  AGENT_DEPENDENCY_GRAPH_STATUSES,
  AGENT_DEPENDENCY_IMPACTS,
  AGENT_DEPENDENCY_NODE_STATUSES,
  AGENT_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "../dependency-runtime/dependency.constants";
import {
  assertAgentDependencyReadinessReady,
  buildAgentDependencyManifest,
  clearAgentDependencyLayer,
  evaluateAgentDependencyReadiness,
} from "../dependency-runtime/dependency.manifest";
import {
  getAgentDependencyMetadata,
  isAgentDependencyMetadataIntact,
} from "../dependency-runtime/dependency.metadata";
import { bindAgentDependencyEdge } from "../dependency-runtime/edge.registry";
import {
  registerAgentDependencyGraph,
  updateAgentDependencyGraphStatus,
} from "../dependency-runtime/graph.registry";
import {
  registerAgentDependencyNode,
  updateAgentDependencyNodeStatus,
} from "../dependency-runtime/node.registry";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AGENT_DEPENDENCY_SIGNOFF_VERSION =
  "product-agent-dependency-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAgentDependencyLayer();
}

export function checkProductAgentDependencyReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAgentDependencyMetadata();

  checks.push(
    check(
      "AGTDEP-CONSTANTS",
      "dependency-runtime",
      "Product agent dependency version constants",
      PRODUCT_AGENT_DEPENDENCY_ID ===
        "enterprise-product-agent-dependency-v1" &&
        PRODUCT_AGENT_DEPENDENCY_VERSION === "product-agent-dependency-1" &&
        PRODUCT_AGENT_DEPENDENCY_BASE === PRODUCT_AGENT_CATALOG_ID &&
        PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION ===
          "product-agent-dependency-freeze-1" &&
        PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG ===
          "product-agent-dependency-freeze-1" &&
        AGENT_DEPENDENCY_GRAPH_KINDS.length === 4 &&
        AGENT_DEPENDENCY_GRAPH_STATUSES.length === 4 &&
        AGENT_DEPENDENCY_NODE_STATUSES.length === 4 &&
        AGENT_DEPENDENCY_EDGE_STATUSES.length === 3 &&
        AGENT_DEPENDENCY_IMPACTS.length === 4 &&
        AGENT_DEPENDENCY_READINESS_VERDICTS.length === 3 &&
        isAgentDependencyMetadataIntact(metadata),
      `id=${PRODUCT_AGENT_DEPENDENCY_ID} base=${PRODUCT_AGENT_DEPENDENCY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AGTDEP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AGTDEP-UPSTREAM",
      "compatibility",
      "Depends on agent catalog chain",
      PRODUCT_AGENT_DEPENDENCY_BASE ===
        "enterprise-product-agent-catalog-v1" &&
        PRODUCT_AGENT_CATALOG_ID === "enterprise-product-agent-catalog-v1",
      `catalog=${PRODUCT_AGENT_CATALOG_ID}`,
    ),
  );

  try {
    cleanup();

    const graph = registerAgentDependencyGraph({
      id: "agtdep.gate.graph",
      graphKey: "DOMAIN_FITNESS_GRAPH",
      kind: "DOMAIN",
      title: "Domain fitness agent dependency graph",
      summary: "Declared dependency graph for catalog reuse",
    });
    const active = updateAgentDependencyGraphStatus({
      graphId: graph.id,
      status: "ACTIVE",
    });
    const upstream = registerAgentDependencyNode({
      id: "agtdep.gate.up",
      graphId: graph.id,
      nodeKey: "FLEET_ROOT",
      sequence: 1,
      catalogKeyRef: "DOMAIN_FITNESS_FLEET",
      summary: "Soft-ref upstream catalog node",
    });
    const downstream = registerAgentDependencyNode({
      id: "agtdep.gate.down",
      graphId: graph.id,
      nodeKey: "PLANNER_LEAF",
      sequence: 2,
      catalogKeyRef: "DOMAIN_FITNESS_FLEET",
      summary: "Soft-ref downstream catalog node",
    });
    const declaredUp = updateAgentDependencyNodeStatus({
      nodeId: upstream.id,
      status: "DECLARED",
    });
    const declaredDown = updateAgentDependencyNodeStatus({
      nodeId: downstream.id,
      status: "DECLARED",
    });
    const edge = bindAgentDependencyEdge({
      id: "agtdep.gate.edge",
      graphId: graph.id,
      edgeKey: "FLEET_REQUIRES_PLANNER",
      upstreamNodeId: upstream.id,
      downstreamNodeId: downstream.id,
      impact: "HIGH",
      required: true,
    });
    const manifest = buildAgentDependencyManifest();
    const readiness = evaluateAgentDependencyReadiness();

    const ok =
      graph.graphKey === "DOMAIN_FITNESS_GRAPH" &&
      active.status === "ACTIVE" &&
      declaredUp.status === "DECLARED" &&
      declaredDown.status === "DECLARED" &&
      declaredUp.catalogKeyRef === "DOMAIN_FITNESS_FLEET" &&
      edge.status === "BOUND" &&
      edge.impact === "HIGH" &&
      manifest.acyclic === true &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAgentDependencyReadinessReady(readiness);
      checks.push(
        check(
          "AGTDEP-STACK",
          "agent-dependency",
          "Graph / node / edge / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AGTDEP-STACK",
          "agent-dependency",
          "Graph / node / edge / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product agent dependency not ready",
        ),
      );
    }

    checks.push(
      check(
        "AGTDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "agent-dependency-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product agent dependency probe failed";
    checks.push(
      check(
        "AGTDEP-STACK",
        "agent-dependency",
        "Graph / node / edge / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AGTDEP-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / agent execution / tool runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-agent-dependency-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAgentDependencyReleaseGatePass(
  gate: ReleaseGateResult = checkProductAgentDependencyReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product agent dependency release gate failed: ${gate.summary}`,
    );
  }
}
